import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Compass, Users, CalendarDays, Wallet, Sparkles, Loader2, MapPin, PiggyBank, ArrowRight, Navigation, Plane, Train, Bus, Car, Bike } from "lucide-react";
import { Link } from "react-router-dom";
import { aiApi } from "@/api/ai";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/utils";
import { getCategoryMeta } from "@/components/expenses/categoryMeta";
import { TripPlan } from "@/types";

const MOTIVES = ["Relaxation & Beaches", "Adventure & Trekking", "Cultural & Sightseeing", "Party & Nightlife", "Nature & Wildlife", "Road Trip", "Other"];
const TRANSPORT_MODES = [
  { value: "Flight", icon: Plane },
  { value: "Train", icon: Train },
  { value: "Bus", icon: Bus },
  { value: "Car (Self-drive)", icon: Car },
  { value: "Bike", icon: Bike },
];

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [departureFrom, setDepartureFrom] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [people, setPeople] = useState("4");
  const [days, setDays] = useState("4");
  const [motive, setMotive] = useState(MOTIVES[0]);
  const [customMotive, setCustomMotive] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMotive = motive === "Other" ? customMotive : motive;
    if (!finalMotive.trim()) return toast.error("Tell us the motive of your trip");
    setLoading(true);
    setPlan(null);
    try {
      const { plan } = await aiApi.tripPlanner({
        destination: destination || undefined,
        people: Number(people),
        days: Number(days),
        motive: finalMotive,
        budget: budget ? Number(budget) : undefined,
        departureFrom: departureFrom || undefined,
        transportMode: transportMode || undefined,
      });
      setPlan(plan);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't generate a plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const maxBreakdown = plan ? Math.max(...plan.budgetBreakdown.map((b) => b.amount), 1) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Trip Planner</h1>
        <p className="text-sm text-white/50">Tell the AI who's going, for how long, and why — get a full itinerary and budget instantly</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="glass-card sticky top-20 h-fit space-y-4 p-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-mint-500 shadow-glow">
              <Compass size={18} className="text-white" />
            </div>
            <h3 className="font-display text-sm font-semibold">Plan your trip</h3>
          </div>

          <div>
            <label className="label-text">Destination (optional)</label>
            <div className="relative">
              <MapPin size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field pl-9" placeholder="Leave blank for AI suggestions" />
            </div>
          </div>

          <div>
            <label className="label-text">Departure from (optional)</label>
            <div className="relative">
              <Navigation size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={departureFrom} onChange={(e) => setDepartureFrom(e.target.value)} className="input-field pl-9" placeholder="e.g. Mumbai" />
            </div>
            <p className="mt-1 text-[11px] text-white/30">Helps estimate realistic travel costs</p>
          </div>

          <div>
            <label className="label-text">Mode of transport (optional)</label>
            <div className="grid grid-cols-5 gap-2">
              {TRANSPORT_MODES.map(({ value, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setTransportMode(transportMode === value ? "" : value)}
                  title={value}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[10px] font-medium transition-colors ${
                    transportMode === value ? "border-accent-500 bg-accent-500/15 text-white" : "border-base-border bg-base-900/60 text-white/40 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {value.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Members</label>
              <div className="relative">
                <Users size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input required type="number" min="1" value={people} onChange={(e) => setPeople(e.target.value)} className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="label-text">Days</label>
              <div className="relative">
                <CalendarDays size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input required type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} className="input-field pl-9" />
              </div>
            </div>
          </div>

          <div>
            <label className="label-text">Motive of the trip</label>
            <select value={motive} onChange={(e) => setMotive(e.target.value)} className="input-field">
              {MOTIVES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <AnimatePresence>
            {motive === "Other" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label className="label-text">Describe your motive</label>
                <input value={customMotive} onChange={(e) => setCustomMotive(e.target.value)} className="input-field" placeholder="e.g. college farewell trip" />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="label-text">Approximate budget, total (optional)</label>
            <div className="relative">
              <Wallet size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} className="input-field pl-9" placeholder="Let AI estimate one" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Planning your trip...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Itinerary
              </>
            )}
          </button>
        </motion.form>

        {/* Results */}
        <div className="space-y-6">
          {!plan && !loading && (
            <div className="glass-card flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400">
                <Compass size={22} />
              </div>
              <h3 className="font-display text-base font-semibold">Your plan will show up here</h3>
              <p className="max-w-sm text-sm text-white/50">Fill in the details on the left and let AI put together a day-by-day plan with an estimated budget.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <Loader2 size={24} className="animate-spin text-accent-400" />
              <p className="text-sm text-white/50">Crafting your itinerary and crunching the numbers...</p>
            </div>
          )}

          {plan && (
            <>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
                <span className="rounded-full border border-base-border bg-base-900/60 px-3 py-1.5 text-xs text-white/60">
                  <Users size={12} className="mr-1.5 inline" /> {people} people
                </span>
                <span className="rounded-full border border-base-border bg-base-900/60 px-3 py-1.5 text-xs text-white/60">
                  <CalendarDays size={12} className="mr-1.5 inline" /> {days} days
                </span>
                {departureFrom && (
                  <span className="rounded-full border border-base-border bg-base-900/60 px-3 py-1.5 text-xs text-white/60">
                    <Navigation size={12} className="mr-1.5 inline" /> from {departureFrom}
                  </span>
                )}
                {transportMode && (
                  <span className="rounded-full border border-base-border bg-base-900/60 px-3 py-1.5 text-xs text-white/60">via {transportMode}</span>
                )}
              </motion.div>

              {plan.suggestedDestination && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card flex items-center gap-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">AI-Suggested Destination</p>
                    <p className="font-display text-lg font-bold">{plan.suggestedDestination}</p>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Estimated Total Cost</p>
                  <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(plan.totalEstimatedCost)}</p>
                  <p className="mt-1 text-xs text-white/40">for {people} people · {days} days</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Per Person</p>
                  <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(plan.totalEstimatedCost / Number(people || 1))}</p>
                  <p className="mt-1 text-xs text-white/40">approximate share</p>
                </motion.div>
              </div>

              {/* Budget breakdown */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                <h3 className="mb-4 font-display text-sm font-semibold text-white/80">Budget Breakdown</h3>
                <div className="space-y-3">
                  {plan.budgetBreakdown.map((b, i) => {
                    const meta = getCategoryMeta(b.category);
                    const Icon = meta.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: meta.color + "22", color: meta.color }}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate">{b.category}</span>
                            <span className="font-semibold">{formatCurrency(b.amount)}</span>
                          </div>
                          <div className="mt-1">
                            <ProgressBar percent={(b.amount / maxBreakdown) * 100} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Itinerary */}
              <div>
                <h3 className="mb-3 font-display text-sm font-semibold text-white/80">Day-by-Day Itinerary</h3>
                <div className="space-y-3">
                  {plan.itinerary.map((day, i) => (
                    <motion.div key={day.day} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card flex gap-4 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 font-display text-sm font-bold text-accent-400">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-sm font-semibold">{day.title}</p>
                          <span className="text-xs font-medium text-white/50">~{formatCurrency(day.estimatedCost)}</span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {day.activities.map((a, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-white/60">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Saving tips */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative overflow-hidden p-5">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint-500/15 blur-3xl" />
                <div className="relative flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-mint-500 to-accent-500">
                    <PiggyBank size={15} className="text-white" />
                  </div>
                  <h3 className="font-display text-sm font-semibold">Ways to Save</h3>
                </div>
                <div className="relative mt-3 space-y-2.5">
                  {plan.savingTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <Sparkles size={13} className="mt-0.5 shrink-0 text-mint-500" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card flex flex-wrap items-center justify-between gap-3 p-5">
                <p className="text-sm text-white/60">Ready to make it official? Create the trip and start adding real expenses.</p>
                <Link to="/trips" className="btn-primary shrink-0">
                  Create This Trip <ArrowRight size={16} />
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
