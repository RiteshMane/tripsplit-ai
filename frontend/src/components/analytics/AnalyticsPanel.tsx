import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Sparkles, Loader2, CalendarDays, Flame } from "lucide-react";
import { analyticsApi } from "@/api/analytics";
import { aiApi } from "@/api/ai";
import { CategoryPieChart } from "./CategoryPieChart";
import { DailySpendingChart } from "./DailySpendingChart";
import { TopSpendersLeaderboard } from "./TopSpendersLeaderboard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TripAnalytics } from "@/types";

export function AnalyticsPanel({ tripId }: { tripId: string }) {
  const [data, setData] = useState<TripAnalytics | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);

  const load = async () => {
    const res = await analyticsApi.tripAnalytics(tripId);
    setData(res);
  };

  const loadTips = async () => {
    setTipsLoading(true);
    try {
      const { tips } = await aiApi.costOptimization(tripId);
      setTips(tips);
    } catch {
      setTips(["Couldn't reach the AI service. Try again in a moment."]);
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/40">
            <Flame size={13} /> Biggest Expense
          </p>
          <p className="mt-2 font-display text-lg font-bold">{data.biggestExpense ? formatCurrency(data.biggestExpense.amount) : "—"}</p>
          <p className="truncate text-xs text-white/40">{data.biggestExpense?.title || "No expenses yet"}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/40">
            <CalendarDays size={13} /> Most Expensive Day
          </p>
          <p className="mt-2 font-display text-lg font-bold">{data.mostExpensiveDay ? formatCurrency(data.mostExpensiveDay.amount) : "—"}</p>
          <p className="text-xs text-white/40">{data.mostExpensiveDay ? formatDate(data.mostExpensiveDay.date) : "No data yet"}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">Budget Used</p>
          <p className="mt-2 font-display text-lg font-bold">{data.budgetUsedPct}%</p>
          <div className="mt-2">
            <ProgressBar percent={data.budgetUsedPct} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-2 font-display text-sm font-semibold text-white/80">Spending by Category</h3>
          <CategoryPieChart data={data.categoryBreakdown} />
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-2 font-display text-sm font-semibold text-white/80">Daily Spending</h3>
          <DailySpendingChart data={data.dailySpending} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-white/80">Top Spenders</h3>
          <TopSpendersLeaderboard data={data.topSpenders} />
        </div>
        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint-500/15 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-mint-500 to-accent-500">
              <TrendingDown size={15} className="text-white" />
            </div>
            <h3 className="font-display text-sm font-semibold">AI Cost Optimization</h3>
          </div>
          <div className="relative mt-4 space-y-2.5">
            {tipsLoading ? (
              <p className="flex items-center gap-2 text-sm text-white/40">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </p>
            ) : (
              tips.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <Sparkles size={13} className="mt-0.5 shrink-0 text-accent-400" />
                  <span>{t}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
