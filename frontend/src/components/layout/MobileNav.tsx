import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Compass, BarChart3, UserCircle } from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: Map },
  { to: "/trip-planner", label: "Planner", icon: Compass },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-base-border bg-base-900/90 py-2 backdrop-blur-xl lg:hidden">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] font-medium ${
              isActive ? "text-accent-400" : "text-white/40"
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
