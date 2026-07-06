import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Receipt } from "lucide-react";

export function RecentActivity({ items }: { items: any[] }) {
  if (items.length === 0) {
    return <EmptyState icon={<Receipt size={22} />} title="No activity yet" description="Add your first expense to see it show up here." />;
  }
  return (
    <div className="glass-card divide-y divide-base-border">
      {items.map((item, i) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-4 px-5 py-4"
        >
          <Avatar name={item.paidBy?.name || "?"} src={item.paidBy?.avatar} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="text-xs text-white/40">
              {item.trip?.title} · paid by {item.paidBy?.name} · {formatDate(item.date)}
            </p>
          </div>
          <p className="shrink-0 font-display text-sm font-semibold">{formatCurrency(item.amount)}</p>
        </motion.div>
      ))}
    </div>
  );
}
