import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import RemoveDishButton from "@/components/lists/RemoveDishButton";

type PageProps = {
  params: Promise<{
    listId: string;
  }>;
};

type Dish = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine: string | null;
  image: string | null;
};

type ListItem = {
  dish_id: string;
  created_at: string;
  dishes: Dish | Dish[] | null;
};

export default async function ListPage({
  params,
}: PageProps) {
  const { listId } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: list, error: listError } =
    await supabase
      .from("food_lists")
      .select(
        `
          id,
          name,
          description,
          is_public,
          created_at,
          user_id
        `
      )
      .eq("id", listId)
      .single();

  if (
    listError ||
    !list
  ) {
    notFound();
  }

  if (
    !list.is_public &&
    list.user_id !== user.id
  ) {
    notFound();
  }

  const {
    data: items,
    error: itemsError,
  } =
    await supabase
      .from("food_list_items")
      .select(
        `
          dish_id,
          created_at,
          dishes (
            id,
            name,
            slug,
            description,
            cuisine,
            image
          )
        `
      )
      .eq("list_id", listId)
      .order("created_at", {
        ascending: false,
      });

  if (itemsError) {
    console.error(
      "LIST ITEMS PAGE ERROR:",
      itemsError
    );
  }

  const dishes =
    (items ?? []) as ListItem[];

  const isOwner =
    list.user_id === user.id;

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 pb-24 lg:px-8">

      {/* Back */}

      <Link
        href="/lists"
        className="text-sm font-semibold text-neutral-500 hover:text-black"
      >
        ← Back to lists
      </Link>

      {/* Header */}

      <section className="mt-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Food list
              </p>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                {list.is_public
                  ? "Public"
                  : "Private"}
              </span>
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              {list.name}
            </h1>

            {list.description && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
                {list.description}
              </p>
            )}
          </div>

          {isOwner && (
            <Link
              href={`/discover?list=${list.id}`}
              className="shrink-0 rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Add dishes
            </Link>
          )}

        </div>

      </section>

      {/* Dishes */}

      <section className="mt-12">

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {dishes.length}{" "}
            {dishes.length === 1
              ? "dish"
              : "dishes"}
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Saved dishes
          </h2>
        </div>

        {dishes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="font-semibold">
              No dishes in this list yet.
            </p>

            {isOwner && (
              <Link
                href="/discover"
                className="mt-4 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Discover dishes
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {dishes.map((item) => {
              const dish = Array.isArray(
                item.dishes
              )
                ? item.dishes[0]
                : item.dishes;

              if (!dish) {
                return null;
              }

              return (
                <article
                  key={item.dish_id}
                  className="overflow-hidden rounded-3xl border border-neutral-200 bg-white"
                >

                  {dish.image && (
                    <div className="relative h-52">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">

                    <Link
                      href={`/dish/${dish.slug}`}
                      className="text-xl font-bold hover:underline"
                    >
                      {dish.name}
                    </Link>

                    {dish.cuisine && (
                      <p className="mt-1 text-sm text-neutral-400">
                        {dish.cuisine}
                      </p>
                    )}

                    {dish.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
                        {dish.description}
                      </p>
                    )}

                    {isOwner && (
                      <div className="mt-5">
                        <RemoveDishButton
                          listId={list.id}
                          dishId={dish.id}
                        />
                      </div>
                    )}

                  </div>
                </article>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
}