import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Plus } from "lucide-react";
import { expensesApi } from "@/api/expenses";
import { ExpenseList } from "./ExpenseList";
import { ExpenseForm } from "./ExpenseForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trip, Expense } from "@/types";

const CATEGORIES = ["Food", "Travel", "Accommodation", "Shopping", "Fuel", "Activities", "Emergency", "Entertainment", "Miscellaneous"];

export function ExpensesPanel({ trip, onChanged }: { trip: Trip; onChanged: () => void }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { expenses } = await expensesApi.list(trip._id, { search: search || undefined, category: category || undefined });
    setExpenses(expenses);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip._id, search, category]);

  const handleCreated = () => {
    load();
    onChanged();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await expensesApi.remove(trip._id, id);
      toast.success("Expense deleted");
      load();
      onChanged();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search expenses..." />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-44">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary shrink-0">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {loading ? <Skeleton className="h-64" /> : <ExpenseList expenses={expenses} onDelete={handleDelete} />}

      <ExpenseForm trip={trip} open={formOpen} onClose={() => setFormOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
