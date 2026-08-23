import FoodLogHistory from "@/components/food/FoodLogHistory";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-semibold">
            Your food
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Food history
          </h1>

          <p className="mt-3 text-neutral-500">
            Every meal you have logged in noshMap.
          </p>
        </div>

        <div className="mt-10">
          <FoodLogHistory />
        </div>
      </div>
    </main>
  );
}