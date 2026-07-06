import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Activity, BarChart3, UserCircle, Sparkles, LogOut, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { motion } from "framer-motion";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: Map },
  { to: "/trip-planner", label: "Trip Planner", icon: Compass },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-base-border bg-base-900/60 px-5 py-6 backdrop-blur-xl lg:flex">
      <div className="mb-10 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-mint-500 shadow-glow">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none">TripSplit</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">AI Powered</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-accent-500/15 text-white" : "text-white/50 hover:bg-base-700/60 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-xl border border-accent-500/30" />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-base-border bg-base-800/60 p-3">
        <Avatar name={user?.name || "?"} src={user?.avatar} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-white/40">{user?.email}</p>
        </div>
        <button onClick={logout} title="Log out" className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-base-700 hover:text-coral-500">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
