"use client";

import { useState } from "react";

type AddToListButtonProps = {
  listId: string;
  dishId: string;
};

export default function AddToListButton({
  listId,
  dishId,
}: AddToListButtonProps) {
  const [loading, setLoading] =
    useState(false);

  const [added, setAdded] =
    useState(false);

  async function handleAdd() {
    if (loading || added) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/lists/${listId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            dishId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setAdded(true);
          return;
        }

        throw new Error(
          data.error ||
            "Unable to add dish."
        );
      }

      setAdded(true);
    } catch (error) {
      console.error(
        "ADD TO LIST ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={loading || added}
      className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
        added
          ? "bg-neutral-100 text-neutral-500"
          : "bg-black text-white hover:bg-neutral-800"
      } disabled:cursor-not-allowed`}
    >
      {loading
        ? "Adding..."
        : added
          ? "Added"
          : "Add to list"}
    </button>
  );
}