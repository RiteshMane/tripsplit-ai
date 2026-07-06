import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  accentClass = "border-accent-500",
  trend,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accentClass?: string;
  trend?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("glass-card glass-card-hover relative overflow-hidden border-l-2 p-5", accentClass)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
          {trend && <p className="mt-1 text-xs text-mint-500">{trend}</p>}
        </div>
        <div className="rounded-xl bg-white/5 p-2.5 text-white/70">{icon}</div>
      </div>
    </motion.div>
  );
}
