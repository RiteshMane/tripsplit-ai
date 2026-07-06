import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressBar({ percent, colorClass = "bg-accent-500", trackClass = "bg-base-700" }: { percent: number; colorClass?: string; trackClass?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const over = percent > 100;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full", trackClass)}>
      <motion.div
        className={cn("h-full rounded-full", over ? "bg-coral-500" : colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
