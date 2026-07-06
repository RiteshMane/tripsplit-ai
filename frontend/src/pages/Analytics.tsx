import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "@/api/analytics";
import { tripsApi } from "@/api/trips";
import { MonthlySpendingChart } from "@/components/dashboard/MonthlySpendingChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArrowRight } from "lucide-react";

export default function Analytics() {
  const [monthly, setMonthly] = useState<{ month: string; amount: number }[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [dash, tripList] = await Promise.all([analyticsApi.dashboard(), tripsApi.list()]);
      setMonthly(dash.monthlySpending);
      setTrips(tripList.trips);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-white/50">Spending trends across all your trips</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-2 font-display text-sm font-semibold text-white/80">Combined Monthly Spending</h3>
        <MonthlySpendingChart data={monthly} />
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-white/80">Per-Trip Breakdown</h3>
        {trips.map((t) => {
          const pct = t.budget > 0 ? Math.round(((t.totalSpent || 0) / t.budget) * 100) : 0;
          return (
            <Link key={t._id} to={`/trips/${t._id}`} className="glass-card glass-card-hover flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-white/40">{t.destination}</p>
                <div className="mt-2 max-w-xs">
                  <ProgressBar percent={pct} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-sm font-semibold">{formatCurrency(t.totalSpent || 0)}</p>
                <p className="text-xs text-white/40">of {formatCurrency(t.budget)}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-white/30" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
