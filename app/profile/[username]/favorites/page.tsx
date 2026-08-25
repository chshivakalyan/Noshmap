import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfileFavoritesPage({
  params,
}: PageProps) {
  const { username } = await params;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-12 pb-24">
      <div className="mx-auto max-w-5xl">

        <Link
          href={`/profile/${profile.username}`}
          className="text-sm font-semibold text-neutral-500 hover:text-black"
        >
          ← Back to profile
        </Link>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-10 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-2xl">
            ♥
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight">
            {profile.display_name}&apos;s Favorites
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Your favorite dishes and restaurants will
            be collected here.
          </p>

          <span className="mt-6 inline-block rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-500">
            Favorites coming in V8
          </span>

        </section>

      </div>
    </main>
  );
}