import { Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export function AIInsightsCard({ insight, loading, onRefresh }: { insight: string; loading?: boolean; onRefresh?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative overflow-hidden p-5"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-mint-500">
            <Sparkles size={15} className="text-white" />
          </div>
          <p className="font-display text-sm font-semibold">AI Insight</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-base-700 hover:text-white">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-white/70">
        {loading ? "Analyzing your spending patterns..." : insight}
      </p>
    </motion.div>
  );
}
