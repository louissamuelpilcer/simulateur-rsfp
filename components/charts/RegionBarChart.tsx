"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getRegionSummaries } from "@/lib/mock-data";

const REGIONS_ORDER = [
  "Île-de-France",
  "Auvergne-Rhône-Alpes",
  "Hauts-de-France",
  "Occitanie",
  "Nouvelle-Aquitaine",
  "Provence-Alpes-Côte d'Azur",
  "Grand Est",
  "Pays de la Loire",
  "Normandie",
  "Bretagne",
  "Bourgogne-Franche-Comté",
  "Centre-Val de Loire",
  "Corse",
  "Guadeloupe",
  "Martinique",
  "La Réunion",
  "Guyane",
  "Mayotte",
];

interface Props {
  metric: "agents_pour_mille" | "taux_vieillissement" | "agents_total" | "population";
}

const METRIC_CONFIG = {
  agents_pour_mille: { label: "Agents FP / 1 000 hab.", format: (v: number) => `${v.toFixed(1)} ‰`, color: "#003189" },
  taux_vieillissement: { label: "Taux de vieillissement (%)", format: (v: number) => `${(v * 100).toFixed(1)} %`, color: "#7C3AED" },
  agents_total: { label: "Total agents FP", format: (v: number) => `${Math.round(v / 1000)} k`, color: "#16A34A" },
  population: { label: "Population (millions)", format: (v: number) => `${(v / 1e6).toFixed(2)} M`, color: "#0369A1" },
};

export default function RegionBarChart({ metric }: Props) {
  const summaries = getRegionSummaries();
  const config = METRIC_CONFIG[metric];
  const sorted = summaries
    .map((s) => ({ ...s, value: s[metric] }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 30, left: 130, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tickFormatter={config.format} tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="region" tick={{ fontSize: 10 }} width={130} />
        <Tooltip formatter={(v: number) => [config.format(v), config.label]} />
        <Bar dataKey="value" name={config.label} radius={[0, 4, 4, 0]}>
          {sorted.map((entry, idx) => (
            <Cell
              key={entry.region}
              fill={idx === 0 ? "#001F5E" : config.color}
              opacity={1 - idx * 0.04}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
