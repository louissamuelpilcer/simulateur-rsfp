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
} from "recharts";
import { FEMINISATION } from "@/lib/mock-data";

export default function FeminisationChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={FEMINISATION} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis domain={[55, 82]} tickFormatter={(v) => `${v} %`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [`${v.toFixed(1)} %`]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="etat" name="FP État" stroke="#003189" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="territoriale" name="FP Territoriale" stroke="#16A34A" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="hospitaliere" name="FP Hospitalière" stroke="#E1000F" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
