import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { Toaster } from "react-hot-toast";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-base-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#12141C", color: "#fff", border: "1px solid #22252F" },
        }}
      />
    </div>
  );
}
