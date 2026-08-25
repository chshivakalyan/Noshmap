import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      dishes: [],
      restaurants: [],
      users: [],
    });
  }

  const supabase = await createClient();

  const searchTerm = `%${query}%`;

  const [dishesResult, restaurantsResult, usersResult] =
    await Promise.all([
      supabase
        .from("dishes")
        .select(
          `
            id,
            name,
            slug,
            image,
            cuisine
          `
        )
        .or(
          `name.ilike.${searchTerm},cuisine.ilike.${searchTerm}`
        )
        .limit(10),

      supabase
        .from("restaurants")
        .select(
          `
            id,
            name,
            slug,
            city
          `
        )
        .or(
          `name.ilike.${searchTerm},city.ilike.${searchTerm}`
        )
        .limit(10),

      supabase
        .from("profiles")
        .select(
          `
            id,
            username,
            display_name,
            avatar
          `
        )
        .or(
          `username.ilike.${searchTerm},display_name.ilike.${searchTerm}`
        )
        .limit(10),
    ]);

  if (dishesResult.error) {
    console.error(
      "DISCOVER DISH SEARCH ERROR:",
      dishesResult.error
    );
  }

  if (restaurantsResult.error) {
    console.error(
      "DISCOVER RESTAURANT SEARCH ERROR:",
      restaurantsResult.error
    );
  }

  if (usersResult.error) {
    console.error(
      "DISCOVER USER SEARCH ERROR:",
      usersResult.error
    );
  }

  return NextResponse.json({
    dishes: dishesResult.data ?? [],
    restaurants: restaurantsResult.data ?? [],
    users: usersResult.data ?? [],
  });
}