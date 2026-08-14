import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AuthNav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-neutral-600 hover:text-black"
        >
          Log in
        </Link>

        <Link
          href="/sign-up"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="text-sm font-medium hover:underline"
      >
        Profile
      </Link>

      <LogoutButton />
    </div>
  );
}