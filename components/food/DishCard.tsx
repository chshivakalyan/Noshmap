import Link from "next/link";

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cuisine: string | null;
    image: string | null;
  };
}

export default function DishCard({ dish }: DishCardProps) {
  return (
    <Link
      href={`/dish/${dish.slug}`}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
    >
      {dish.image ? (
        <img
          src={dish.image}
          alt={dish.name}
          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          No image available
        </div>
      )}

      <div className="p-5">
        {dish.cuisine && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
            {dish.cuisine}
          </p>
        )}

        <h3 className="mt-2 text-xl font-bold tracking-tight">
          {dish.name}
        </h3>

        {dish.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
            {dish.description}
          </p>
        )}

        <p className="mt-4 text-sm font-semibold">
          View dish →
        </p>
      </div>
    </Link>
  );
}