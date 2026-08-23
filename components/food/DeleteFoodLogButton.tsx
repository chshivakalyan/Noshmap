"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  logId: string;
  photoPath: string | null;
};

export default function DeleteFoodLogButton({
  logId,
  photoPath,
}: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this food log? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "You must be logged in to delete this food log."
        );
        return;
      }

      const { error: deleteError } =
        await supabase
          .from("food_logs")
          .delete()
          .eq("id", logId)
          .eq("user_id", user.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      if (photoPath) {
        const { error: storageError } =
          await supabase.storage
            .from("food-photos")
            .remove([photoPath]);

        if (storageError) {
          console.error(
            "Could not delete photo:",
            storageError.message
          );
        }
      }

      router.push("/diary");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 border-t border-neutral-200 pt-8">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
      >
        {loading
          ? "Deleting..."
          : "Delete food log"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}