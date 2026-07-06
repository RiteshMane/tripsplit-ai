import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, HandCoins } from "lucide-react";
import { settlementsApi } from "@/api/settlements";
import { SettlementFlowRow } from "./SettlementFlowRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Settlement } from "@/types";

export function SettlementsPanel({ tripId }: { tripId: string }) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { settlements } = await settlementsApi.list(tripId);
    setSettlements(settlements);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const generate = async () => {
    setGenerating(true);
    try {
      await settlementsApi.generate(tripId);
      toast.success("Settlements optimized!");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate settlements");
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (id: string) => {
    try {
      await settlementsApi.markPaid(tripId, id);
      toast.success("Marked as paid");
      load();
    } catch {
      toast.error("Failed to update settlement");
    }
  };

  const clearHistory = async () => {
    if (!confirm("Clear all paid settlement history for this trip? This can't be undone.")) return;
    try {
      await settlementsApi.clearHistory(tripId);
      toast.success("Settlement history cleared");
      load();
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const pending = settlements.filter((s) => s.status === "pending");
  const paid = settlements.filter((s) => s.status === "paid");

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold">Optimized Settlements</h3>
          <p className="text-xs text-white/40">Minimum transactions needed to settle every balance</p>
        </div>
        <button onClick={generate} disabled={generating} className="btn-ghost">
          <RefreshCw size={15} className={generating ? "animate-spin" : ""} /> Recalculate
        </button>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          icon={<HandCoins size={22} />}
          title="Everyone's settled up"
          description="No pending transactions. Add expenses and recalculate to see optimized settlements."
        />
      ) : (
        <div className="space-y-3">
          {pending.map((s, i) => (
            <SettlementFlowRow key={s._id} settlement={s} onMarkPaid={markPaid} index={i} />
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Settlement History</h4>
            <button onClick={clearHistory} className="text-xs font-medium text-white/40 hover:text-coral-500">
              Clear history
            </button>
          </div>
          <div className="space-y-3">
            {paid.map((s, i) => (
              <SettlementFlowRow key={s._id} settlement={s} onMarkPaid={markPaid} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
