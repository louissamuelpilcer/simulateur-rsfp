"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Papa from "papaparse";

interface Row {
  year: number;
  sex: "M" | "F";
  age: number;
  pop: number;
}

interface AgeGroup {
  label: string;
  ageMin: number;
  ageMax: number;
}

const AGE_GROUPS: AgeGroup[] = [
  { label: "0-4", ageMin: 0, ageMax: 4 },
  { label: "5-9", ageMin: 5, ageMax: 9 },
  { label: "10-14", ageMin: 10, ageMax: 14 },
  { label: "15-19", ageMin: 15, ageMax: 19 },
  { label: "20-24", ageMin: 20, ageMax: 24 },
  { label: "25-29", ageMin: 25, ageMax: 29 },
  { label: "30-34", ageMin: 30, ageMax: 34 },
  { label: "35-39", ageMin: 35, ageMax: 39 },
  { label: "40-44", ageMin: 40, ageMax: 44 },
  { label: "45-49", ageMin: 45, ageMax: 49 },
  { label: "50-54", ageMin: 50, ageMax: 54 },
  { label: "55-59", ageMin: 55, ageMax: 59 },
  { label: "60-64", ageMin: 60, ageMax: 64 },
  { label: "65-69", ageMin: 65, ageMax: 69 },
  { label: "70-74", ageMin: 70, ageMax: 74 },
  { label: "75-79", ageMin: 75, ageMax: 79 },
  { label: "80+", ageMin: 80, ageMax: 99 },
];

const fmt = (v: number) => `${(Math.abs(v) / 1000).toFixed(0)} k`;

interface Props {
  year?: number;
  compareYear?: number;
}

export default function PopulationPyramidChart({ year = 2022, compareYear }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/pyramide_age.csv")
      .then((r) => r.text())
      .then((text) => {
        const result = Papa.parse<{ ANNEE: string; SEXE: string; AGE: string; POP: string }>(text, {
          header: true,
          delimiter: ";",
          skipEmptyLines: true,
        });
        setRows(
          result.data
            .filter((r) => r.ANNEE && r.SEXE && r.AGE !== undefined)
            .map((r) => ({
              year: parseInt(r.ANNEE),
              sex: r.SEXE as "M" | "F",
              age: parseInt(r.AGE),
              pop: parseInt(r.POP),
            }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const yearRows = rows.filter((r) => r.year === year);
    const cmpRows = compareYear ? rows.filter((r) => r.year === compareYear) : [];

    return AGE_GROUPS.map((g) => {
      const m = yearRows
        .filter((r) => r.sex === "M" && r.age >= g.ageMin && r.age <= g.ageMax)
        .reduce((s, r) => s + r.pop, 0);
      const f = yearRows
        .filter((r) => r.sex === "F" && r.age >= g.ageMin && r.age <= g.ageMax)
        .reduce((s, r) => s + r.pop, 0);
      const cmpM = cmpRows
        .filter((r) => r.sex === "M" && r.age >= g.ageMin && r.age <= g.ageMax)
        .reduce((s, r) => s + r.pop, 0);
      const cmpF = cmpRows
        .filter((r) => r.sex === "F" && r.age >= g.ageMin && r.age <= g.ageMax)
        .reduce((s, r) => s + r.pop, 0);
      return {
        label: g.label,
        hommes: -m,
        femmes: f,
        cmpHommes: cmpM ? -cmpM : undefined,
        cmpFemmes: cmpF || undefined,
      };
    });
  }, [rows, year, compareYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
        Chargement des données…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
        Données non disponibles
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center gap-6 text-xs mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block bg-[#003189]" /> Hommes {year}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block bg-[#E1000F]" /> Femmes {year}
        </span>
        {compareYear && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block bg-blue-200" /> Hommes {compareYear}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block bg-red-200" /> Femmes {compareYear}
            </span>
          </>
        )}
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
          barGap={2}
          barCategoryGap="15%"
        >
          <XAxis
            type="number"
            tickFormatter={fmt}
            tick={{ fontSize: 10 }}
            domain={["auto", "auto"]}
          />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(v: number) => [`${fmt(v)} personnes`]}
            labelFormatter={(l) => `Tranche ${l} ans`}
          />
          {compareYear && (
            <>
              <Bar dataKey="cmpHommes" name={`Hommes ${compareYear}`} fill="#BFDBFE" barSize={6} />
              <Bar dataKey="cmpFemmes" name={`Femmes ${compareYear}`} fill="#FECACA" barSize={6} />
            </>
          )}
          <Bar dataKey="hommes" name={`Hommes ${year}`} fill="#003189" barSize={compareYear ? 6 : 12} />
          <Bar dataKey="femmes" name={`Femmes ${year}`} fill="#E1000F" barSize={compareYear ? 6 : 12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
