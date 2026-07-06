import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, Users, PiggyBank, Plus, Compass } from "lucide-react";
import { analyticsApi } from "@/api/analytics";
import { tripsApi } from "@/api/trips";
import { aiApi } from "@/api/ai";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonthlySpendingChart } from "@/components/dashboard/MonthlySpendingChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { DashboardStats } from "@/types";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthly, setMonthly] = useState<{ month: string; amount: number }[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [trips, setTrips] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [dash, tripList] = await Promise.all([analyticsApi.dashboard(), tripsApi.list()]);
    setStats(dash.stats);
    setMonthly(dash.monthlySpending);
    setActivity(dash.recentActivity);
    setTrips(tripList.trips);
    setLoading(false);

    if (tripList.trips[0]) {
      try {
        const { summary } = await aiApi.tripSummary(tripList.trips[0]._id);
        setInsight(summary);
      } catch {
        setInsight("Add a few expenses to unlock AI-powered trip insights.");
      }
    } else {
      setInsight("Create your first trip to start unlocking AI-powered insights.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
        <Skeleton className="col-span-full h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-white/50">Here's what's happening across your trips</p>
        </div>
        <div className="flex gap-2">
          <Link to="/trip-planner" className="btn-ghost">
            <Compass size={16} /> Plan a Trip
          </Link>
          <Link to="/trips" className="btn-primary">
            <Plus size={16} /> New Trip
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Trips" value={String(stats.activeTrips)} icon={<Users size={18} />} accentClass="border-accent-500" delay={0} />
        <StatCard label="Total Spent" value={formatCurrency(stats.totalSpent)} icon={<Wallet size={18} />} accentClass="border-mint-500" delay={0.05} />
        <StatCard label="You're Owed" value={formatCurrency(stats.pendingOwedToMe)} icon={<TrendingUp size={18} />} accentClass="border-mint-500" delay={0.1} />
        <StatCard label="You Owe" value={formatCurrency(stats.pendingIOwe)} icon={<PiggyBank size={18} />} accentClass="border-coral-500" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-white/80">Monthly Spending</h3>
          </div>
          <MonthlySpendingChart data={monthly} />
        </motion.div>

        <div className="space-y-5">
          <AIInsightsCard insight={insight} loading={!insight} />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <h3 className="mb-3 font-display text-sm font-semibold text-white/80">Overall Budget</h3>
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-white/50">{stats.budgetUsedPct}% used</span>
              <span className="font-medium">
                {formatCurrency(stats.totalSpent)} / {formatCurrency(stats.budgetTotal)}
              </span>
            </div>
            <ProgressBar percent={stats.budgetUsedPct} />
          </motion.div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold text-white/80">Recent Activity</h3>
        <RecentActivity items={activity} />
      </div>
    </div>
  );
}
