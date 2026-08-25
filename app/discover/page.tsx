import DishCard from "@/components/food/DishCard";
import DiscoverSearch from "@/components/discover/DiscoverSearch";
import { getDishes } from "@/lib/dishes";
import { getTrendingDishes } from "@/lib/discover";

export default async function DiscoverPage() {
  const [dishes, trendingDishes] =
    await Promise.all([
      getDishes(),
      getTrendingDishes(),
    ]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-20 pb-32 lg:px-8">

      {/* Header */}

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Discover
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] sm:text-6xl">
          Find your next meal.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-500">
          Explore dishes worth remembering and
          discover your next favorite meal.
        </p>
      </section>

      {/* Search */}

      <section className="mt-10 max-w-3xl">
        <DiscoverSearch />
      </section>

      {/* Trending */}

      {trendingDishes.length > 0 && (
        <section className="mt-16">

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Popular right now
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              Trending dishes
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
              />
            ))}
          </div>

        </section>
      )}

      {/* All dishes */}

      <section className="mt-16">

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            All dishes
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
            Explore dishes
          </h2>
        </div>

        {dishes.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <p className="text-sm text-neutral-500">
              No dishes available yet.
            </p>
          </div>
        )}

      </section>

    </main>
  );
}