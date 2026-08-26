import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest
) {
  try {
    const supabase = await createClient();

    const foodLogId =
      request.nextUrl.searchParams.get(
        "foodLogId"
      );

    if (!foodLogId) {
      return NextResponse.json(
        {
          error: "Food log ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: comments,
      error,
    } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          username,
          display_name,
          avatar
        )
      `)
      .eq(
        "food_log_id",
        foodLogId
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "COMMENTS FETCH ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to load comments.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      comments: comments ?? [],
    });
  } catch (error) {
    console.error(
      "COMMENTS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const supabase = await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to comment.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const foodLogId =
      body.foodLogId;

    const content =
      typeof body.content ===
      "string"
        ? body.content.trim()
        : "";

    if (
      typeof foodLogId !==
        "string" ||
      !foodLogId
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid food log ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Comment cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        {
          error:
            "Comment must be 500 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    const { data: comment, error } =
      await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          food_log_id:
            foodLogId,
          content,
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            display_name,
            avatar
          )
        `)
        .single();

    if (error) {
      console.error(
        "COMMENT INSERT ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to create comment.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      comment,
    });
  } catch (error) {
    console.error(
      "COMMENTS POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const supabase = await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to delete comments.",
        },
        {
          status: 401,
        }
      );
    }

    const commentId =
      request.nextUrl.searchParams.get(
        "commentId"
      );

    if (!commentId) {
      return NextResponse.json(
        {
          error:
            "Comment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { error } =
      await supabase
        .from("comments")
        .delete()
        .eq(
          "id",
          commentId
        )
        .eq(
          "user_id",
          user.id
        );

    if (error) {
      console.error(
        "COMMENT DELETE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete comment.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "COMMENTS DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}