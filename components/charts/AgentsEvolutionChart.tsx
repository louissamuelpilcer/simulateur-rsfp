"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HISTORICAL_FP, PROJECTIONS_BASELINE } from "@/lib/mock-data";

const fmt = (v: number) => `${(v / 1_000_000).toFixed(2)} M`;

const allData = [
  ...HISTORICAL_FP.map((d) => ({ ...d, projected: false })),
  ...PROJECTIONS_BASELINE.map((d) => ({ ...d, projected: true })),
];

export default function AgentsEvolutionChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={allData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={70} />
        <Tooltip
          formatter={(v: number, name: string) => [fmt(v), name]}
          labelFormatter={(l) => `Année ${l}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine x={2022} stroke="#6B7280" strokeDasharray="4 4" label={{ value: "Actuel", fontSize: 10, fill: "#6B7280" }} />
        <Line type="monotone" dataKey="etat" name="FP État" stroke="#003189" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="territoriale" name="FP Territoriale" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="hospitaliere" name="FP Hospitalière" stroke="#E1000F" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
