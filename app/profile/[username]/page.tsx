import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import ProfileStats from "@/components/profile/ProfileStats";
import ProfileReviewCard from "@/components/profile/ProfileReviewCard";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

type Dish = {
  name: string;
  slug: string;
  image: string | null;
  cuisine: string | null;
};

type Restaurant = {
  name: string;
  slug: string;
  city: string | null;
};

export default async function PublicProfilePage({
  params,
}: ProfilePageProps) {
  const { username } = await params;

  const supabase = await createClient();

  // ==================================================
  // PROFILE
  // ==================================================

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar,
      bio,
      created_at
    `)
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    console.error("PROFILE ERROR:", profileError);
    notFound();
  }

  // ==================================================
  // FOOD LOGS
  // ==================================================

  const {
    data: foodLogs,
    error: foodLogsError,
  } = await supabase
    .from("food_logs")
    .select(`
      id,
      rating,
      review,
      photo,
      eaten_at,
      restaurant_id,

      dishes (
        name,
        slug,
        image,
        cuisine
      ),

      restaurants (
        name,
        slug,
        city
      )
    `)
    .eq("user_id", profile.id)
    .order("eaten_at", {
      ascending: false,
    });

  if (foodLogsError) {
    console.error(
      "FOOD LOGS ERROR:",
      foodLogsError
    );
  }

  const logs = foodLogs ?? [];

  // ==================================================
  // PUBLIC PHOTO URLS
  // ==================================================

  const logsWithPhotoUrls = logs.map((log) => {
    let photoUrl: string | null = null;

    if (log.photo) {
      const { data } = supabase.storage
        .from("food-photos")
        .getPublicUrl(log.photo);

      photoUrl = data.publicUrl;
    }

    return {
      ...log,
      photoUrl,
    };
  });

  // ==================================================
  // STATISTICS
  // ==================================================

  const totalMeals = logs.length;

  const averageRating =
    totalMeals > 0
      ? logs.reduce(
          (sum, log) =>
            sum + Number(log.rating),
          0
        ) / totalMeals
      : 0;

  const restaurantsVisited =
    new Set(
      logs
        .map((log) => log.restaurant_id)
        .filter(Boolean)
    ).size;

  const cuisines = logs
    .map((log) => {
      const dish = Array.isArray(log.dishes)
        ? log.dishes[0]
        : log.dishes;

      return dish?.cuisine;
    })
    .filter(
      (
        cuisine
      ): cuisine is string =>
        Boolean(cuisine)
    );

  const cuisinesTried =
    new Set(cuisines).size;

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-12 pb-24">
      <div className="mx-auto max-w-5xl">

        {/* PROFILE HEADER */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.display_name}
                className="h-28 w-28 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-3xl font-black">
                {profile.display_name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-sm text-neutral-500">
                @{profile.username}
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {profile.display_name}
              </h1>

              {profile.bio && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* STATISTICS */}

        <ProfileStats
          totalMeals={totalMeals}
          averageRating={averageRating}
          cuisinesTried={cuisinesTried}
          restaurantsVisited={restaurantsVisited}
        />

        {/* TABS */}

        <nav className="mt-10 overflow-x-auto border-b border-neutral-200">
          <div className="flex min-w-max gap-8">

            <Link
              href={`/profile/${profile.username}`}
              className="border-b-2 border-black px-1 py-4 text-sm font-semibold"
            >
              Reviews
            </Link>

            <Link
              href={`/profile/${profile.username}/diary`}
              className="border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-neutral-400 hover:text-black"
            >
              Diary
            </Link>

            <Link
              href={`/profile/${profile.username}/lists`}
              className="border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-neutral-400 hover:text-black"
            >
              Lists
            </Link>

            <Link
              href={`/profile/${profile.username}/favorites`}
              className="border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-neutral-400 hover:text-black"
            >
              Favorites
            </Link>

          </div>
        </nav>

        {/* REVIEWS */}

        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight">
              Reviews
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {totalMeals}{" "}
              {totalMeals === 1
                ? "food log"
                : "food logs"}
            </p>
          </div>

          {logs.length === 0 && (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
              <h3 className="font-bold">
                No reviews yet
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Food logs with reviews will appear
                here.
              </p>
            </div>
          )}

          {logsWithPhotoUrls.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {logsWithPhotoUrls.map((log) => (
                <ProfileReviewCard
                  key={log.id}
                  log={{
                    id: log.id,
                    rating: Number(log.rating),
                    review: log.review,
                    eaten_at: log.eaten_at,
                    photo: log.photo,
                    photoUrl: log.photoUrl,
                    dishes:
                      log.dishes as
                        | Dish
                        | Dish[]
                        | null,
                    restaurants:
                      log.restaurants as
                        | Restaurant
                        | Restaurant[]
                        | null,
                  }}
                />
              ))}
            </div>
          )}

        </section>

        {/* FOOD MAP PREVIEW */}

        <section className="mt-8">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Food map
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Explore this user&apos;s food
                  journey.
                </p>
              </div>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                V9
              </span>
            </div>

            <div className="mt-5 flex h-56 items-center justify-center rounded-2xl bg-neutral-100">
              <div className="text-center">
                <p className="font-semibold text-neutral-600">
                  Food map coming soon
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Interactive map will be added in
                  V9.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}