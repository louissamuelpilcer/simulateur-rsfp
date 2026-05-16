"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const AGE_LABELS = [
  "0–4","5–9","10–14","15–19","20–24","25–29","30–34","35–39",
  "40–44","45–49","50–54","55–59","60–64","65–69","70–74",
  "75–79","80–84","85–89","90–94","95–99","100+",
];

interface Row { annee: number; age_min: number; population: number }
type YearData = { label: string; pop: number; ageMin: number }[];
type AllData = Record<number, YearData>;

function formatPop(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
  return String(n);
}

function computeStats(data: YearData) {
  const total = data.reduce((s, d) => s + d.pop, 0);
  const young = data.filter(d => d.ageMin < 15).reduce((s, d) => s + d.pop, 0);
  const active = data.filter(d => d.ageMin >= 15 && d.ageMin < 60).reduce((s, d) => s + d.pop, 0);
  const senior = data.filter(d => d.ageMin >= 60).reduce((s, d) => s + d.pop, 0);
  const vieux = data.filter(d => d.ageMin >= 75).reduce((s, d) => s + d.pop, 0);
  // Median age (approximate)
  let cumul = 0; let medianGroup = 0;
  for (let i = 0; i < data.length; i++) {
    cumul += data[i].pop;
    if (cumul >= total / 2) { medianGroup = data[i].ageMin + 2; break; }
  }
  return { total, young, active, senior, vieux, medianGroup };
}

export default function InteractivePyramid() {
  const [allData, setAllData] = useState<AllData>({});
  const [year, setYear] = useState(2022);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch all projection data once
  useEffect(() => {
    async function load() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) { setError("Supabase non configuré"); setLoading(false); return; }

      const sb = createClient(url, key);
      const { data, error: err } = await sb
        .from("projections_demographie")
        .select("annee, age_min, population")
        .eq("scenario", "central")
        .order("annee")
        .order("age_min");

      if (err || !data?.length) {
        setError(err?.message ?? "Table introuvable — exécutez le seed SQL");
        setLoading(false);
        return;
      }

      const byYear: AllData = {};
      for (const row of data as Row[]) {
        if (!byYear[row.annee]) byYear[row.annee] = [];
        const idx = byYear[row.annee].length;
        byYear[row.annee].push({
          label: AGE_LABELS[idx] ?? `${row.age_min}+`,
          pop: row.population,
          ageMin: row.age_min,
        });
      }
      setAllData(byYear);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-play
  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setYear(y => {
          if (y >= 2070) { setPlaying(false); return 2070; }
          return y + 1;
        });
      }, 120);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing]);

  const data = allData[year] ?? [];
  const maxPop = Math.max(...Object.values(allData).flatMap(d => d.map(r => r.pop)), 1);
  const stats = data.length ? computeStats(data) : null;

  // Color by age: young = blue, old = deep red/brown (like aging)
  function barColor(ageMin: number) {
    if (ageMin < 15) return "#3B82F6";
    if (ageMin < 30) return "#2563EB";
    if (ageMin < 45) return "#1D4ED8";
    if (ageMin < 60) return "#4F46E5";
    if (ageMin < 75) return "#7C3AED";
    if (ageMin < 85) return "#9D174D";
    return "#991B1B";
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[500px] text-gray-400 text-sm gap-2">
      <span className="animate-spin text-lg">⟳</span> Chargement des projections…
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[500px] gap-3">
      <p className="text-red-500 text-sm font-medium">{error}</p>
      <p className="text-xs text-gray-400">Exécutez <code className="bg-gray-100 px-1 rounded">supabase/migrations/002_projections_demographie.sql</code> puis <code className="bg-gray-100 px-1 rounded">supabase/seed_projections.sql</code></p>
    </div>
  );

  const isProjection = year > 2026;

  return (
    <div className="select-none">
      {/* Year + stats header */}
      <div className="flex items-start justify-between mb-4 px-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-[#003189] tabular-nums leading-none">{year}</span>
            {isProjection && (
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Projection
              </span>
            )}
            {!isProjection && (
              <span className="text-xs font-semibold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                Données réelles
              </span>
            )}
          </div>
          {stats && (
            <p className="text-sm text-gray-500 mt-1">
              Population totale : <strong className="text-gray-800">{formatPop(stats.total)}</strong>
            </p>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "0–14 ans", value: `${((stats.young / stats.total) * 100).toFixed(1)} %`, color: "text-blue-700" },
              { label: "15–59 ans", value: `${((stats.active / stats.total) * 100).toFixed(1)} %`, color: "text-indigo-700" },
              { label: "60 ans et +", value: `${((stats.senior / stats.total) * 100).toFixed(1)} %`, color: "text-purple-700" },
              { label: "Âge médian", value: `≈ ${stats.medianGroup} ans`, color: "text-gray-700" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2">
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pyramid chart */}
      <div className="relative bg-white rounded-xl border border-gray-100 px-4 pt-3 pb-2">
        <div className="space-y-[3px]">
          {[...data].reverse().map((d) => {
            const pct = (d.pop / maxPop) * 100;
            return (
              <div key={d.ageMin} className="flex items-center gap-2 group">
                {/* Age label */}
                <span className="text-[10px] text-gray-400 w-10 text-right flex-shrink-0 font-mono">
                  {d.label}
                </span>
                {/* Bar */}
                <div className="flex-1 relative h-5">
                  <div
                    className="h-full rounded-r-sm transition-all duration-200 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: barColor(d.ageMin),
                      opacity: 0.85,
                    }}
                  />
                  {/* Value on hover */}
                  <span className="absolute left-2 top-0 h-full flex items-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPop(d.pop)}
                  </span>
                </div>
                {/* Pop label */}
                <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 font-mono">
                  {formatPop(d.pop)}
                </span>
              </div>
            );
          })}
        </div>

        {/* X axis label */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-300">← Population totale (hommes + femmes) →</span>
        </div>
      </div>

      {/* Slider + controls */}
      <div className="mt-4 px-2">
        <div className="flex items-center gap-4">
          {/* Play/pause */}
          <button
            onClick={() => { setPlaying(p => !p); if (year >= 2070) setYear(2021); }}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#003189] text-white flex items-center justify-center hover:bg-[#001F5E] transition-colors shadow-sm"
            title={playing ? "Pause" : "Lecture"}
          >
            {playing ? "⏸" : "▶"}
          </button>

          {/* Slider */}
          <div className="flex-1">
            <input
              type="range"
              min={2021}
              max={2070}
              value={year}
              onChange={e => { setPlaying(false); setYear(+e.target.value); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${year <= 2026 ? "#16A34A" : "#7C3AED"} 0%, ${
                  year <= 2026 ? "#16A34A" : "#7C3AED"
                } ${((year - 2021) / 49) * 100}%, #E5E7EB ${((year - 2021) / 49) * 100}%, #E5E7EB 100%)`,
              }}
            />
            {/* Year markers */}
            <div className="flex justify-between text-[9px] text-gray-400 mt-1 px-0.5">
              {[2021, 2030, 2040, 2050, 2060, 2070].map(y => (
                <button key={y} onClick={() => { setPlaying(false); setYear(y); }}
                  className={`hover:text-gray-600 transition-colors ${year === y ? "font-bold text-[#003189]" : ""}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span>Données réelles (2021–2026)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Projection scénario central INSEE (2027–2070)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
