import { ReactNode } from "react";
import { motion } from "framer-motion";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      className="glass-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400">{icon}</div>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-white/50">{description}</p>
      {action}
    </motion.div>
  );
}
