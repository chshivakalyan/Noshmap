"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  total: number;
  average: number;
  thisMonth: number;
};

export default function DiaryStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    average: 0,
    thisMonth: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("food_logs")
        .select("rating, eaten_at")
        .eq("user_id", user.id);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const total = data.length;

      const average =
        total > 0
          ? data.reduce(
              (sum, item) => sum + Number(item.rating),
              0
            ) / total
          : 0;

      const now = new Date();

      const thisMonth = data.filter((item) => {
        const date = new Date(
          `${item.eaten_at}T00:00:00`
        );

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length;

      setStats({
        total,
        average,
        thisMonth,
      });

      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-3xl bg-neutral-100" />
        <div className="h-28 animate-pulse rounded-3xl bg-neutral-100" />
        <div className="h-28 animate-pulse rounded-3xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-500">
          Total meals
        </p>

        <p className="mt-2 text-3xl font-bold">
          {stats.total}
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-500">
          Average rating
        </p>

        <p className="mt-2 text-3xl font-bold">
          {stats.average.toFixed(1)}
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-500">
          This month
        </p>

        <p className="mt-2 text-3xl font-bold">
          {stats.thisMonth}
        </p>
      </div>
    </div>
  );
}