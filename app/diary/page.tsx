import Link from "next/link";
import FoodLogHistory from "@/components/food/FoodLogHistory";
import DiaryStats from "@/components/food/DiaryStats";

export default function DiaryPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Your food diary
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Diary
            </h1>

            <p className="mt-3 text-neutral-500">
              A record of the meals you have logged.
            </p>
          </div>

          <Link
            href="/log"
            className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            + Log food
          </Link>
        </div>

        <div className="mt-10">
          <DiaryStats />
        </div>

        <div className="mt-10">
          <FoodLogHistory />
        </div>
      </div>
    </main>
  );
}