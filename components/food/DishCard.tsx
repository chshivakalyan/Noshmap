import Link from "next/link";
import AddToListButton from "@/components/lists/AddToListButton";

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cuisine: string | null;
    image: string | null;
  };

  listId?: string;
}

export default function DishCard({
  dish,
  listId,
}: DishCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-md">

      {/* Dish link */}

      <Link
        href={`/dish/${dish.slug}`}
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
      </Link>

      {/* Content */}

      <div className="p-5">

        {dish.cuisine && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
            {dish.cuisine}
          </p>
        )}

        <Link
          href={`/dish/${dish.slug}`}
        >
          <h3 className="mt-2 text-xl font-bold tracking-tight hover:underline">
            {dish.name}
          </h3>
        </Link>

        {dish.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
            {dish.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">

          <Link
            href={`/dish/${dish.slug}`}
            className="text-sm font-semibold"
          >
            View dish →
          </Link>

          {listId && (
            <AddToListButton
              listId={listId}
              dishId={dish.id}
            />
          )}

        </div>

      </div>
    </article>
  );
}