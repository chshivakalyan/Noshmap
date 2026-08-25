import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, display_name, avatar, bio, created_at")
    .eq("id", user.id)
    .maybeSingle();

  let loadedProfile = profile;

  if (!loadedProfile && !error) {
    const username =
      typeof user.user_metadata?.username === "string"
        ? user.user_metadata.username.trim()
        : user.email?.split("@")[0] ?? `user-${user.id.slice(0, 8)}`;
    const displayName =
      typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name.trim()
        : username;

    const { data: createdProfile, error: createError } =
      await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            username,
            display_name: displayName || username,
          },
          { onConflict: "id" }
        )
        .select("username, display_name, avatar, bio, created_at")
        .single();

    if (!createError) {
      loadedProfile = createdProfile;
    }
  }

  if (error || !loadedProfile) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-20">
        <h1 className="text-3xl font-black">
          Profile unavailable
        </h1>

        <p className="mt-3 text-neutral-500">
          Your account exists, but your profile could not be loaded.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-20">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-neutral-500">
            @{loadedProfile.username}
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-[-0.05em]">
            {loadedProfile.display_name}
          </h1>

          {loadedProfile.bio && (
            <p className="mt-4 max-w-xl text-neutral-500">
              {loadedProfile.bio}
            </p>
          )}
        </div>

        <LogoutButton />
      </div>

      <div className="mt-10 border-t border-neutral-200 pt-6">
        <p className="text-sm text-neutral-500">
          Email
        </p>

        <p className="mt-1 font-medium">
          {user.email}
        </p>
      </div>
    </main>
  );
}