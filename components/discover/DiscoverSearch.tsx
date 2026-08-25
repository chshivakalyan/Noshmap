"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import DiscoverFilters from "@/components/discover/DiscoverFilters";

type Dish = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  cuisine: string | null;
};

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
};

type User = {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
};

type SearchResults = {
  dishes: Dish[];
  restaurants: Restaurant[];
  users: User[];
};

const EMPTY_RESULTS: SearchResults = {
  dishes: [],
  restaurants: [],
  users: [],
};

export default function DiscoverSearch() {
  const [query, setQuery] = useState("");

  const [results, setResults] =
    useState<SearchResults>(EMPTY_RESULTS);

  const [loading, setLoading] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState("all");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/discover/search?q=${encodeURIComponent(
            trimmedQuery
          )}`
        );

        if (!response.ok) {
          throw new Error(
            "Search request failed"
          );
        }

        const data =
          (await response.json()) as SearchResults;

        if (!cancelled) {
          setResults(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "DISCOVER SEARCH ERROR:",
            error
          );

          setResults(EMPTY_RESULTS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const hasQuery =
    query.trim().length > 0;

  const showDishes =
    activeFilter === "all" ||
    activeFilter === "dishes";

  const showRestaurants =
    activeFilter === "all" ||
    activeFilter === "restaurants";

  const showPeople =
    activeFilter === "all" ||
    activeFilter === "people";

  const visibleResults =
    (showDishes &&
      results.dishes.length > 0) ||
    (showRestaurants &&
      results.restaurants.length > 0) ||
    (showPeople &&
      results.users.length > 0);

  return (
    <div className="relative">

      {/* ==========================================
          SEARCH INPUT
      ========================================== */}

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const value =
              event.target.value;

            setQuery(value);

            if (!value.trim()) {
              setResults(EMPTY_RESULTS);
              setLoading(false);
            }
          }}
          placeholder="Search food, restaurants, people..."
          className="h-14 w-full rounded-2xl border border-neutral-200 bg-white px-5 text-sm outline-none transition focus:border-black"
        />
      </div>

      {/* ==========================================
          SEARCH AREA
      ========================================== */}

      {hasQuery && (
        <div className="mt-4">

          {/* Filters */}

          <div className="mb-4">
            <DiscoverFilters
              activeFilter={activeFilter}
              onFilterChange={
                setActiveFilter
              }
            />
          </div>

          {/* Results container */}

          <div className="rounded-3xl border border-neutral-200 bg-white p-5">

            {/* ======================================
                LOADING
            ====================================== */}

            {loading && (
              <p className="py-6 text-center text-sm text-neutral-400">
                Searching...
              </p>
            )}

            {/* ======================================
                NO RESULTS
            ====================================== */}

            {!loading &&
              !visibleResults && (
                <p className="py-6 text-center text-sm text-neutral-400">
                  No results found for
                  &quot;{query}&quot;.
                </p>
              )}

            {/* ======================================
                RESULTS
            ====================================== */}

            {!loading &&
              visibleResults && (
                <div className="space-y-8">

                  {/* =================================
                      DISHES
                  ================================= */}

                  {showDishes &&
                    results.dishes.length >
                      0 && (
                      <section>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Dishes
                        </h2>

                        <div className="space-y-2">
                          {results.dishes.map(
                            (dish) => (
                              <Link
                                key={dish.id}
                                href={`/dish/${dish.slug}`}
                                className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-neutral-50"
                              >
                                {/* Dish image */}

                                {dish.image ? (
                                  <Image
                                    src={
                                      dish.image
                                    }
                                    alt={
                                      dish.name
                                    }
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-xl bg-neutral-100" />
                                )}

                                {/* Dish information */}

                                <div>
                                  <p className="font-semibold">
                                    {dish.name}
                                  </p>

                                  {dish.cuisine && (
                                    <p className="text-xs text-neutral-400">
                                      {
                                        dish.cuisine
                                      }
                                    </p>
                                  )}
                                </div>
                              </Link>
                            )
                          )}
                        </div>
                      </section>
                    )}

                  {/* =================================
                      RESTAURANTS
                  ================================= */}

                  {showRestaurants &&
                    results.restaurants
                      .length > 0 && (
                      <section>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Restaurants
                        </h2>

                        <div className="space-y-2">
                          {results.restaurants.map(
                            (
                              restaurant
                            ) => (
                              <Link
                                key={
                                  restaurant.id
                                }
                                href={`/restaurant/${restaurant.slug}`}
                                className="block rounded-2xl p-3 transition hover:bg-neutral-50"
                              >
                                <p className="font-semibold">
                                  {
                                    restaurant.name
                                  }
                                </p>

                                {restaurant.city && (
                                  <p className="mt-1 text-xs text-neutral-400">
                                    {
                                      restaurant.city
                                    }
                                  </p>
                                )}
                              </Link>
                            )
                          )}
                        </div>
                      </section>
                    )}

                  {/* =================================
                      PEOPLE
                  ================================= */}

                  {showPeople &&
                    results.users.length >
                      0 && (
                      <section>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          People
                        </h2>

                        <div className="space-y-2">
                          {results.users.map(
                            (user) => (
                              <Link
                                key={user.id}
                                href={`/profile/${user.username}`}
                                className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-neutral-50"
                              >
                                {/* Avatar */}

                                {user.avatar ? (
                                  <Image
                                    src={
                                      user.avatar
                                    }
                                    alt={
                                      user.display_name
                                    }
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 font-bold">
                                    {user.display_name
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>
                                )}

                                {/* User information */}

                                <div>
                                  <p className="font-semibold">
                                    {
                                      user.display_name
                                    }
                                  </p>

                                  <p className="text-xs text-neutral-400">
                                    @
                                    {
                                      user.username
                                    }
                                  </p>
                                </div>
                              </Link>
                            )
                          )}
                        </div>
                      </section>
                    )}

                </div>
              )}

          </div>
        </div>
      )}
    </div>
  );
}