import Link from "next/link";
import RatingStars from "./RatingStars";

interface DishCardProps {
  name: string;
  restaurant: string;
  location: string;
  rating: number;
  image: string;
  slug: string;
}

export default function DishCard({
  name,
  restaurant,
  location,
  rating,
  image,
  slug,
}: DishCardProps) {
  return (
    <Link
      href={`/dish/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#e7e4de] bg-white"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          {rating.toFixed(1)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold tracking-tight">{name}</h3>

        <p className="mt-1 text-sm text-neutral-500">
          {restaurant}
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          {location}
        </p>

        <div className="mt-3">
          <RatingStars rating={rating} />
        </div>
      </div>
    </Link>
  );
}