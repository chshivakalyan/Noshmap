"use client";

type DiscoverFiltersProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

const filters = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "dishes",
    label: "Dishes",
  },
  {
    id: "restaurants",
    label: "Restaurants",
  },
  {
    id: "people",
    label: "People",
  },
];

export default function DiscoverFilters({
  activeFilter,
  onFilterChange,
}: DiscoverFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const active =
          activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() =>
              onFilterChange(filter.id)
            }
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-black text-white"
                : "border border-neutral-200 bg-white text-neutral-500 hover:text-black"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}