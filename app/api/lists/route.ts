import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const { data, error } = await supabase
      .from("food_lists")
      .select(
        `
          id,
          name,
          description,
          is_public,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "LISTS GET ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: "Unable to load lists.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      lists: data ?? [],
    });
  } catch (error) {
    console.error(
      "LISTS GET API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to create a list.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const isPublic =
      typeof body.isPublic ===
      "boolean"
        ? body.isPublic
        : true;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "List name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error:
            "List name must be 100 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          error:
            "Description must be 500 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } =
      await supabase
        .from("food_lists")
        .insert({
          user_id: user.id,
          name,
          description:
            description || null,
          is_public: isPublic,
        })
        .select(
          `
            id,
            name,
            description,
            is_public,
            created_at,
            updated_at
          `
        )
        .single();

    if (error) {
      console.error(
        "LIST CREATE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to create list.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        list: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "LIST CREATE API ERROR:",
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