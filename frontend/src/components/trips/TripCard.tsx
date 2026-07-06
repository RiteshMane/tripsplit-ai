import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/utils";
import { Trip } from "@/types";

const COVER_FALLBACKS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=60",
  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&q=60",
];

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const spent = trip.totalSpent || 0;
  const pct = trip.budget > 0 ? Math.round((spent / trip.budget) * 100) : 0;
  const cover = trip.coverImage || COVER_FALLBACKS[index % COVER_FALLBACKS.length];
  const balance = trip.myBalance || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link to={`/trips/${trip._id}`} className="glass-card glass-card-hover group block overflow-hidden">
        <div className="relative h-32 w-full overflow-hidden">
          <img src={cover} alt={trip.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/20 to-transparent" />
          <div className="absolute bottom-2 left-4 right-4">
            <h3 className="font-display text-lg font-bold text-white">{trip.title}</h3>
            <p className="flex items-center gap-1 text-xs text-white/70">
              <MapPin size={12} /> {trip.destination}
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Spent</span>
            <span className="font-semibold">
              {formatCurrency(spent)} <span className="text-white/30">/ {formatCurrency(trip.budget)}</span>
            </span>
          </div>
          <ProgressBar percent={pct} />

          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-2">
              {trip.members.slice(0, 4).map((m) => (
                <Avatar key={m._id} name={m.name} src={m.avatar} size="sm" className="ring-2 ring-base-800" />
              ))}
              {trip.members.length > 4 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-base-700 text-[10px] font-medium text-white/60 ring-2 ring-base-800">
                  +{trip.members.length - 4}
                </div>
              )}
            </div>
            <span
              className={`text-xs font-semibold ${balance > 0 ? "text-mint-500" : balance < 0 ? "text-coral-500" : "text-white/40"}`}
            >
              {balance > 0 ? `You're owed ${formatCurrency(balance)}` : balance < 0 ? `You owe ${formatCurrency(Math.abs(balance))}` : "Settled up"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
