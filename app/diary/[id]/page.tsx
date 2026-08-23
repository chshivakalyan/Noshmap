import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteFoodLogButton from "@/components/food/DeleteFoodLogButton";
import Image from "next/image";
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DiaryDetailLog = {
  id: string;
  rating: number;
  review: string | null;
  photo: string | null;
  eaten_at: string;
  created_at: string;
  dishes: {
    name: string;
    slug: string;
    description: string | null;
    cuisine: string | null;
    image: string | null;
  } | null;
  restaurants: {
    name: string;
    slug: string;
    address: string | null;
    city: string | null;
    country: string | null;
    price_range: string | null;
  } | null;
};

export default async function DiaryDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // LOAD FOOD LOG
  // --------------------------------------------------

  const { data: log, error } = await supabase
    .from("food_logs")
    .select(`
      id,
      rating,
      review,
      photo,
      eaten_at,
      created_at,
      dishes (
        name,
        slug,
        description,
        cuisine,
        image
      ),
      restaurants (
        name,
        slug,
        address,
        city,
        country,
        price_range
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()
    .overrideTypes<
      DiaryDetailLog,
      { merge: false }
    >();

  if (error || !log) {
    notFound();
  }

  // --------------------------------------------------
  // PRIVATE STORAGE PHOTO
  // --------------------------------------------------

  let photoUrl: string | null = null;

  if (log.photo) {
    const { data: signedUrlData } =
      await supabase.storage
        .from("food-photos")
        .createSignedUrl(
          log.photo,
          60 * 60
        );

    photoUrl =
      signedUrlData?.signedUrl ?? null;
  }

  const displayImage =
    photoUrl ?? log.dishes?.image ?? null;

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div>
          <Link
            href="/diary"
            className="inline-flex items-center text-sm font-medium text-neutral-500 transition hover:text-black"
          >
            ← Back to diary
          </Link>

          <p className="mt-6 text-sm font-semibold">
            Food diary
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {log.dishes?.name ?? "Food log"}
          </h1>

          {log.restaurants && (
            <p className="mt-3 text-neutral-500">
              {log.restaurants.name}

              {log.restaurants.city &&
                ` · ${log.restaurants.city}`}
            </p>
          )}
        </div>

        {/* Main Card */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white">

          {/* Photo */}

          {displayImage && (
            <div className="h-80 w-full sm:h-[28rem]">
                      <Image
          src={displayImage}
          alt={log.dishes?.name ?? "Food"}
          width={1200}
          height={800}
          className="h-full w-full object-cover"
        />
            </div>
          )}

          {/* Content */}

          <div className="p-6 sm:p-8">

            {/* Rating */}

            <div>
              <p className="text-sm font-semibold">
                Rating
              </p>

              <div className="mt-3 flex items-center gap-4">
                <div className="rounded-full bg-neutral-100 px-4 py-2 text-lg font-bold">
                  {log.rating.toFixed(1)}
                </div>

                <span className="text-lg tracking-wide">
                  {"★".repeat(
                    Math.floor(log.rating)
                  )}
                </span>

                {log.rating % 1 !== 0 && (
                  <span className="text-lg">
                    ½
                  </span>
                )}
              </div>
            </div>

            {/* Review */}

            {log.review && (
              <div className="mt-8 border-t border-neutral-200 pt-8">
                <p className="text-sm font-semibold">
                  Your review
                </p>

                <p className="mt-3 leading-7 text-neutral-600">
                  {log.review}
                </p>
              </div>
            )}

            {/* Restaurant */}

            {log.restaurants && (
              <div className="mt-8 border-t border-neutral-200 pt-8">
                <p className="text-sm font-semibold">
                  Restaurant
                </p>

                <p className="mt-3 font-medium">
                  {log.restaurants.name}
                </p>

                {log.restaurants.address && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {log.restaurants.address}
                  </p>
                )}

                {log.restaurants.city && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {log.restaurants.city}

                    {log.restaurants.country &&
                      `, ${log.restaurants.country}`}
                  </p>
                )}

                {log.restaurants.price_range && (
                  <p className="mt-2 text-sm text-neutral-400">
                    {log.restaurants.price_range}
                  </p>
                )}
              </div>
            )}

            {/* Dish Information */}

            {(log.dishes?.description ||
              log.dishes?.cuisine) && (
              <div className="mt-8 border-t border-neutral-200 pt-8">
                <p className="text-sm font-semibold">
                  About this dish
                </p>

                {log.dishes.cuisine && (
                  <p className="mt-3 text-sm font-medium">
                    {log.dishes.cuisine}
                  </p>
                )}

                {log.dishes.description && (
                  <p className="mt-2 leading-7 text-neutral-600">
                    {log.dishes.description}
                  </p>
                )}
              </div>
            )}

            {/* Eaten Date */}

            <div className="mt-8 border-t border-neutral-200 pt-8">
              <p className="text-sm font-semibold">
                Eaten on
              </p>

              <p className="mt-3 text-neutral-600">
                {new Date(
                  `${log.eaten_at}T00:00:00`
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Logged Date */}

            <div className="mt-6">
              <p className="text-xs text-neutral-400">
                Logged on{" "}
                {new Date(
                  log.created_at
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Edit */}

            <Link
              href={`/diary/${log.id}/edit`}
              className="mt-8 block w-full rounded-full border border-neutral-300 px-6 py-3 text-center text-sm font-semibold transition hover:border-black"
            >
              Edit food log
            </Link>

            {/* Delete */}

            <DeleteFoodLogButton
              logId={log.id}
              photoPath={log.photo}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
