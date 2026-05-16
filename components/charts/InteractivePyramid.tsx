"use client";

import { useEffect, useState, useRef } from "react";

const AGE_LABELS = [
  "0–4","5–9","10–14","15–19","20–24","25–29","30–34","35–39",
  "40–44","45–49","50–54","55–59","60–64","65–69","70–74",
  "75–79","80–84","85–89","90–94","95–99","100+",
];

const AGE_GROUPS: [number, number][] = [
  [0,4],[5,9],[10,14],[15,19],[20,24],[25,29],[30,34],[35,39],
  [40,44],[45,49],[50,54],[55,59],[60,64],[65,69],[70,74],
  [75,79],[80,84],[85,89],[90,94],[95,99],[100,120],
];

// INSEE central scenario targets (millions) for calibration
const TARGETS: Record<number, number> = {
  2030:68.5,2031:68.7,2032:68.9,2033:69.0,2034:69.2,2035:69.4,
  2036:69.6,2037:69.8,2038:70.0,2039:70.2,2040:70.4,2041:70.6,
  2042:70.8,2043:71.0,2044:71.2,2045:71.4,2046:71.5,2047:71.6,
  2048:71.7,2049:71.8,2050:72.0,2051:72.1,2052:72.2,2053:72.3,
  2054:72.4,2055:72.5,2056:72.6,2057:72.7,2058:72.8,2059:72.9,
  2060:73.0,2061:73.1,2062:73.2,2063:73.2,2064:73.3,2065:73.3,
  2066:73.4,2067:73.4,2068:73.5,2069:73.5,2070:73.5,
};

const ANCHORS: [number, number][] = [
  [0,0.00330],[1,0.00025],[5,0.00009],[10,0.00009],[15,0.00021],
  [20,0.00055],[25,0.00063],[30,0.00085],[35,0.00130],[40,0.00202],
  [45,0.00322],[50,0.00512],[55,0.00793],[60,0.01060],[65,0.01600],
  [70,0.02500],[75,0.04040],[80,0.06620],[85,0.11250],[90,0.18300],
  [95,0.28500],[99,0.45000],
];

function buildQx() {
  const t: Record<number, number> = {};
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [a0, r0] = ANCHORS[i], [a1, r1] = ANCHORS[i + 1];
    for (let a = a0; a < a1; a++) t[a] = r0 + (r1 - r0) * (a - a0) / (a1 - a0);
  }
  t[99] = 0.45;
  return t;
}
const QX = buildQx();

function qx(age: number, offset: number) {
  return (QX[Math.min(age, 99)] ?? 0.45) * Math.max(0.8, 1 - 0.005 * offset);
}

type AgePop = Record<number, number>;
type YearData = { label: string; pop: number; ageMin: number }[];
type AllData = Record<number, YearData>;

function toYearData(agePop: AgePop): YearData {
  return AGE_GROUPS.map(([mn, mx], i) => ({
    label: AGE_LABELS[i],
    ageMin: mn,
    pop: Array.from({ length: Math.min(mx, 99) - mn + 1 }, (_, k) => agePop[mn + k] ?? 0)
          .reduce((s, v) => s + v, 0),
  }));
}

function projectYear(current: AgePop, year: number): AgePop {
  const offset = year - 2030;
  const nxt: AgePop = {};
  for (let age = 1; age < 99; age++) {
    nxt[age] = Math.max(0, Math.round((current[age - 1] ?? 0) * (1 - qx(age - 1, offset))));
  }
  nxt[99] = Math.max(0, Math.round(
    (current[98] ?? 0) * (1 - qx(98, offset)) +
    (current[99] ?? 0) * (1 - qx(99, offset))
  ));
  const fertile = Array.from({ length: 20 }, (_, k) => current[20 + k] ?? 0)
    .reduce((s, v) => s + v, 0) * 0.49;
  nxt[0] = Math.max(0, Math.round(fertile * (1.75 / 20)));
  const mig = Math.round(70_000 / 21);
  for (let a = 20; a <= 40; a++) nxt[a] = (nxt[a] ?? 0) + mig;
  const total = Object.values(nxt).reduce((s, v) => s + v, 0);
  const target = (TARGETS[year] ?? 73.5) * 1e6;
  const scale = total > 0 ? target / total : 1;
  for (const a in nxt) nxt[+a] = Math.round(nxt[+a] * scale);
  return nxt;
}

function formatPop(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
  return String(n);
}

function computeStats(data: YearData) {
  const total = data.reduce((s, d) => s + d.pop, 0);
  const young  = data.filter(d => d.ageMin < 15).reduce((s, d) => s + d.pop, 0);
  const active = data.filter(d => d.ageMin >= 15 && d.ageMin < 60).reduce((s, d) => s + d.pop, 0);
  const senior = data.filter(d => d.ageMin >= 60).reduce((s, d) => s + d.pop, 0);
  let cumul = 0, medianGroup = 0;
  for (const d of data) {
    cumul += d.pop;
    if (cumul >= total / 2) { medianGroup = d.ageMin + 2; break; }
  }
  return { total, young, active, senior, medianGroup };
}

function barColor(ageMin: number) {
  if (ageMin < 15) return "#3B82F6";
  if (ageMin < 30) return "#2563EB";
  if (ageMin < 45) return "#1D4ED8";
  if (ageMin < 60) return "#4F46E5";
  if (ageMin < 75) return "#7C3AED";
  if (ageMin < 85) return "#9D174D";
  return "#991B1B";
}

export default function InteractivePyramid() {
  const [allData, setAllData] = useState<AllData>({});
  const [year, setYear] = useState(2022);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/projections")
      .then((r) => r.json())
      .then((rows: { ANNEE: number; AGE: number; POP: number }[]) => {
        if (!Array.isArray(rows) || rows.length === 0) throw new Error("Aucune donnée");

        // Group by year → AgePop
        const raw: Record<number, AgePop> = {};
        for (const r of rows) {
          if (!raw[r.ANNEE]) raw[r.ANNEE] = {};
          raw[r.ANNEE][r.AGE] = (raw[r.ANNEE][r.AGE] ?? 0) + r.POP;
        }

        const byYear: AllData = {};
        const dbYears = Object.keys(raw).map(Number).sort((a, b) => a - b);
        for (const y of dbYears) byYear[y] = toYearData(raw[y]);

        // Project from last available year to 2070
        const lastYear = dbYears[dbYears.length - 1];
        let current: AgePop = { ...raw[lastYear] };
        for (let y = lastYear + 1; y <= 2070; y++) {
          current = projectYear(current, y);
          byYear[y] = toYearData(current);
        }

        setAllData(byYear);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setYear(y => { if (y >= 2070) { setPlaying(false); return 2070; } return y + 1; });
      }, 120);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing]);

  const data = allData[year] ?? [];
  const maxPop = Math.max(...Object.values(allData).flatMap(d => d.map(r => r.pop)), 1);
  const stats = data.length ? computeStats(data) : null;
  const isProjection = year > 2026;

  if (loading) return (
    <div className="flex items-center justify-center h-[500px] text-gray-400 text-sm gap-2">
      <span className="animate-spin text-lg">⟳</span> Chargement depuis Supabase…
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-[500px] text-red-400 text-sm">{error}</div>
  );

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 px-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-[#003189] tabular-nums leading-none">{year}</span>
            {isProjection ? (
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Projection
              </span>
            ) : (
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
              { label: "0–14 ans",    value: `${((stats.young  / stats.total) * 100).toFixed(1)} %`, color: "text-blue-700" },
              { label: "15–59 ans",   value: `${((stats.active / stats.total) * 100).toFixed(1)} %`, color: "text-indigo-700" },
              { label: "60 ans et +", value: `${((stats.senior / stats.total) * 100).toFixed(1)} %`, color: "text-purple-700" },
              { label: "Âge médian",  value: `≈ ${stats.medianGroup} ans`,                           color: "text-gray-700" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2">
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bars */}
      <div className="relative bg-white rounded-xl border border-gray-100 px-4 pt-3 pb-2">
        <div className="space-y-[3px]">
          {[...data].reverse().map((d) => {
            const pct = (d.pop / maxPop) * 100;
            return (
              <div key={d.ageMin} className="flex items-center gap-2 group">
                <span className="text-[10px] text-gray-400 w-10 text-right flex-shrink-0 font-mono">{d.label}</span>
                <div className="flex-1 relative h-5">
                  <div
                    className="h-full rounded-r-sm transition-all duration-200 ease-out"
                    style={{ width: `${pct}%`, background: barColor(d.ageMin), opacity: 0.85 }}
                  />
                  <span className="absolute left-2 top-0 h-full flex items-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPop(d.pop)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 font-mono">{formatPop(d.pop)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-300">← Population totale (hommes + femmes) →</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 px-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setPlaying(p => !p); if (year >= 2070) setYear(2021); }}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#003189] text-white flex items-center justify-center hover:bg-[#001F5E] transition-colors shadow-sm"
          >
            {playing ? "⏸" : "▶"}
          </button>
          <div className="flex-1">
            <input
              type="range" min={2021} max={2070} value={year}
              onChange={e => { setPlaying(false); setYear(+e.target.value); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${year <= 2026 ? "#16A34A" : "#7C3AED"} 0%, ${
                  year <= 2026 ? "#16A34A" : "#7C3AED"
                } ${((year - 2021) / 49) * 100}%, #E5E7EB ${((year - 2021) / 49) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-1 px-0.5">
              {[2021,2030,2040,2050,2060,2070].map(y => (
                <button key={y} onClick={() => { setPlaying(false); setYear(y); }}
                  className={`hover:text-gray-600 transition-colors ${year === y ? "font-bold text-[#003189]" : ""}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span>Données réelles (2021–2026)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Projection scénario central (2027–2070)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
