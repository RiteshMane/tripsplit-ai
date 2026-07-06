import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Trash2, UserPlus, Save, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { tripsApi } from "@/api/trips";
import { Trip } from "@/types";

export function TripSettingsPanel({ trip, onUpdated }: { trip: Trip; onUpdated: () => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: trip.title,
    destination: trip.destination,
    budget: String(trip.budget),
    description: trip.description || "",
  });
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await tripsApi.update(trip._id, { ...form, budget: Number(form.budget) });
      toast.success("Trip updated");
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update trip");
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!email) return;
    try {
      await tripsApi.addMember(trip._id, email);
      toast.success("Member added");
      setEmail("");
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await tripsApi.removeMember(trip._id, memberId);
      toast.success("Member removed");
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    try {
      await tripsApi.remove(trip._id);
      toast.success("Trip deleted");
      navigate("/trips");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete trip");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card space-y-4 p-5">
        <h3 className="font-display text-sm font-semibold">Edit Trip Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label-text">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Destination</label>
            <input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Budget (₹)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field min-h-[80px] resize-none" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="glass-card space-y-4 p-5">
        <h3 className="font-display text-sm font-semibold">Members</h3>
        <div className="space-y-2">
          {trip.members.map((m) => (
            <div key={m._id} className="flex items-center gap-3 rounded-xl border border-base-border bg-base-900/40 p-2.5">
              <Avatar name={m.name} src={m.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-white/40">{m.email}</p>
              </div>
              {trip.members.length > 1 && (
                <button onClick={() => removeMember(m._id)} className="rounded-lg p-1.5 text-white/30 hover:bg-base-700 hover:text-coral-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="friend@example.com" />
          <button onClick={addMember} className="btn-ghost shrink-0">
            <UserPlus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="glass-card space-y-3 border-coral-500/30 p-5">
        <h3 className="font-display text-sm font-semibold text-coral-500">Danger Zone</h3>
        <p className="text-xs text-white/40">Deleting a trip permanently removes all its expenses and settlements.</p>
        <button onClick={remove} className="inline-flex items-center gap-2 rounded-full border border-coral-500/40 px-5 py-2.5 text-sm font-medium text-coral-500 transition-colors hover:bg-coral-500/10">
          <Trash2 size={15} /> Delete Trip
        </button>
      </div>
    </div>
  );
}
