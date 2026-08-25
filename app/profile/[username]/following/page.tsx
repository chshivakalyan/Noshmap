import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

type FollowingUser = {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
};

export default async function FollowingPage({
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

  // Get profiles this user follows
  const { data: follows, error } =
    await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", profile.id);

  if (error) {
    console.error(
      "FOLLOWING ERROR:",
      error
    );
  }

  const followingIds =
    (follows ?? []).map(
      (follow) => follow.following_id
    );

  let following: FollowingUser[] = [];

  if (followingIds.length > 0) {
    const { data: profiles } =
      await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar"
        )
        .in("id", followingIds);

    following = profiles ?? [];
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
            Following
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            People {profile.display_name} is
            following
          </p>
        </div>

        {following.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="font-bold">
              Not following anyone yet
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Profiles followed by this user will
              appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {following.map((person) => (
              <Link
                key={person.id}
                href={`/profile/${person.username}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400"
              >
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.display_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 font-bold">
                    {person.display_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-semibold">
                    {person.display_name}
                  </p>

                  <p className="text-sm text-neutral-400">
                    @{person.username}
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