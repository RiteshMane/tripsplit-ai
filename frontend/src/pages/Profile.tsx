import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Moon, Sun, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({ name, avatar });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = async () => {
    await updateUser({ darkMode: !user?.darkMode });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <p className="text-sm text-white/50">Manage your account preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-4 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={name || "?"} src={avatar} size="lg" />
          <div className="flex-1">
            <label className="label-text">Avatar URL</label>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="input-field" placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="label-text">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-text">Email</label>
          <input value={user?.email} disabled className="input-field opacity-50" />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          {user?.darkMode ? <Moon size={18} className="text-accent-400" /> : <Sun size={18} className="text-amber-500" />}
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-white/40">TripSplit AI is designed dark-first for a premium feel</p>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`relative h-6 w-11 rounded-full transition-colors ${user?.darkMode ? "bg-accent-500" : "bg-base-700"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${user?.darkMode ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </motion.div>
    </div>
  );
}
