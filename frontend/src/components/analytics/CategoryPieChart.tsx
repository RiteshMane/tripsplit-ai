import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getCategoryMeta } from "@/components/expenses/categoryMeta";
import { CategoryBreakdownItem } from "@/types";

export function CategoryPieChart({ data }: { data: CategoryBreakdownItem[] }) {
  if (data.length === 0) return <div className="flex h-64 items-center justify-center text-sm text-white/30">No category data yet</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="category" innerRadius={60} outerRadius={95} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={getCategoryMeta(entry.category).color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#12141C", border: "1px solid #22252F", borderRadius: 12, fontSize: 12 }}
          formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
