"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 10;

type FoodLog = {
  id: string;
  rating: number;
  review: string | null;
  photo: string | null;
  eaten_at: string;
  created_at: string;

  dishes: {
    name: string;
    slug: string;
    image: string | null;
  } | null;

  restaurants: {
    name: string;
    slug: string;
    city: string | null;
  } | null;
};

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

type LoadLogsResult = {
  logs: FoodLog[];
  hasMore: boolean;
};

export default function FoodLogHistory() {
  const [supabase] = useState(() => createClient());

  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] =
    useState<SortOption>("newest");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogsForPage = useCallback(
    async (
      pageNumber: number
    ): Promise<LoadLogsResult> => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be logged in to view your diary."
        );
      }

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: queryError } =
        await supabase
          .from("food_logs")
          .select(`
            id,
            rating,
            review,
            photo,
            eaten_at,
            created_at,
            dishes (
              name,
              slug,
              image
            ),
            restaurants (
              name,
              slug,
              city
            )
          `)
          .eq("user_id", user.id)
          .order("eaten_at", {
            ascending: false,
          })
          .range(from, to)
          .overrideTypes<
            FoodLog[],
            { merge: false }
          >();

      if (queryError) {
        throw new Error(queryError.message);
      }

      const newLogs = await Promise.all(
        (data ?? []).map(async (log) => {
          if (!log.photo) {
            return log;
          }

          const {
            data: signedUrlData,
            error: signedUrlError,
          } = await supabase.storage
            .from("food-photos")
            .createSignedUrl(
              log.photo,
              60 * 60
            );

          if (signedUrlError) {
            return {
              ...log,
              photo: null,
            };
          }

          return {
            ...log,
            photo:
              signedUrlData?.signedUrl ?? null,
          };
        })
      );

      return {
        logs: newLogs,
        hasMore: newLogs.length === PAGE_SIZE,
      };
    },
    [supabase]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialLogs() {
      try {
        const result =
          await fetchLogsForPage(0);

        if (cancelled) {
          return;
        }

        setLogs(result.logs);
        setHasMore(result.hasMore);
        setPage(0);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your diary."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialLogs();

    return () => {
      cancelled = true;
    };
  }, [fetchLogsForPage]);

  const displayedLogs = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    const filtered = logs.filter((log) => {
      if (!searchTerm) {
        return true;
      }

      const dishName =
        log.dishes?.name?.toLowerCase() ?? "";

      const restaurantName =
        log.restaurants?.name?.toLowerCase() ?? "";

      const review =
        log.review?.toLowerCase() ?? "";

      return (
        dishName.includes(searchTerm) ||
        restaurantName.includes(searchTerm) ||
        review.includes(searchTerm)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "newest") {
        return (
          new Date(b.eaten_at).getTime() -
          new Date(a.eaten_at).getTime()
        );
      }

      if (sort === "oldest") {
        return (
          new Date(a.eaten_at).getTime() -
          new Date(b.eaten_at).getTime()
        );
      }

      if (sort === "highest") {
        return (
          Number(b.rating) -
          Number(a.rating)
        );
      }

      return (
        Number(a.rating) -
        Number(b.rating)
      );
    });
  }, [logs, search, sort]);

  async function handleLoadMore() {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError("");

    const nextPage = page + 1;

    try {
      const result =
        await fetchLogsForPage(nextPage);

      setLogs((current) => [
        ...current,
        ...result.logs,
      ]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load more diary entries."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8">
        <p className="text-sm text-neutral-500">
          Loading your diary...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
        <h2 className="text-xl font-bold">
          Your diary is empty
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Start logging your meals to build your
          personal food diary.
        </p>

        <Link
          href="/log"
          className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          + Log your first meal
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search your diary..."
            className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3.5 pr-12 text-sm outline-none transition focus:border-black"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 hover:text-black"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(event) =>
            setSort(
              event.target.value as SortOption
            )
          }
          className="rounded-full border border-neutral-300 bg-white px-5 py-3.5 text-sm outline-none focus:border-black"
        >
          <option value="newest">
            Newest first
          </option>

          <option value="oldest">
            Oldest first
          </option>

          <option value="highest">
            Highest rated
          </option>

          <option value="lowest">
            Lowest rated
          </option>
        </select>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        Showing {displayedLogs.length}{" "}
        {displayedLogs.length === 1
          ? "meal"
          : "meals"}
        {search.trim() &&
          ` matching "${search.trim()}"`}
      </p>

      {displayedLogs.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <h2 className="text-xl font-bold">
            No meals found
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Try a different search.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {displayedLogs.map((log) => (
            <FoodLogCard
              key={log.id}
              log={log}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore
              ? "Loading..."
              : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function FoodLogCard({
  log,
}: {
  log: FoodLog;
}) {
  const displayImage =
    log.photo ?? log.dishes?.image ?? null;

  return (
    <Link
      href={`/diary/${log.id}`}
      className="block"
    >
      <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-sm">
        <div className="flex flex-col sm:flex-row">
          {displayImage ? (
            <div className="h-56 w-full sm:h-auto sm:w-56">
              <img
                src={displayImage}
                alt={
                  log.dishes?.name ?? "Food"
                }
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-56 w-full bg-neutral-100 sm:h-auto sm:w-56" />
          )}

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {log.dishes?.name ??
                    "Unknown dish"}
                </h2>

                {log.restaurants && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {log.restaurants.name}

                    {log.restaurants.city &&
                      ` · ${log.restaurants.city}`}
                  </p>
                )}
              </div>

              <div className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold">
                {Number(log.rating).toFixed(1)}
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm tracking-wide">
                {"★".repeat(
                  Math.floor(Number(log.rating))
                )}
              </span>

              {Number(log.rating) % 1 !== 0 && (
                <span className="ml-1 text-sm">
                  ½
                </span>
              )}
            </div>

            {log.review && (
              <p className="mt-4 text-sm leading-6 text-neutral-600">
                {log.review}
              </p>
            )}

            <p className="mt-5 text-xs text-neutral-400">
              Eaten on{" "}
              {new Date(
                `${log.eaten_at}T00:00:00`
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <p className="mt-4 text-sm font-semibold">
              View details →
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
