interface RatingStarsProps {
  rating: number;
  showNumber?: boolean;
}

export default function RatingStars({
  rating,
  showNumber = true,
}: RatingStarsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-sm tracking-tight">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Math.round(rating)
                ? "text-black"
                : "text-neutral-300"
            }
          >
            ★
          </span>
        ))}
      </div>

      {showNumber && (
        <span className="text-xs font-medium text-neutral-500">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}