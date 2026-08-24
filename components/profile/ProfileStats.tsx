type ProfileStatsProps = {
  totalMeals: number;
  averageRating: number;
  cuisinesTried: number;
  restaurantsVisited: number;
};

export default function ProfileStats({
  totalMeals,
  averageRating,
  cuisinesTried,
  restaurantsVisited,
}: ProfileStatsProps) {
  const stats = [
    {
      label: "Total meals",
      value: totalMeals,
    },
    {
      label: "Average rating",
      value: averageRating.toFixed(1),
    },
    {
      label: "Cuisines tried",
      value: cuisinesTried,
    },
    {
      label: "Restaurants visited",
      value: restaurantsVisited,
    },
  ];

  return (
    <section className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-5"
        >
          <p className="text-2xl font-black">
            {stat.value}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}