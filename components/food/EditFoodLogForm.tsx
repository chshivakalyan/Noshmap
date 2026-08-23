"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RatingSelector from "./RatingSelector";
import Image from "next/image";
type EditFoodLog = {
  id: string;
  rating: number;
  review: string | null;
  photo: string | null;
  eaten_at: string;

  dish: {
    id: string;
    name: string;
    image: string | null;
  } | null;

  restaurant: {
    id: string;
    name: string;
    city: string | null;
  } | null;
};

type Props = {
  log: EditFoodLog;
};

export default function EditFoodLogForm({
  log,
}: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [rating, setRating] = useState(log.rating);
  const [review, setReview] = useState(log.review ?? "");
  const [eatenAt, setEatenAt] = useState(log.eaten_at);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [currentPhotoUrl, setCurrentPhotoUrl] =
    useState("");

  const [removePhoto, setRemovePhoto] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadCurrentPhoto() {
      if (!log.photo) {
        return;
      }

      const { data, error } =
        await supabase.storage
          .from("food-photos")
          .createSignedUrl(log.photo, 60 * 60);

      if (error) {
        console.error(
          "Could not load current photo:",
          error.message
        );
        return;
      }

      setCurrentPhotoUrl(data?.signedUrl ?? "");
    }

    loadCurrentPhoto();
  }, [log.photo, supabase]);

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setError("");
    setSaved(false);
    setRemovePhoto(false);
    setPhoto(file);

    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview("");
    setRemovePhoto(true);
    setSaved(false);
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photo) {
      return null;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "You must be logged in to upload a photo."
      );
      return null;
    }

    const extension =
      photo.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("food-photos")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type,
        });

    if (uploadError) {
      setError(
        `Photo upload failed: ${uploadError.message}`
      );
      return null;
    }

    return filePath;
  }

  async function handleSave() {
    if (rating === 0 || !eatenAt || saving) {
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      let newPhotoPath = log.photo;

      if (photo) {
        const uploadedPath =
          await uploadPhoto();

        if (!uploadedPath) {
          return;
        }

        newPhotoPath = uploadedPath;
      }

      if (removePhoto) {
        newPhotoPath = null;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "You must be logged in to update this food log."
        );
        return;
      }

      const { error: updateError } =
        await supabase
          .from("food_logs")
          .update({
            rating,
            review: review.trim() || null,
            eaten_at: eatenAt,
            photo: newPhotoPath,
          })
          .eq("id", log.id)
          .eq("user_id", user.id);

      if (updateError) {
        setError(
          `Could not update food log: ${updateError.message}`
        );
        return;
      }

      if (
        log.photo &&
        (photo || removePhoto) &&
        log.photo !== newPhotoPath
      ) {
        const { error: removeError } =
          await supabase.storage
            .from("food-photos")
            .remove([log.photo]);

        if (removeError) {
          console.error(
            "Could not remove old photo:",
            removeError.message
          );
        }
      }

      setSaved(true);

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">

      {/* Dish */}

      <div className="flex items-center gap-4">
        {log.dish?.image ? (
          <Image
  src={log.dish.image}
  alt={log.dish.name}
  width={80}
  height={80}
  className="h-20 w-20 rounded-2xl object-cover"
/>
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-neutral-100" />
        )}

        <div>
          <h2 className="text-xl font-bold">
            {log.dish?.name ?? "Food"}
          </h2>

          {log.restaurant && (
            <p className="mt-1 text-sm text-neutral-500">
              {log.restaurant.name}

              {log.restaurant.city &&
                ` · ${log.restaurant.city}`}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}

      <div className="mt-10">
        <p className="text-sm font-semibold">
          Rating
        </p>

        <div className="mt-5">
          <RatingSelector
            value={rating}
            onChange={setRating}
          />
        </div>
      </div>

      {/* Review */}

      <div className="mt-10">
        <p className="text-sm font-semibold">
          Review
        </p>

        <textarea
          value={review}
          onChange={(event) =>
            setReview(event.target.value)
          }
          rows={5}
          maxLength={1000}
          placeholder="Tell us about the meal..."
          className="mt-4 w-full resize-none rounded-2xl border border-neutral-300 px-5 py-4 text-sm outline-none focus:border-black"
        />

        <p className="mt-2 text-right text-xs text-neutral-400">
          {review.length}/1000
        </p>
      </div>

      {/* Date */}

      <div className="mt-10">
        <p className="text-sm font-semibold">
          Date eaten
        </p>

        <input
          type="date"
          value={eatenAt}
          max={
            new Date()
              .toISOString()
              .split("T")[0]
          }
          onChange={(event) =>
            setEatenAt(event.target.value)
          }
          className="mt-4 w-full rounded-2xl border border-neutral-300 px-5 py-4 text-sm outline-none focus:border-black"
        />
      </div>

      {/* Photo */}

      <div className="mt-10">
        <p className="text-sm font-semibold">
          Food photo
        </p>

        {photoPreview ? (
          <div className="mt-4">
            <p className="mb-2 text-xs text-neutral-400">
              New photo
            </p>

            <img
              src={photoPreview}
              alt="New food"
              className="h-64 w-full rounded-2xl object-cover"
            />
          </div>
        ) : currentPhotoUrl &&
          !removePhoto ? (
          <div className="mt-4">
            <p className="mb-2 text-xs text-neutral-400">
              Current photo
            </p>

            <img
              src={currentPhotoUrl}
              alt="Current food"
              className="h-64 w-full rounded-2xl object-cover"
            />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-neutral-100 p-8 text-center">
            <p className="text-sm text-neutral-500">
              No food photo
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <label
            htmlFor="edit-food-photo"
            className="cursor-pointer rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold hover:border-black"
          >
            {photo
              ? "Replace photo"
              : "Choose photo"}
          </label>

          <input
            id="edit-food-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          {(log.photo || photo) &&
            !removePhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:border-red-400"
              >
                Remove photo
              </button>
            )}
        </div>

        {removePhoto && (
          <p className="mt-3 text-sm text-red-500">
            Photo will be removed when you save.
          </p>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}

      {saved && (
        <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
          Food log updated successfully.
        </div>
      )}

      {/* Save */}

      <button
        type="button"
        onClick={handleSave}
        disabled={
          saving ||
          rating === 0 ||
          !eatenAt
        }
        className="mt-8 w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {saving
          ? "Saving changes..."
          : "Save changes"}
      </button>
    </div>
  );
}