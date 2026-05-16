"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Papa from "papaparse";

interface Row {
  year: number;
  sex: "M" | "F";
  age: number;
  pop: number;
}

interface YearTotal {
  year: number;
  total: number;
  young: number;
  active: number;
  senior: number;
}

const fmtM = (v: number) => `${(v / 1_000_000).toFixed(1)} M`;

export default function PopulationTrendChart() {
  const [data, setData] = useState<YearTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/pyramide_age.csv")
      .then((r) => r.text())
      .then((text) => {
        const parsed = Papa.parse<{ ANNEE: string; SEXE: string; AGE: string; POP: string }>(text, {
          header: true,
          delimiter: ";",
          skipEmptyLines: true,
        });
        const rows: Row[] = parsed.data
          .filter((r) => r.ANNEE && r.AGE !== undefined)
          .map((r) => ({
            year: parseInt(r.ANNEE),
            sex: r.SEXE as "M" | "F",
            age: parseInt(r.AGE),
            pop: parseInt(r.POP),
          }));

        const byYear: Record<number, YearTotal> = {};
        for (const r of rows) {
          if (!byYear[r.year]) byYear[r.year] = { year: r.year, total: 0, young: 0, active: 0, senior: 0 };
          byYear[r.year].total += r.pop;
          if (r.age < 15) byYear[r.year].young += r.pop;
          else if (r.age < 60) byYear[r.year].active += r.pop;
          else byYear[r.year].senior += r.pop;
        }
        setData(Object.values(byYear).sort((a, b) => a.year - b.year));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Chargement…</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="gradYoung" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#003189" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#003189" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSenior" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E1000F" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#E1000F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} width={65} />
        <Tooltip formatter={(v: number) => [fmtM(v)]} labelFormatter={(l) => `Année ${l}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine x={2022} stroke="#9CA3AF" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="young" name="0–14 ans" stroke="#16A34A" fill="url(#gradYoung)" strokeWidth={2} />
        <Area type="monotone" dataKey="active" name="15–59 ans" stroke="#003189" fill="url(#gradActive)" strokeWidth={2} />
        <Area type="monotone" dataKey="senior" name="60 ans et +" stroke="#E1000F" fill="url(#gradSenior)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
