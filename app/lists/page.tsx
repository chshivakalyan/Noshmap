import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import CreateListForm from "@/components/lists/CreateListForm";
import { createClient } from "@/lib/supabase/server";

type ListsPageProps = {
  searchParams: Promise<{
    user?: string;
  }>;
};

export default async function ListsPage({
  searchParams,
}: ListsPageProps) {
  const { user: username } =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/login");
  }

  /*
   * ==================================================
   * OTHER USER'S PUBLIC LISTS
   * ==================================================
   */

  if (username) {
    const { data: profile } =
      await supabase
        .from("profiles")
        .select(
          "id, username, display_name"
        )
        .eq(
          "username",
          username
        )
        .maybeSingle();

    if (!profile) {
      notFound();
    }

    const { data: lists, error } =
      await supabase
        .from("food_lists")
        .select(
          `
            id,
            name,
            description,
            is_public,
            created_at
          `
        )
        .eq(
          "user_id",
          profile.id
        )
        .eq(
          "is_public",
          true
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "PUBLIC LISTS ERROR:",
        error
      );
    }

    return (
      <main className="mx-auto max-w-5xl px-5 py-12 pb-24 lg:px-8">

        <Link
          href={`/profile/${profile.username}`}
          className="text-sm font-semibold text-neutral-500 hover:text-black"
        >
          ← Back to profile
        </Link>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Lists
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            {profile.display_name}&apos;s lists
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Public food collections from{" "}
            @{profile.username}
          </p>
        </section>

        <section className="mt-12">
          {!lists ||
          lists.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              <p className="font-semibold">
                No public lists yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">

              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-neutral-300"
                >
                  <div className="flex items-start justify-between gap-4">

                    <h2 className="text-xl font-bold">
                      {list.name}
                    </h2>

                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                      Public
                    </span>

                  </div>

                  {list.description && (
                    <p className="mt-3 text-sm leading-6 text-neutral-500">
                      {list.description}
                    </p>
                  )}

                  <p className="mt-5 text-xs text-neutral-400">
                    Created{" "}
                    {new Date(
                      list.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </Link>
              ))}

            </div>
          )}
        </section>

      </main>
    );
  }

  /*
   * ==================================================
   * CURRENT USER'S LISTS
   * ==================================================
   */

  const { data: lists, error } =
    await supabase
      .from("food_lists")
      .select(
        `
          id,
          name,
          description,
          is_public,
          created_at
        `
      )
      .eq(
        "user_id",
        currentUser.id
      )
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "LISTS PAGE ERROR:",
      error
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 pb-24 lg:px-8">

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Lists
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
          Your food lists.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
          Save dishes you love and organize
          places you want to try.
        </p>
      </section>

      <section className="mt-10">
        <CreateListForm />
      </section>

      <section className="mt-14">

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Your lists
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Saved collections
          </h2>
        </div>

        {!lists ||
        lists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="font-semibold">
              No lists yet.
            </p>

            <p className="mt-2 text-sm text-neutral-400">
              Create your first food list
              above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">

            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-neutral-300"
              >
                <div className="flex items-start justify-between gap-4">

                  <h3 className="text-xl font-bold">
                    {list.name}
                  </h3>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                    {list.is_public
                      ? "Public"
                      : "Private"}
                  </span>

                </div>

                {list.description && (
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    {list.description}
                  </p>
                )}

                <p className="mt-5 text-xs text-neutral-400">
                  Created{" "}
                  {new Date(
                    list.created_at
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </Link>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}