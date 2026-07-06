import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import { TopSpender } from "@/types";

export function TopSpendersLeaderboard({ data }: { data: TopSpender[] }) {
  if (data.length === 0) return <div className="flex h-40 items-center justify-center text-sm text-white/30">No spenders yet</div>;
  const max = data[0]?.amount || 1;

  return (
    <div className="space-y-3">
      {data.map((s, i) => (
        <motion.div key={s.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
          <span className="w-4 shrink-0 text-xs font-semibold text-white/30">#{i + 1}</span>
          <Avatar name={s.name} src={s.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium">{s.name}</span>
              <span className="font-semibold text-white/80">{formatCurrency(s.amount)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-base-700">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-mint-500"
                initial={{ width: 0 }}
                animate={{ width: `${(s.amount / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
