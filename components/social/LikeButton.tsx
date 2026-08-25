"use client";

import { useState } from "react";

type LikeButtonProps = {
  foodLogId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function LikeButton({
  foodLogId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] =
    useState(initialLiked);

  const [count, setCount] =
    useState(initialCount);

  const [loading, setLoading] =
    useState(false);

  async function handleLike() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/likes",
        {
          method: liked
            ? "DELETE"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            foodLogId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update like"
        );
      }

      setLiked(data.liked);

      setCount((current) =>
        data.liked
          ? current + 1
          : Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "LIKE BUTTON ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-semibold transition hover:opacity-60 disabled:opacity-50"
    >
      <span
        className={
          liked
            ? "text-red-500"
            : "text-neutral-400"
        }
      >
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {count}
      </span>
    </button>
  );
}