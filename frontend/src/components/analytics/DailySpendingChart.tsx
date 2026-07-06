import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { DailySpendingItem } from "@/types";

export function DailySpendingChart({ data }: { data: DailySpendingItem[] }) {
  if (data.length === 0) return <div className="flex h-64 items-center justify-center text-sm text-white/30">No daily spending yet</div>;
  const max = Math.max(...data.map((d) => d.amount));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#191C27" vertical={false} />
        <XAxis dataKey="date" stroke="#5b5f6e" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(d) => new Date(d).getDate().toString()} />
        <YAxis stroke="#5b5f6e" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#12141C", border: "1px solid #22252F", borderRadius: 12, fontSize: 12 }}
          formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
        />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.date} fill={d.amount === max ? "#8B7CF6" : "#2A2E3C"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
