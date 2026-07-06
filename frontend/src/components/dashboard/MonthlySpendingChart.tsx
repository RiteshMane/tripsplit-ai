import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function MonthlySpendingChart({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-white/30">No spending data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B7CF6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#8B7CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#191C27" vertical={false} />
        <XAxis dataKey="month" stroke="#5b5f6e" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#5b5f6e" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#12141C", border: "1px solid #22252F", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#fff" }}
          formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
        />
        <Area type="monotone" dataKey="amount" stroke="#8B7CF6" strokeWidth={2.5} fill="url(#spendGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
