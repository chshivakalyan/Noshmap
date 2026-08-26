import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    listId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { listId } = await context.params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const { data: list, error: listError } =
      await supabase
        .from("food_lists")
        .select(
          `
            id,
            name,
            description,
            is_public,
            created_at,
            updated_at,
            user_id
          `
        )
        .eq("id", listId)
        .single();

    if (listError || !list) {
      return NextResponse.json(
        {
          error: "List not found.",
        },
        { status: 404 }
      );
    }

    if (
      !list.is_public &&
      list.user_id !== user.id
    ) {
      return NextResponse.json(
        {
          error: "This list is private.",
        },
        { status: 403 }
      );
    }

    const { data: items, error: itemsError } =
      await supabase
        .from("food_list_items")
        .select(
          `
            dish_id,
            created_at,
            dishes (
              id,
              name,
              slug,
              description,
              cuisine,
              image
            )
          `
        )
        .eq("list_id", listId)
        .order("created_at", {
          ascending: false,
        });

    if (itemsError) {
      console.error(
        "LIST ITEMS ERROR:",
        itemsError
      );

      return NextResponse.json(
        {
          error: "Unable to load list dishes.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      list,
      items: items ?? [],
    });
  } catch (error) {
    console.error(
      "LIST GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { listId } = await context.params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const { data: list } =
      await supabase
        .from("food_lists")
        .select("user_id")
        .eq("id", listId)
        .single();

    if (!list) {
      return NextResponse.json(
        {
          error: "List not found.",
        },
        { status: 404 }
      );
    }

    if (list.user_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "You can only delete your own lists.",
        },
        { status: 403 }
      );
    }

    const { error } =
      await supabase
        .from("food_lists")
        .delete()
        .eq("id", listId)
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "LIST DELETE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: "Unable to delete list.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "LIST DELETE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}