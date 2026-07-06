import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import { Settlement } from "@/types";

/**
 * The product's signature visual: an animated "money flow" row showing
 * a debtor's avatar sending an amount to a creditor's avatar along a
 * dashed, continuously-flowing path — a direct visualization of the
 * settlement-optimization algorithm's output.
 */
export function SettlementFlowRow({ settlement, onMarkPaid, index }: { settlement: Settlement; onMarkPaid: (id: string) => void; index: number }) {
  const isPaid = settlement.status === "paid";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-1 items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <Avatar name={settlement.fromUser.name} src={settlement.fromUser.avatar} />
          <span className="max-w-[64px] truncate text-[11px] text-white/50">{settlement.fromUser.name}</span>
        </div>

        <div className="relative mx-1 flex flex-1 items-center">
          <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" className="overflow-visible">
            <line
              x1="0"
              y1="12"
              x2="188"
              y2="12"
              stroke={isPaid ? "#2FD9B8" : "#8B7CF6"}
              strokeWidth="2"
              strokeDasharray="6 6"
              className={isPaid ? "" : "animate-flow-dash"}
              opacity={0.6}
            />
            <polygon points="188,6 200,12 188,18" fill={isPaid ? "#2FD9B8" : "#8B7CF6"} opacity={0.8} />
          </svg>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-full bg-base-900 px-2.5 py-1 text-xs font-semibold shadow-glass">
            {formatCurrency(settlement.amount)}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Avatar name={settlement.toUser.name} src={settlement.toUser.avatar} />
          <span className="max-w-[64px] truncate text-[11px] text-white/50">{settlement.toUser.name}</span>
        </div>
      </div>

      {isPaid ? (
        <span className="flex items-center justify-center gap-1.5 self-start rounded-full bg-mint-500/15 px-4 py-2 text-xs font-semibold text-mint-500 sm:self-auto">
          <Check size={14} /> Settled
        </span>
      ) : (
        <button onClick={() => onMarkPaid(settlement._id)} className="btn-primary self-start sm:self-auto">
          Mark as Paid
        </button>
      )}
    </motion.div>
  );
}
