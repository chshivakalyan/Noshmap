import Link from "next/link";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    city: string | null;
    country: string | null;
    price_range: string | null;
  };
}

export default function RestaurantCard({
  restaurant,
}: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
    >
      <h3 className="text-xl font-bold tracking-tight">
        {restaurant.name}
      </h3>

      {(restaurant.city || restaurant.country) && (
        <p className="mt-2 text-sm text-neutral-500">
          {[restaurant.city, restaurant.country]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

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

      <p className="mt-4 text-sm font-semibold">
        View restaurant →
      </p>
    </Link>
  );
}