import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

type FoodList = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
};

export default async function ProfileListsPage({
  params,
}: PageProps) {
  const { username } = await params;

  const supabase =
    await createClient();

  // ==========================================
  // PROFILE
  // ==========================================

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
      .single();

  if (!profile) {
    notFound();
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ==========================================
  // LISTS
  // ==========================================

  let query = supabase
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
    .order("created_at", {
      ascending: false,
    });

  // Other users can only see public lists.
  // The owner can see both public and private lists.

  if (!user || user.id !== profile.id) {
    query = query.eq(
      "is_public",
      true
    );
  }

  const {
    data: lists,
    error,
  } = await query;

  if (error) {
    console.error(
      "PROFILE LISTS ERROR:",
      error
    );
  }

  const foodLists =
    (lists as FoodList[]) ?? [];

  const isOwner =
    user?.id === profile.id;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-12 pb-24">
      <div className="mx-auto max-w-5xl">

        {/* Back */}

        <Link
          href={`/profile/${profile.username}`}
          className="text-sm font-semibold text-neutral-500 hover:text-black"
        >
          ← Back to profile
        </Link>

        {/* Header */}

        <section className="mt-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Lists
          </p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {profile.display_name}&apos;s
                Lists
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
                Food collections curated by{" "}
                @{profile.username}.
              </p>
            </div>

            {isOwner && (
              <Link
                href="/lists"
                className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Create a list
              </Link>
            )}

          </div>

        </section>

        {/* Lists */}

        <section className="mt-12">

          {foodLists.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-2xl">
                +
              </div>

              <h2 className="mt-6 text-xl font-bold">
                {isOwner
                  ? "You haven't created any lists yet."
                  : "No public lists yet."}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
                {isOwner
                  ? "Create your first food collection and start organizing dishes you want to remember."
                  : `${profile.display_name} hasn't published any food lists yet.`}
              </p>

              {isOwner && (
                <Link
                  href="/lists"
                  className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Create your first list
                </Link>
              )}

            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">

              {foodLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="group rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <h2 className="text-xl font-bold tracking-tight group-hover:underline">
                      {list.name}
                    </h2>

                    <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                      {list.is_public
                        ? "Public"
                        : "Private"}
                    </span>

                  </div>

                  {list.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">
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

      </div>
    </main>
  );
}