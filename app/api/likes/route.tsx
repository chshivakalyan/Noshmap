import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const foodLogId = body.foodLogId;

    if (!foodLogId) {
      return NextResponse.json(
        { error: "foodLogId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("likes")
      .insert({
        user_id: user.id,
        food_log_id: foodLogId,
      });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          liked: true,
        });
      }

      console.error(
        "LIKE DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      liked: true,
    });
  } catch (error) {
    console.error(
      "LIKE API ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const foodLogId = body.foodLogId;

    if (!foodLogId) {
      return NextResponse.json(
        { error: "foodLogId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("food_log_id", foodLogId);

    if (error) {
      console.error(
        "UNLIKE DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      liked: false,
    });
  } catch (error) {
    console.error(
      "UNLIKE API ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}