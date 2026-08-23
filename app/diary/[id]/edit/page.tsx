import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditFoodLogForm from "@/components/food/EditFoodLogForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type EditFoodLogRow = {
  id: string;
  rating: number;
  review: string | null;
  photo: string | null;
  eaten_at: string;
  dishes: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  restaurants: {
    id: string;
    name: string;
    city: string | null;
  } | null;
};

export default async function EditFoodLogPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: log, error } = await supabase
    .from("food_logs")
    .select(`
      id,
      rating,
      review,
      photo,
      eaten_at,
      dishes (
        id,
        name,
        image
      ),
      restaurants (
        id,
        name,
        city
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()
    .overrideTypes<
      EditFoodLogRow,
      { merge: false }
    >();

  if (error || !log) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold">
          Food diary
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Edit food log
        </h1>

        <p className="mt-3 text-neutral-500">
          Update your experience with this meal.
        </p>

        <div className="mt-10">
          <EditFoodLogForm
            log={{
              id: log.id,
              rating: log.rating,
              review: log.review,
              photo: log.photo,
              eaten_at: log.eaten_at,
              dish: log.dishes,
              restaurant: log.restaurants,
            }}
          />
        </div>
      </div>
    </main>
  );
}
