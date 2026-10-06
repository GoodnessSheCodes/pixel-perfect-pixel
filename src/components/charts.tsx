import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Summary } from "@/lib/stats";
import { byCategory, byMonth } from "@/lib/stats";

const AXIS = { fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "IBM Plex Mono" };
const TIP = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  cursor: { fill: "var(--muted)" },
};

export function DonutChart({ s }: { s: Summary }) {
  const data = [
    { name: "Positive", value: s.positive, pct: s.pctPositive, fill: "var(--positive)" },
    { name: "Neutral", value: s.neutral, pct: s.pctNeutral, fill: "var(--neutral)" },
    { name: "Negative", value: s.negative, pct: s.pctNegative, fill: "var(--negative)" },
  ];
  return (
    <div className="relative h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip {...TIP} formatter={(v: number, n: string, p) => [`${v} texts (${(p.payload as { pct: number }).pct}%)`, n]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="tabular text-3xl font-semibold">{s.pctPositive}%</div>
          <div className="eyebrow">positive</div>
        </div>
      </div>
    </div>
  );
}

export function CountBar({ s }: { s: Summary }) {
  const data = [
    { name: "Positive", value: s.positive, fill: "var(--positive)" },
    { name: "Neutral", value: s.neutral, fill: "var(--neutral)" },
    { name: "Negative", value: s.negative, fill: "var(--negative)" },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...TIP} formatter={(v: number) => [`${v} texts`, "Count"]} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyStacked({ data }: { data: ReturnType<typeof byMonth> }) {
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...TIP} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Positive" stackId="a" fill="var(--positive)" />
          <Bar dataKey="Neutral" stackId="a" fill="var(--neutral)" />
          <Bar dataKey="Negative" stackId="a" fill="var(--negative)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreLine({ data }: { data: ReturnType<typeof byMonth> }) {
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
          <Tooltip {...TIP} formatter={(v: number) => [v.toFixed(2), "Mean score"]} />
          <Line type="monotone" dataKey="avgScore" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--highlight)", stroke: "var(--primary)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBars({ data }: { data: ReturnType<typeof byCategory> }) {
  return (
    <div style={{ height: Math.max(220, data.length * 52) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="category" tick={{ ...AXIS, fontFamily: "IBM Plex Sans", fontSize: 12 }} width={120} axisLine={false} tickLine={false} />
          <Tooltip {...TIP} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Positive" stackId="a" fill="var(--positive)" />
          <Bar dataKey="Neutral" stackId="a" fill="var(--neutral)" />
          <Bar dataKey="Negative" stackId="a" fill="var(--negative)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KeywordBars({ items, tone }: { items: { word: string; count: number }[]; tone: "positive" | "negative" }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (!items.length) return <p className="text-sm text-muted-foreground">No {tone} keywords found yet.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((k) => (
        <li key={k.word} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm">
          <span className="truncate">{k.word}</span>
          <span className="h-2 rounded-full bg-muted">
            <span className={`block h-2 rounded-full ${tone === "positive" ? "bg-positive" : "bg-negative"}`} style={{ width: `${(k.count / max) * 100}%` }} />
          </span>
          <span className="tabular text-right text-xs text-muted-foreground">{k.count}</span>
        </li>
      ))}
    </ul>
  );
}
