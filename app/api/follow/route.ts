import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("FOLLOW AUTH ERROR:", authError);

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const followingId = body.followingId;

    if (!followingId) {
      return NextResponse.json(
        {
          error: "followingId is required",
        },
        { status: 400 }
      );
    }

    if (followingId === user.id) {
      return NextResponse.json(
        {
          error: "You cannot follow yourself",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: followingId,
      });

    if (error) {
      console.error(
        "FOLLOW DATABASE ERROR:",
        error
      );

      if (error.code === "23505") {
        return NextResponse.json({
          following: true,
        });
      }

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      following: true,
    });
  } catch (error) {
    console.error(
      "FOLLOW API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "UNFOLLOW AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const followingId = body.followingId;

    if (!followingId) {
      return NextResponse.json(
        {
          error: "followingId is required",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", followingId);

    if (error) {
      console.error(
        "UNFOLLOW DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      following: false,
    });
  } catch (error) {
    console.error(
      "UNFOLLOW API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}