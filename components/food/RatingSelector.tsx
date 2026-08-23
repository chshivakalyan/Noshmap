"use client";

type RatingSelectorProps = {
  value: number;
  onChange: (rating: number) => void;
};

const ratings = [
  0.5,
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  4.5,
  5,
];

export default function RatingSelector({
  value,
  onChange,
}: RatingSelectorProps) {
  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Rating"
      >
        {ratings.map((rating) => {
          const selected = value === rating;

          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(rating)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                selected
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              {rating.toFixed(1)}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-3xl tracking-widest">
        {value > 0 ? "★".repeat(Math.floor(value)) : "☆"}
        {value % 1 !== 0 && "½"}
      </p>

      <p className="mt-2 text-center text-sm text-neutral-500">
        {value > 0 ? `${value.toFixed(1)} out of 5` : "Select a rating"}
      </p>
    </div>
  );
}