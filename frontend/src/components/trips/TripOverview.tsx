import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { aiApi } from "@/api/ai";
import { Trip, TripAnalytics } from "@/types";

export function TripOverview({ trip, analytics }: { trip: Trip; analytics: TripAnalytics | null }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    aiApi
      .tripSummary(trip._id)
      .then((r) => setSummary(r.summary))
      .catch(() => setSummary("Add a few expenses to unlock an AI-generated summary of this trip."))
      .finally(() => setLoading(false));
  }, [trip._id]);

  const spent = analytics?.totalSpent ?? trip.totalSpent ?? 0;
  const pct = trip.budget > 0 ? Math.round((spent / trip.budget) * 100) : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative overflow-hidden p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-500/15 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-mint-500">
            <Sparkles size={15} className="text-white" />
          </div>
          <h3 className="font-display text-sm font-semibold">AI Trip Summary</h3>
        </div>
        <p className="relative mt-3 text-sm leading-relaxed text-white/70">
          {loading ? (
            <span className="flex items-center gap-2 text-white/40">
              <Loader2 size={14} className="animate-spin" /> Generating summary...
            </span>
          ) : (
            summary
          )}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">Total Expenses</p>
          <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(spent)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">Members</p>
          <div className="mt-2 flex -space-x-2">
            {trip.members.map((m) => (
              <Avatar key={m._id} name={m.name} src={m.avatar} className="ring-2 ring-base-800" />
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Budget Usage</p>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-white/50">{pct}%</span>
            <span className="font-medium">
              {formatCurrency(spent)} / {formatCurrency(trip.budget)}
            </span>
          </div>
          <ProgressBar percent={pct} />
        </div>
      </div>

      {trip.description && (
        <div className="glass-card p-5">
          <h3 className="mb-2 font-display text-sm font-semibold text-white/80">About this trip</h3>
          <p className="text-sm text-white/60">{trip.description}</p>
          {trip.startDate && (
            <p className="mt-2 text-xs text-white/40">
              {formatDate(trip.startDate)} {trip.endDate && `— ${formatDate(trip.endDate)}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
