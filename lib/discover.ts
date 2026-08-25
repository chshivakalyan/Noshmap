import { createClient } from "@/lib/supabase/server";

export async function getTrendingDishes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("food_logs")
    .select(`
      dish_id,
      rating,
      dishes (
        id,
        name,
        slug,
        description,
        image,
        cuisine
      )
    `)
    .not("dish_id", "is", null)
    .order("rating", {
      ascending: false,
    })
    .limit(20);

  if (error) {
    console.error(
      "TRENDING DISHES ERROR:",
      error
    );

    return [];
  }

  const seen = new Set<string>();

  const trending = [];

  for (const item of data ?? []) {
    const dish = Array.isArray(item.dishes)
      ? item.dishes[0]
      : item.dishes;

    if (!dish) {
      continue;
    }

    if (seen.has(dish.id)) {
      continue;
    }

    seen.add(dish.id);

    trending.push({
      id: dish.id,
      name: dish.name,
      slug: dish.slug,
      description: dish.description,
      cuisine: dish.cuisine,
      image: dish.image,
    });
  }

  return trending.slice(0, 8);
}