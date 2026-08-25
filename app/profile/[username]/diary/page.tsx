import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileReviewCard from "@/components/profile/ProfileReviewCard";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfileDiaryPage({
  params,
}: PageProps) {
  const { username } = await params;

  const supabase = await createClient();

  // Load profile
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Load diary entries
  const {
    data: foodLogs,
    error: foodLogsError,
  } = await supabase
    .from("food_logs")
    .select(`
      id,
      rating,
      review,
      photo,
      eaten_at,
      restaurant_id,

      dishes (
        name,
        slug,
        image,
        cuisine
      ),

      restaurants (
        name,
        slug,
        city
      )
    `)
    .eq("user_id", profile.id)
    .order("eaten_at", {
      ascending: false,
    });

  if (foodLogsError) {
    console.error(
      "PROFILE DIARY ERROR:",
      foodLogsError
    );
  }

  const logs = foodLogs ?? [];

  // Generate public photo URLs
  const logsWithPhotoUrls = logs.map((log) => {
    let photoUrl: string | null = null;

    if (log.photo) {
      const { data } = supabase.storage
        .from("food-photos")
        .getPublicUrl(log.photo);

      photoUrl = data.publicUrl;
    }

    return {
      ...log,
      photoUrl,
    };
  });

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-12 pb-24">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div>
          <p className="text-sm text-neutral-500">
            @{profile.username}
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
            {profile.display_name}&apos;s Diary
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Every meal logged by {profile.display_name}.
          </p>
        </div>

        {/* Count */}

        <div className="mt-8">
          <p className="text-sm font-semibold">
            {logs.length}{" "}
            {logs.length === 1
              ? "meal"
              : "meals"}
          </p>
        </div>

        {/* Empty state */}

        {logs.length === 0 && (
          <section className="mt-6 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="font-bold">
              No meals logged yet
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              This diary is empty.
            </p>
          </section>
        )}

        {/* Diary */}

        {logsWithPhotoUrls.length > 0 && (
          <section className="mt-6 grid gap-5 md:grid-cols-2">
            {logsWithPhotoUrls.map((log) => (
              <ProfileReviewCard
                key={log.id}
                log={{
                  id: log.id,
                  rating: Number(log.rating),
                  review: log.review,
                  eaten_at: log.eaten_at,
                  photo: log.photo,
                  photoUrl: log.photoUrl,
                  dishes: log.dishes,
                  restaurants: log.restaurants,
                }}
              />
            ))}
          </section>
        )}

      </div>
    </main>
  );
}