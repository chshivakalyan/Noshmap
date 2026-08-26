import Image from "next/image";
import Link from "next/link";

import RatingStars from "@/components/food/RatingStars";
import LikeButton from "@/components/social/LikeButton";
import Comments from "@/components/food/Comments";

import { createClient } from "@/lib/supabase/server";

type Dish = {
  name: string;
  slug: string;
  image: string | null;
};

type Restaurant = {
  name: string;
  slug: string;
  city: string | null;
};

type ProfileReviewCardProps = {
  log: {
    id: string;
    rating: number;
    review: string | null;
    eaten_at: string;
    photo: string | null;
    photoUrl: string | null;
    dishes: Dish | Dish[] | null;
    restaurants:
      | Restaurant
      | Restaurant[]
      | null;
  };
};

export default async function ProfileReviewCard({
  log,
}: ProfileReviewCardProps) {
  const supabase = await createClient();

  const dish = Array.isArray(log.dishes)
    ? log.dishes[0]
    : log.dishes;

  const restaurant = Array.isArray(
    log.restaurants
  )
    ? log.restaurants[0]
    : log.restaurants;

  // ==================================================
  // CURRENT USER
  // ==================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ==================================================
  // LIKE COUNT
  // ==================================================

  const { count: likeCount } =
    await supabase
      .from("likes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "food_log_id",
        log.id
      );

  // ==================================================
  // CURRENT USER LIKE STATUS
  // ==================================================

  let initialLiked = false;

  if (user) {
    const { data: like } =
      await supabase
        .from("likes")
        .select("user_id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "food_log_id",
          log.id
        )
        .maybeSingle();

    initialLiked =
      Boolean(like);
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">

      {/* ==========================================
          FOOD PHOTO
      ========================================== */}

      {log.photoUrl && (
        <div className="relative h-64 w-full">
          <Image
            src={log.photoUrl}
            alt={
              dish?.name ??
              "Food"
            }
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}

      {/* ==========================================
          REVIEW CONTENT
      ========================================== */}

      <div className="p-6">

        {/* Dish + rating */}

        <div className="flex items-start justify-between gap-4">

          {/* Dish + restaurant */}

          <div className="min-w-0">

            {dish ? (
              <Link
                href={`/dish/${dish.slug}`}
                className="text-xl font-bold hover:underline"
              >
                {dish.name}
              </Link>
            ) : (
              <h2 className="text-xl font-bold">
                Unknown dish
              </h2>
            )}

            {restaurant && (
              <p className="mt-1 text-sm text-neutral-500">
                {restaurant.name}

                {restaurant.city
                  ? ` · ${restaurant.city}`
                  : ""}
              </p>
            )}

          </div>

          {/* Rating */}

          <div className="shrink-0">
            <RatingStars
              rating={Number(
                log.rating
              )}
            />
          </div>

        </div>

        {/* ==========================================
            REVIEW
        ========================================== */}

        {log.review && (
          <p className="mt-5 text-sm leading-7 text-neutral-600">
            {log.review}
          </p>
        )}

        {/* ==========================================
            DATE
        ========================================== */}

        <p className="mt-5 text-xs text-neutral-400">
          {new Date(
            log.eaten_at
          ).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )}
        </p>

        {/* ==========================================
            LIKE
        ========================================== */}

        {user && (
          <div className="mt-5 border-t border-neutral-100 pt-4">
            <LikeButton
              foodLogId={log.id}
              initialLiked={
                initialLiked
              }
              initialCount={
                likeCount ?? 0
              }
            />
          </div>
        )}

        {/* ==========================================
            COMMENTS
        ========================================== */}

        <Comments
          foodLogId={log.id}
        />

      </div>
    </article>
  );
}