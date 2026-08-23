import LogFoodForm from "@/components/food/LogFoodForm";

export default function LogPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-12 pb-24">
      <div className="mx-auto max-w-2xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Food diary
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            Log a meal
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Remember what you ate, where you ate it, and how good it was.
          </p>
        </div>

        <div className="mt-10">
          <LogFoodForm />
        </div>
      </div>
    </main>
  );
}