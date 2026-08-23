import { notFound } from "next/navigation";
// import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DishCard from "@/components/food/DishCard";
interface RestaurantPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RestaurantPage({
  params,
}: RestaurantPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // 1. Get restaurant
  // --------------------------------------------------

  const {
    data: restaurant,
    error: restaurantError,
  } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  // Restaurant does not exist
  if (restaurantError || !restaurant) {
    notFound();
  }

  // --------------------------------------------------
  // 2. Get dish relationships
  // --------------------------------------------------

  const {
    data: relationships,
    error: relationshipsError,
  } = await supabase
    .from("dish_restaurants")
    .select("dish_id")
    .eq("restaurant_id", restaurant.id);

  // --------------------------------------------------
  // 3. Get actual dishes
  // --------------------------------------------------

  let dishes = null;
  let dishesError = relationshipsError;

  if (!relationshipsError && relationships.length > 0) {
    const dishIds = relationships.map(
      (item) => item.dish_id
    );

    const result = await supabase
      .from("dishes")
      .select(`
        id,
        name,
        slug,
        description,
        cuisine,
        image
      `)
      .in("id", dishIds);

    dishes = result.data;
    dishesError = result.error;
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">

      {/* ================================================
          RESTAURANT HEADER
      ================================================= */}

      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {restaurant.city}, {restaurant.country}
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] sm:text-6xl">
          {restaurant.name}
        </h1>

        {restaurant.address && (
          <p className="mt-4 text-base text-neutral-500">
            {restaurant.address}
          </p>
        )}

        {restaurant.price_range && (
          <p className="mt-3 text-sm font-semibold">
            {restaurant.price_range}
          </p>
        )}
      </section>

      {/* ================================================
          LOCATION
      ================================================= */}

      {(restaurant.latitude !== null &&
        restaurant.latitude !== undefined &&
        restaurant.longitude !== null &&
        restaurant.longitude !== undefined) && (
        <section className="mt-10">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Location
            </p>

            <p className="mt-3 text-sm text-neutral-500">
              Latitude: {restaurant.latitude}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Longitude: {restaurant.longitude}
            </p>
          </div>
        </section>
      )}

      {/* ================================================
          DISHES
      ================================================= */}

      <section className="mt-20">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Food
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
          Dishes at this restaurant
        </h2>

        {/* Database error */}

        {dishesError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-600">
              Unable to load dishes.
            </p>

            <p className="mt-2 text-xs text-red-500">
              {dishesError.message}
            </p>
          </div>
        ) : dishes && dishes.length > 0 ? (

          /* Dish grid */

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {dishes.map((dish) => (
  <DishCard
    key={dish.id}
    dish={dish}
  />
))}

          </div>

        ) : (

          /* Empty state */

          <div className="mt-8 rounded-2xl border border-neutral-200 p-8">
            <p className="text-sm text-neutral-500">
              No dishes have been added for this restaurant yet.
            </p>
          </div>

        )}

      </section>

    </main>
  );
}