import Link from "next/link";
import DishCard from "@/components/food/DishCard";
import Button from "@/components/ui/Button";
import { dishes } from "@/lib/data";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <main className="pb-24 md:pb-0">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-[#ddd9d1] bg-white px-4 py-2 text-xs font-medium text-neutral-600">
                Your food diary, reimagined
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                Remember every great meal.
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-neutral-500 sm:text-lg">
                Discover dishes worth remembering. Log what you eat,
                rate your meals, write reviews and build a personal
                map of your food journey.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="/log">
                  Start Logging
                </Button>

                <Button href="/discover" variant="secondary">
                  Explore Food
                </Button>
              </div>

              <div className="mt-10 flex gap-8 border-t border-[#e7e4de] pt-6">
                <div>
                  <p className="text-2xl font-bold">10k+</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    meals logged
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">2.4k</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    dishes
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    cities
                  </p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem]">
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
                  alt="Beautifully plated food"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-5 left-5 max-w-[260px] rounded-2xl border border-[#e7e4de] bg-white p-4 shadow-xl sm:left-[-20px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">
                    Recently logged
                  </span>

                  <span className="text-xs text-neutral-400">
                    Today
                  </span>
                </div>

                <h3 className="mt-3 font-bold">
                  Butter Chicken
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Spice House · Jaipur
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm">★★★★★</span>
                  <span className="text-xs font-semibold">
                    4.5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured dishes */}
        <section className="border-y border-[#e7e4de] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Explore
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  Dishes worth remembering
                </h2>
              </div>

              <Link
                href="/discover"
                className="hidden text-sm font-semibold underline underline-offset-4 sm:block"
              >
                See all
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dishes.map((dish) => (
                <DishCard
  key={dish.slug}
  dish={{
    id: dish.slug,
    name: dish.name,
    slug: dish.slug,
    description: null,
    cuisine: null,
    image: dish.image,
  }}
/>
              ))}
            </div>
          </div>
        </section>

        {/* Product statement */}
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Discover
              </p>

              <h3 className="mt-3 text-2xl font-bold tracking-tight">
                Find your next favorite dish.
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Explore dishes, restaurants, cuisines and food
                recommendations from people whose taste you trust.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Remember
              </p>

              <h3 className="mt-3 text-2xl font-bold tracking-tight">
                Build your food diary.
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Every meal becomes part of your personal history,
                complete with ratings, reviews and photographs.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Explore
              </p>

              <h3 className="mt-3 text-2xl font-bold tracking-tight">
                See where you have eaten.
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Turn your food history into a visual map of your
                culinary journey.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
