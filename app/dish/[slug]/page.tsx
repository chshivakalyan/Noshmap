import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RestaurantCard from "@/components/food/RestaurantCard";

interface DishPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DishPage({
  params,
}: DishPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // ==================================================
  // 1. Get dish
  // ==================================================

  const { data: dish, error } = await supabase
    .from("dishes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !dish) {
    notFound();
  }

  // ==================================================
  // 2. Get restaurants serving this dish
  // ==================================================

  const {
    data: relationships,
    error: relationshipsError,
  } = await supabase
    .from("dish_restaurants")
    .select("restaurant_id")
    .eq("dish_id", dish.id);

  let restaurants = null;
  let restaurantsError = relationshipsError;

  if (!relationshipsError && relationships && relationships.length > 0) {
    const restaurantIds = relationships.map(
      (relationship) => relationship.restaurant_id
    );

    const result = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        slug,
        address,
        city,
        country,
        latitude,
        longitude,
        price_range
      `)
      .in("id", restaurantIds);

    restaurants = result.data;
    restaurantsError = result.error;
  }

  // ==================================================
  // 3. Render page
  // ==================================================

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">

      {/* ================================================
          DISH HEADER
      ================================================= */}

      <div className="grid gap-10 lg:grid-cols-2">

        {/* Dish image */}

        <div className="overflow-hidden rounded-3xl bg-neutral-200">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="aspect-[4/3] h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-neutral-400">
              No image available
            </div>
          )}
        </div>

        {/* Dish information */}

        <div className="flex flex-col justify-center">

          {/* Cuisine */}

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {dish.cuisine ?? "Food"}
          </p>

          {/* Dish name */}

          <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] sm:text-6xl">
            {dish.name}
          </h1>

          {/* Description */}

          {dish.description && (
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-500">
              {dish.description}
            </p>
          )}

          {/* Actions */}

          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              href={`/log?dish=${dish.slug}`}
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Log this dish
            </Link>

            <button
              disabled
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-400"
            >
              Add to list
            </button>

          </div>
        </div>
      </div>

      {/* ================================================
          RESTAURANTS
      ================================================= */}

      <section className="mt-20">

        {/* Section label */}

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Where to find it
        </p>

        {/* Section heading */}

        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
          Restaurants serving this dish
        </h2>

        {/* Database error */}

        {restaurantsError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-600">
              Unable to load restaurants.
            </p>

            <p className="mt-2 text-xs text-red-500">
              {restaurantsError.message}
            </p>
          </div>
        ) : restaurants && restaurants.length > 0 ? (

          /* Restaurant cards */

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}

          </div>

        ) : (

          /* Empty state */

          <p className="mt-6 text-sm text-neutral-500">
            No restaurants have been added for this dish yet.
          </p>

        )}

      </section>
    </main>
  );
}
