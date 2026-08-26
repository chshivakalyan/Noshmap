"use client";

import { useState } from "react";

type RemoveDishButtonProps = {
  listId: string;
  dishId: string;
};

export default function RemoveDishButton({
  listId,
  dishId,
}: RemoveDishButtonProps) {
  const [loading, setLoading] =
    useState(false);

  async function handleRemove() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/lists/${listId}/items?dishId=${encodeURIComponent(
            dishId
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to remove dish."
        );
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "REMOVE DISH ERROR:",
        error
      );

      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-500 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
    >
      {loading
        ? "Removing..."
        : "Remove"}
    </button>
  );
}