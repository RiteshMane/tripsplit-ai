import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { expensesApi } from "@/api/expenses";
import { aiApi } from "@/api/ai";
import { Trip, SplitMethod } from "@/types";
import { Loader2, Sparkles, Check } from "lucide-react";

const CATEGORIES = ["Food", "Travel", "Accommodation", "Shopping", "Fuel", "Activities", "Emergency", "Entertainment", "Miscellaneous"];
const SPLIT_METHODS: { value: SplitMethod; label: string }[] = [
  { value: "equal", label: "Equal Split" },
  { value: "percentage", label: "Percentage" },
  { value: "custom", label: "Custom Amount" },
  { value: "selected", label: "Selected Members" },
];

export function ExpenseForm({ trip, open, onClose, onCreated }: { trip: Trip; open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [categorizing, setCategorizing] = useState(false);
  const [paidBy, setPaidBy] = useState(trip.members[0]?._id || "");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [selected, setSelected] = useState<string[]>(trip.members.map((m) => m._id));
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleSelected = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const runAutoCategorize = async () => {
    if (!title) return toast.error("Enter a title first");
    setCategorizing(true);
    try {
      const { category: c } = await aiApi.categorize(title, description);
      setCategory(c);
      toast.success(`AI suggested: ${c}`);
    } catch {
      toast.error("Couldn't reach AI categorizer");
    } finally {
      setCategorizing(false);
    }
  };

  const splitInput = useMemo(() => {
    if (splitMethod === "percentage" || splitMethod === "custom") {
      return selected.map((userId) => ({ userId, value: Number(customValues[userId]) || 0 }));
    }
    return undefined;
  }, [splitMethod, selected, customValues]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidBy) return toast.error("Fill in all required fields");
    setLoading(true);
    try {
      await expensesApi.create(trip._id, {
        title,
        description,
        amount: Number(amount),
        category: category || undefined,
        paidBy,
        splitMethod,
        participantIds: splitMethod === "equal" || splitMethod === "selected" ? selected : undefined,
        splitInput,
        date: new Date().toISOString(),
      });
      toast.success("Expense added");
      onCreated();
      onClose();
      setTitle("");
      setDescription("");
      setAmount("");
      setCategory("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Expense" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label-text">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Dinner at the beach shack" />
          </div>
          <div>
            <label className="label-text">Amount (₹)</label>
            <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" placeholder="1200" />
          </div>
          <div>
            <label className="label-text">Paid by</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="input-field">
              {trip.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label-text mb-0">Category</label>
              <button type="button" onClick={runAutoCategorize} className="flex items-center gap-1 text-xs font-medium text-accent-400 hover:text-accent-300">
                {categorizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Auto-detect
              </button>
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              <option value="">Let AI decide</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label-text">Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Add a note..." />
          </div>
        </div>

        <div>
          <label className="label-text">Split method</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SPLIT_METHODS.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => setSplitMethod(m.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  splitMethod === m.value ? "border-accent-500 bg-accent-500/15 text-white" : "border-base-border bg-base-900/60 text-white/50 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">Participants</label>
          <div className="space-y-2 rounded-xl border border-base-border bg-base-900/40 p-3">
            {trip.members.map((m) => {
              const isSelected = selected.includes(m._id);
              return (
                <div key={m._id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSelected(m._id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                      isSelected ? "border-accent-500 bg-accent-500" : "border-base-border"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </button>
                  <Avatar name={m.name} src={m.avatar} size="sm" />
                  <span className="flex-1 text-sm">{m.name}</span>
                  {isSelected && (splitMethod === "percentage" || splitMethod === "custom") && (
                    <input
                      type="number"
                      min="0"
                      className="input-field w-24 py-1.5 text-right"
                      placeholder={splitMethod === "percentage" ? "%" : "₹"}
                      value={customValues[m._id] || ""}
                      onChange={(e) => setCustomValues((v) => ({ ...v, [m._id]: e.target.value }))}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Add Expense"}
        </button>
      </form>
    </Modal>
  );
}
