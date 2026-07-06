import { useEffect, useState } from "react";
import { tripsApi } from "@/api/trips";
import { expensesApi } from "@/api/expenses";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Activity() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { trips } = await tripsApi.list();
      const allExpenses = (
        await Promise.all(
          trips.map(async (t: any) => {
            const { expenses } = await expensesApi.list(t._id);
            return expenses.map((e: any) => ({ ...e, trip: { title: t.title } }));
          })
        )
      ).flat();
      allExpenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(allExpenses.slice(0, 50));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Activity</h1>
        <p className="text-sm text-white/50">Every expense, across every trip, in one feed</p>
      </div>
      {loading ? <Skeleton className="h-96" /> : <RecentActivity items={items} />}
    </div>
  );
}
