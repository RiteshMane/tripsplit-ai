import { useEffect, useState } from "react";
import { Plus, Map } from "lucide-react";
import { tripsApi } from "@/api/trips";
import { TripCard } from "@/components/trips/TripCard";
import { CreateTripModal } from "@/components/trips/CreateTripModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trip } from "@/types";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { trips } = await tripsApi.list();
    setTrips(trips);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Your Trips</h1>
          <p className="text-sm text-white/50">Manage every group adventure in one place</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Trip
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={<Map size={22} />}
          title="No trips yet"
          description="Create your first trip to start splitting expenses with your group."
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary mt-2">
              <Plus size={16} /> Create a Trip
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, i) => (
            <TripCard key={trip._id} trip={trip} index={i} />
          ))}
        </div>
      )}

      <CreateTripModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
    </div>
  );
}
