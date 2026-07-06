import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-500" />
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
