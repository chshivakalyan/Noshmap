import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-3xl font-bold">
        Supabase Test
      </h1>

      <pre className="mt-6 rounded-xl bg-neutral-100 p-5">
        {JSON.stringify(
          {
            user: data.user,
            error: error?.message,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}