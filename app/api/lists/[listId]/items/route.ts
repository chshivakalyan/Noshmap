import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    listId: string;
  }>;
};

export async function POST(
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

    const body =
      await request.json();

    const dishId = body.dishId;

    if (
      typeof dishId !== "string" ||
      !dishId
    ) {
      return NextResponse.json(
        {
          error: "Invalid dish ID.",
        },
        { status: 400 }
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
            "You can only modify your own lists.",
        },
        { status: 403 }
      );
    }

    const { error } =
      await supabase
        .from("food_list_items")
        .insert({
          list_id: listId,
          dish_id: dishId,
        });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This dish is already in the list.",
          },
          { status: 409 }
        );
      }

      console.error(
        "ADD DISH ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to add dish.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "ADD DISH API ERROR:",
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

    const dishId =
      request.nextUrl.searchParams.get(
        "dishId"
      );

    if (!dishId) {
      return NextResponse.json(
        {
          error: "Dish ID is required.",
        },
        { status: 400 }
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
            "You can only modify your own lists.",
        },
        { status: 403 }
      );
    }

    const { error } =
      await supabase
        .from("food_list_items")
        .delete()
        .eq("list_id", listId)
        .eq("dish_id", dishId);

    if (error) {
      console.error(
        "REMOVE DISH ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to remove dish.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "REMOVE DISH API ERROR:",
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