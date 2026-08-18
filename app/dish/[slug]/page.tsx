import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  const { data: dish, error } = await supabase
  .from("dishes")
  .select("*")
  .eq("slug", slug)
  .single();

if (error || !dish) {
  notFound();
}

const { data: dishRestaurants, error: restaurantsError } =
  await supabase
    .from("dish_restaurants")
    .select(`
      restaurant_id,
      restaurants (
        id,
        name,
        slug,
        address,
        city,
        country,
        latitude,
        longitude,
        price_range
      )
    `)
    .eq("dish_id", dish.id);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
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

        {/* Information */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {dish.cuisine ?? "Food"}
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-[-0.05em]">
            {dish.name}
          </h1>

          {dish.description && (
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-500">
              {dish.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/log?dish=${dish.slug}`}
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
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

      {/* Restaurants */}
      <section className="mt-20">
  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
    Where to find it
  </p>

  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
    Restaurants serving this dish
  </h2>

  {restaurantsError ? (
    <p className="mt-6 text-sm text-red-500">
      Unable to load restaurants.
    </p>
  ) : dishRestaurants && dishRestaurants.length > 0 ? (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dishRestaurants.map((item) => {
        const restaurant = item.restaurants;

        if (!restaurant) {
          return null;
        }

        return (
          <Link
            key={restaurant.id}
            href={`/restaurant/${restaurant.slug}`}
            className="rounded-2xl border border-neutral-200 p-5 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <h3 className="text-xl font-bold">
              {restaurant.name}
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              {restaurant.city}, {restaurant.country}
            </p>

            {restaurant.address && (
              <p className="mt-1 text-sm text-neutral-400">
                {restaurant.address}
              </p>
            )}

            {restaurant.price_range && (
              <p className="mt-4 text-sm font-semibold">
                {restaurant.price_range}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  ) : (
    <p className="mt-6 text-sm text-neutral-500">
      No restaurants have been added for this dish yet.
    </p>
  )}
</section>
    </main>
  );
}