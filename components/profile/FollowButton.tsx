"use client";

import { useState } from "react";

type FollowButtonProps = {
  profileId: string;
  initialFollowing: boolean;
};

export default function FollowButton({
  profileId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] =
    useState(initialFollowing);

  const [loading, setLoading] =
    useState(false);

  async function handleFollow() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/follow",
        {
          method: following
            ? "DELETE"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            followingId: profileId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update follow"
        );
      }

      setFollowing(
        data.following
      );
    } catch (error) {
      console.error(
        "FOLLOW BUTTON ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleFollow}
      disabled={loading}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        following
          ? "border border-neutral-300 bg-white text-black hover:bg-neutral-100"
          : "bg-black text-white hover:bg-neutral-800"
      } ${
        loading
          ? "cursor-not-allowed opacity-50"
          : ""
      }`}
    >
      {loading
        ? "..."
        : following
          ? "Following"
          : "Follow"}
    </button>
  );
}