import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, BellOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({ placeholder = "Search expenses or trips..." }: { placeholder?: string }) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-base-border bg-base-950/70 px-6 py-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="input-field pl-10" placeholder={placeholder} />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-full p-2 text-white/60 transition-colors hover:bg-base-700 hover:text-white"
          >
            <Bell size={18} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                {/* Invisible backdrop to close the dropdown on outside click */}
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-base-border bg-base-900/95 shadow-glass backdrop-blur-xl"
                >
                  <div className="border-b border-base-border px-4 py-3">
                    <p className="font-display text-sm font-semibold">Notifications</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                    <BellOff size={20} className="text-white/30" />
                    <p className="text-sm text-white/50">You're all caught up</p>
                    <p className="text-xs text-white/30">
                      New expenses and settlements update live while you're on a trip page &mdash; standalone
                      notifications are coming soon.
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <Link to="/profile" className="transition-opacity hover:opacity-80">
          <Avatar name={user?.name || "?"} src={user?.avatar} />
        </Link>
      </div>
    </header>
  );
}
