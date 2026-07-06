import { Search, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({ placeholder = "Search expenses or trips..." }: { placeholder?: string }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-base-border bg-base-950/70 px-6 py-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="input-field pl-10" placeholder={placeholder} />
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-white/60 transition-colors hover:bg-base-700 hover:text-white">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-coral-500" />
        </button>
        <Avatar name={user?.name || "?"} src={user?.avatar} />
      </div>
    </header>
  );
}
