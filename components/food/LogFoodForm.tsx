"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RatingSelector from "./RatingSelector";

type Dish = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine: string | null;
  image: string | null;
};

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  country: string | null;
  price_range: string | null;
};

type DishRestaurantRow = {
  restaurant_id: string;
  restaurants: Restaurant[];
};

export default function LogFoodForm() {
  const [supabase] = useState(() => createClient());

  // Step 1 — Dish
  const [search, setSearch] = useState("");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDish, setSelectedDish] =
    useState<Dish | null>(null);

  // Step 2 — Restaurant
  const [restaurants, setRestaurants] =
    useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  // Step 3 — Rating
  const [rating, setRating] = useState(0);

  // Step 4 — Review
  const [review, setReview] = useState("");

  // Step 5 — Date
  const [eatenAt, setEatenAt] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  // Optional photo
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  // Loading
  const [loadingDishes, setLoadingDishes] =
    useState(false);
  const [loadingRestaurants, setLoadingRestaurants] =
    useState(false);
  const [saving, setSaving] = useState(false);

  // Status
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // --------------------------------------------------
  // STEP 1 — SEARCH DISHES
  // --------------------------------------------------

  useEffect(() => {
    async function searchDishes() {
      setError("");

      if (!search.trim()) {
        setDishes([]);
        setLoadingDishes(false);
        return;
      }

      setLoadingDishes(true);

      const { data, error } = await supabase
        .from("dishes")
        .select(
          "id, name, slug, description, cuisine, image"
        )
        .ilike("name", `%${search.trim()}%`)
        .order("name")
        .limit(10);

      if (error) {
        setError(error.message);
        setDishes([]);
        setLoadingDishes(false);
        return;
      }

      setDishes(data ?? []);
      setLoadingDishes(false);
    }

    const timer = setTimeout(() => {
      searchDishes();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, supabase]);

  // --------------------------------------------------
  // STEP 2 — LOAD RESTAURANTS
  // --------------------------------------------------

  async function loadRestaurants(dishId: string) {
    setError("");
    setLoadingRestaurants(true);

    const { data, error } = await supabase
      .from("dish_restaurants")
      .select(`
        restaurant_id,
        restaurants (
          id,
          name,
          slug,
          address,
          city,
          country,
          price_range
        )
      `)
      .eq("dish_id", dishId);

    if (error) {
      setError(error.message);
      setRestaurants([]);
      setLoadingRestaurants(false);
      return;
    }

    const rows = (data ?? []) as DishRestaurantRow[];

    const formattedRestaurants = rows.flatMap(
      (item) => item.restaurants
    );

    setRestaurants(formattedRestaurants);
    setLoadingRestaurants(false);
  }

  // --------------------------------------------------
  // SELECT DISH
  // --------------------------------------------------

  function handleSelectDish(dish: Dish) {
    setSelectedDish(dish);
    setSelectedRestaurant(null);
    setRating(0);
    setReview("");

    setPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview("");

    setSaved(false);
    setError("");

    setSearch("");
    setDishes([]);

    loadRestaurants(dish.id);
  }

  // --------------------------------------------------
  // CHANGE DISH
  // --------------------------------------------------

  function handleChangeDish() {
    setSelectedDish(null);
    setSelectedRestaurant(null);
    setRestaurants([]);

    setRating(0);
    setReview("");

    setPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview("");

    setEatenAt(
      new Date().toISOString().split("T")[0]
    );

    setSearch("");
    setDishes([]);

    setSaved(false);
    setError("");
  }

  // --------------------------------------------------
  // SELECT RESTAURANT
  // --------------------------------------------------

  function handleSelectRestaurant(
    restaurant: Restaurant
  ) {
    setSelectedRestaurant(restaurant);
    setSaved(false);
    setError("");
  }

  // --------------------------------------------------
  // PHOTO SELECTION
  // --------------------------------------------------

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setError("");
    setSaved(false);
    setPhoto(file);
    setPhotoPreview(previewUrl);
  }

  // --------------------------------------------------
  // REMOVE PHOTO
  // --------------------------------------------------

  function handleRemovePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview("");
  }

  // --------------------------------------------------
  // UPLOAD PHOTO
  // --------------------------------------------------

  async function uploadPhoto(): Promise<string | null> {
    if (!photo) {
      return null;
    }

    setUploadingPhoto(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUploadingPhoto(false);
      setError(
        "You must be logged in to upload a photo."
      );
      return null;
    }

    const fileExtension =
      photo.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("food-photos")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type,
        });

    if (uploadError) {
      setUploadingPhoto(false);
      setError(
        `Photo upload failed: ${uploadError.message}`
      );
      return null;
    }

    setUploadingPhoto(false);

    return filePath;
  }

  // --------------------------------------------------
  // SAVE FOOD LOG
  // --------------------------------------------------

  async function handleContinue() {
    if (
      !selectedDish ||
      !selectedRestaurant ||
      rating === 0 ||
      !eatenAt ||
      saving ||
      saved
    ) {
      return;
    }

    setError("");
    setSaved(false);
    setSaving(true);

    try {
      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "You must be logged in to save a food log."
        );
        return;
      }

      // Upload optional photo
      let photoPath: string | null = null;

      if (photo) {
        photoPath = await uploadPhoto();

        if (!photoPath) {
          return;
        }
      }

      // Insert food log
      const { error: insertError } = await supabase
        .from("food_logs")
        .insert({
          user_id: user.id,
          dish_id: selectedDish.id,
          restaurant_id: selectedRestaurant.id,
          rating,
          review: review.trim() || null,
          photo: photoPath,
          eaten_at: eatenAt,
        });

      if (insertError) {
        setError(
          `Could not save food log: ${insertError.message}`
        );
        return;
      }

      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="rounded-3xl border border-[#e7e4de] bg-white p-6 sm:p-8">

      {/* =================================================
          STEP 1 — SEARCH DISH
          ================================================= */}

      {!selectedDish ? (
        <>
          <div>
            <p className="text-sm font-semibold">
              Step 1 of 5
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              What did you eat?
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Search for the dish you want to log.
            </p>
          </div>

          <div className="relative mt-6">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search dishes..."
              className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm outline-none transition focus:border-black"
            />

            {loadingDishes && (
              <p className="mt-3 text-sm text-neutral-400">
                Searching...
              </p>
            )}

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {!loadingDishes &&
              search.trim() &&
              dishes.length === 0 &&
              !error && (
                <div className="mt-3 rounded-xl border border-neutral-200 p-4">
                  <p className="text-sm font-medium">
                    No dishes found
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Try another dish name.
                  </p>
                </div>
              )}

            {dishes.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                {dishes.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() =>
                      handleSelectDish(dish)
                    }
                    className="flex w-full items-center gap-4 border-b border-neutral-100 p-4 text-left transition last:border-b-0 hover:bg-neutral-50"
                  >
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-neutral-100" />
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold">
                        {dish.name}
                      </p>

                      {dish.cuisine && (
                        <p className="mt-1 text-xs text-neutral-500">
                          {dish.cuisine}
                        </p>
                      )}

                      {dish.description && (
                        <p className="mt-1 truncate text-xs text-neutral-400">
                          {dish.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* =================================================
              STEP 1 — SELECTED DISH
              ================================================= */}

          <div>
            <p className="text-sm font-semibold">
              Step 1 of 5
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Selected dish
            </h2>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-neutral-200 p-4">
              {selectedDish.image ? (
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-neutral-100" />
              )}

              <div className="min-w-0 flex-1">
                <h3 className="font-bold">
                  {selectedDish.name}
                </h3>

                {selectedDish.cuisine && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {selectedDish.cuisine}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleChangeDish}
                className="text-sm font-semibold underline underline-offset-4"
              >
                Change
              </button>
            </div>
          </div>

          {/* =================================================
              STEP 2 — RESTAURANT
              ================================================= */}

          <div className="mt-10 border-t border-neutral-200 pt-10">
            <p className="text-sm font-semibold">
              Step 2 of 5
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Where did you eat it?
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Select the restaurant where you had this dish.
            </p>

            {loadingRestaurants && (
              <div className="mt-6 rounded-2xl border border-neutral-200 p-5">
                <p className="text-sm text-neutral-500">
                  Finding restaurants...
                </p>
              </div>
            )}

            {!loadingRestaurants &&
              restaurants.length === 0 &&
              !error && (
                <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
                  <p className="font-medium">
                    No restaurants found
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    This dish is not associated with any
                    restaurants yet.
                  </p>
                </div>
              )}

            {!loadingRestaurants &&
              restaurants.length > 0 && (
                <div className="mt-6 space-y-3">
                  {restaurants.map((restaurant) => {
                    const selected =
                      selectedRestaurant?.id ===
                      restaurant.id;

                    return (
                      <button
                        key={restaurant.id}
                        type="button"
                        onClick={() =>
                          handleSelectRestaurant(
                            restaurant
                          )
                        }
                        className={`w-full rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-black bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold">
                              {restaurant.name}
                            </h3>

                            <p className="mt-1 text-sm text-neutral-500">
                              {restaurant.city},{" "}
                              {restaurant.country}
                            </p>

                            {restaurant.address && (
                              <p className="mt-1 text-xs text-neutral-400">
                                {restaurant.address}
                              </p>
                            )}
                          </div>

                          {restaurant.price_range && (
                            <span className="text-xs font-medium text-neutral-500">
                              {restaurant.price_range}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* =================================================
              STEP 3 — RATING
              ================================================= */}

          <div className="mt-10 border-t border-neutral-200 pt-10">
            <p className="text-sm font-semibold">
              Step 3 of 5
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              How was it?
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Give this meal a rating.
            </p>

            <div className="mt-8">
              <RatingSelector
                value={rating}
                onChange={setRating}
              />
            </div>
          </div>

          {/* =================================================
              STEP 4 — REVIEW
              ================================================= */}

          <div className="mt-10 border-t border-neutral-200 pt-10">
            <p className="text-sm font-semibold">
              Step 4 of 5
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              What did you think?
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Add a short review about this meal.
            </p>

            <div className="mt-6">
              <textarea
                value={review}
                onChange={(event) =>
                  setReview(event.target.value)
                }
                placeholder="Tell us about the taste, texture, presentation..."
                rows={5}
                maxLength={1000}
                className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm outline-none transition focus:border-black"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-neutral-400">
                  {review.length}/1000
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              STEP 5 — DATE
              ================================================= */}

          <div className="mt-10 border-t border-neutral-200 pt-10">
            <p className="text-sm font-semibold">
              Step 5 of 5
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              When did you eat it?
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Choose the date you had this meal.
            </p>

            <div className="mt-6">
              <input
                type="date"
                value={eatenAt}
                onChange={(event) =>
                  setEatenAt(event.target.value)
                }
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>

          {/* =================================================
              OPTIONAL PHOTO
              ================================================= */}

          <div className="mt-10 border-t border-neutral-200 pt-10">
            <p className="text-sm font-semibold">
              Optional
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Add a photo
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Add a photo of the meal if you have one.
            </p>

            <div className="mt-6">
              <label
                htmlFor="food-photo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 px-6 py-10 text-center transition hover:border-neutral-500"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selected food"
                    className="h-48 w-full rounded-xl object-cover"
                  />
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                      <span className="text-xl">
                        +
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-semibold">
                      Add food photo
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      JPG, PNG or WEBP · Max 5 MB
                    </p>
                  </>
                )}
              </label>

              <input
                id="food-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="mt-3 text-sm font-semibold underline underline-offset-4"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              STATUS
              ================================================= */}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {saved && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="font-semibold text-green-800">
                Food log saved
              </p>

              <p className="mt-1 text-sm text-green-700">
                Your meal has been added successfully.
              </p>
            </div>
          )}

          {/* =================================================
              SAVE
              ================================================= */}

          <button
            type="button"
            onClick={handleContinue}
            disabled={
              !selectedDish ||
              !selectedRestaurant ||
              rating === 0 ||
              !eatenAt ||
              saving ||
              uploadingPhoto ||
              saved
            }
            className="mt-8 w-full rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {uploadingPhoto
              ? "Uploading photo..."
              : saving
                ? "Saving..."
                : saved
                  ? "Saved"
                  : "Save food log"}
          </button>
        </>
      )}
    </div>
  );
}