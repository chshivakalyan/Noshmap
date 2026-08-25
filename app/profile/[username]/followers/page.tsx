import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

type Follower = {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
};

export default async function FollowersPage({
  params,
}: PageProps) {
  const { username } = await params;

  const supabase = await createClient();

  // Find profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Get followers
  const { data: follows, error } =
    await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", profile.id);

  if (error) {
    console.error(
      "FOLLOWERS ERROR:",
      error
    );
  }

  const followerIds =
    (follows ?? []).map(
      (follow) => follow.follower_id
    );

  let followers: Follower[] = [];

  if (followerIds.length > 0) {
    const { data: profiles } =
      await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar"
        )
        .in("id", followerIds);

    followers = profiles ?? [];
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-12 pb-24">
      <div className="mx-auto max-w-3xl">

        <Link
          href={`/profile/${profile.username}`}
          className="text-sm font-semibold text-neutral-500 hover:text-black"
        >
          ← Back to profile
        </Link>

        <div className="mt-8">
          <h1 className="text-4xl font-black tracking-tight">
            Followers
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            People following{" "}
            {profile.display_name}
          </p>
        </div>

        {followers.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="font-bold">
              No followers yet
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              People who follow this profile will
              appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {followers.map((follower) => (
              <Link
                key={follower.id}
                href={`/profile/${follower.username}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400"
              >
                {follower.avatar ? (
                  <img
                    src={follower.avatar}
                    alt={follower.display_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 font-bold">
                    {follower.display_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-semibold">
                    {follower.display_name}
                  </p>

                  <p className="text-sm text-neutral-400">
                    @{follower.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}