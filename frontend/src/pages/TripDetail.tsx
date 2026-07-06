import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ChevronLeft, MapPin, Calendar } from "lucide-react";
import { tripsApi } from "@/api/trips";
import { analyticsApi } from "@/api/analytics";
import { useTripRoom } from "@/hooks/useTripRoom";
import { useSocket } from "@/context/SocketContext";
import { TripOverview } from "@/components/trips/TripOverview";
import { ExpensesPanel } from "@/components/expenses/ExpensesPanel";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { SettlementsPanel } from "@/components/settlements/SettlementsPanel";
import { TripSettingsPanel } from "@/components/trips/TripSettingsPanel";
import { AskAIWidget } from "@/components/trips/AskAIWidget";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trip, TripAnalytics } from "@/types";
import { cn, formatDate } from "@/lib/utils";

const TABS = ["Overview", "Expenses", "Analytics", "Settlements", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [analytics, setAnalytics] = useState<TripAnalytics | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const socket = useSocket();

  useTripRoom(id);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ trip }, analyticsRes] = await Promise.all([tripsApi.get(id), analyticsApi.tripAnalytics(id)]);
    setTrip(trip);
    setAnalytics(analyticsRes);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: refresh whenever any collaborator adds/edits/deletes an expense or settlement
  useEffect(() => {
    if (!socket) return;
    const refresh = (label: string) => {
      toast(label, { icon: "⚡" });
      load();
    };
    socket.on("expense:created", () => refresh("New expense added"));
    socket.on("expense:updated", () => refresh("Expense updated"));
    socket.on("expense:deleted", () => refresh("Expense removed"));
    socket.on("settlements:updated", () => refresh("Settlements recalculated"));
    socket.on("settlement:paid", () => refresh("Settlement marked as paid"));
    return () => {
      socket.off("expense:created");
      socket.off("expense:updated");
      socket.off("expense:deleted");
      socket.off("settlements:updated");
      socket.off("settlement:paid");
    };
  }, [socket, load]);

  if (!trip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/trips" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
        <ChevronLeft size={16} /> Back to trips
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="relative h-36 w-full sm:h-44">
          <img
            src={trip.coverImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60"}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{trip.title}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/70 sm:text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {trip.destination}
                </span>
                {trip.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {formatDate(trip.startDate)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t border-base-border px-3 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === t ? "bg-accent-500/15 text-white" : "text-white/50 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      <div>
        {tab === "Overview" && <TripOverview trip={trip} analytics={analytics} />}
        {tab === "Expenses" && <ExpensesPanel trip={trip} onChanged={load} />}
        {tab === "Analytics" && <AnalyticsPanel tripId={trip._id} />}
        {tab === "Settlements" && <SettlementsPanel tripId={trip._id} />}
        {tab === "Settings" && <TripSettingsPanel trip={trip} onUpdated={load} />}
      </div>

      <AskAIWidget tripId={trip._id} />
    </div>
  );
}
