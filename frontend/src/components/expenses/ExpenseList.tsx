import { motion } from "framer-motion";
import { Receipt, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCategoryMeta } from "./categoryMeta";
import { Expense } from "@/types";

function firstName(name: string) {
  return name.split(" ")[0];
}

/** Human-readable summary of how an expense was split, e.g. "70% Alex, 30% Priya" */
function splitDescription(exp: Expense): string {
  const { splitMethod, participants, amount } = exp;

  if (splitMethod === "equal") {
    return `Split equally · ${participants.length} ${participants.length === 1 ? "person" : "people"}`;
  }
  if (splitMethod === "selected") {
    return `Split equally among ${participants.map((p) => firstName(p.user.name)).join(", ")}`;
  }
  if (splitMethod === "percentage") {
    return participants
      .map((p) => `${amount > 0 ? Math.round((p.share / amount) * 100) : 0}% ${firstName(p.user.name)}`)
      .join(", ");
  }
  if (splitMethod === "custom") {
    return participants.map((p) => `${formatCurrency(p.share)} ${firstName(p.user.name)}`).join(", ");
  }
  return "";
}

export function ExpenseList({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) {
  if (expenses.length === 0) {
    return <EmptyState icon={<Receipt size={22} />} title="No expenses yet" description="Add your first expense to start tracking spending on this trip." />;
  }

  return (
    <div className="glass-card divide-y divide-base-border">
      {expenses.map((exp, i) => {
        const meta = getCategoryMeta(exp.category);
        const Icon = meta.icon;
        return (
          <motion.div
            key={exp._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className="group flex items-center gap-4 px-5 py-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: meta.color + "22", color: meta.color }}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{exp.title}</p>
              <p className="truncate text-xs text-white/40">
                {exp.category} · paid by {exp.paidBy.name} · {formatDate(exp.date)}
              </p>
              <p className="truncate text-xs text-white/30">{splitDescription(exp)}</p>
            </div>
            <div className="hidden -space-x-2 sm:flex">
              {exp.participants.slice(0, 3).map((p) => (
                <Avatar key={p.user._id} name={p.user.name} src={p.user.avatar} size="sm" className="ring-2 ring-base-800" />
              ))}
            </div>
            <p className="w-24 shrink-0 text-right font-display text-sm font-semibold">{formatCurrency(exp.amount)}</p>
            <button
              onClick={() => onDelete(exp._id)}
              className="rounded-lg p-1.5 text-white/0 transition-colors group-hover:text-white/30 hover:!text-coral-500 hover:bg-base-700"
            >
              <Trash2 size={15} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
