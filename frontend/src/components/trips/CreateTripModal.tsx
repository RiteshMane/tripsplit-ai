import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { tripsApi } from "@/api/trips";
import { Loader2 } from "lucide-react";

export function CreateTripModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "",
    destination: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    memberEmails: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tripsApi.create({
        title: form.title,
        destination: form.destination,
        description: form.description,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        budget: Number(form.budget) || 0,
        memberEmails: form.memberEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      });
      toast.success("Trip created!");
      onCreated();
      onClose();
      setForm({ title: "", destination: "", description: "", startDate: "", endDate: "", budget: "", memberEmails: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a new trip">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label-text">Trip name</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} className="input-field" placeholder="Goa Trip" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Destination</label>
            <input required value={form.destination} onChange={(e) => set("destination", e.target.value)} className="input-field" placeholder="Goa, India" />
          </div>
          <div>
            <label className="label-text">Start date</label>
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">End date</label>
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Total budget (₹)</label>
            <input type="number" min="0" value={form.budget} onChange={(e) => set("budget", e.target.value)} className="input-field" placeholder="25000" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Invite members (comma-separated emails)</label>
            <input value={form.memberEmails} onChange={(e) => set("memberEmails", e.target.value)} className="input-field" placeholder="friend@example.com, other@example.com" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="What's this trip about?" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Trip"}
        </button>
      </form>
    </Modal>
  );
}
