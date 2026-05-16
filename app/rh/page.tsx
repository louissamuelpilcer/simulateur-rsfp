"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import RegionBarChart from "@/components/charts/RegionBarChart";
import FeminisationChart from "@/components/charts/FeminisationChart";
import AgentsEvolutionChart from "@/components/charts/AgentsEvolutionChart";
import { NATIONAL_TOTALS, DEPARTMENTS, CATEGORIES_FP } from "@/lib/mock-data";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

const fmtM = (v: number) => `${(v / 1_000_000).toFixed(2)} M`;
const totalAgents = NATIONAL_TOTALS.agents_etat + NATIONAL_TOTALS.agents_territoriale + NATIONAL_TOTALS.agents_hospitaliere;

const FP_PIE_DATA = [
  { name: "FP État", value: NATIONAL_TOTALS.agents_etat, color: "#003189" },
  { name: "FP Territoriale", value: NATIONAL_TOTALS.agents_territoriale, color: "#16A34A" },
  { name: "FP Hospitalière", value: NATIONAL_TOTALS.agents_hospitaliere, color: "#E1000F" },
];

const CATEGORY_COLORS = { A: "#003189", B: "#0EA5E9", C: "#6B7280" };

function CategoryPie({ title, data }: { title: string; data: { A: number; B: number; C: number } }) {
  const pieData = Object.entries(data).map(([cat, pct]) => ({
    name: `Cat. ${cat}`,
    value: pct,
  }));
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-700 mb-2">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
            {pieData.map((entry, idx) => (
              <Cell key={entry.name} fill={Object.values(CATEGORY_COLORS)[idx]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} %`]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-3 text-xs">
        {pieData.map((d, idx) => (
          <span key={d.name} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: Object.values(CATEGORY_COLORS)[idx] }} />
            {d.name} : {d.value} %
          </span>
        ))}
      </div>
    </div>
  );
}

type RegionMetric = "agents_pour_mille" | "taux_vieillissement" | "agents_total" | "population";

export default function RHPage() {
  const [regionMetric, setRegionMetric] = useState<RegionMetric>("agents_pour_mille");

  // Top 10 departments by encadrement primaire (worst = most students per teacher)
  const worst10Encadrement = [...DEPARTMENTS]
    .sort((a, b) => b.taux_encadrement_primaire - a.taux_encadrement_primaire)
    .slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Indicateurs RH de la fonction publique"
        description="Répartition des effectifs, féminisation, catégories hiérarchiques et encadrement scolaire"
        badge="DGAFP · 2022"
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard label="Total agents" value={fmtM(totalAgents)} sub="toutes FP confondues" icon={Users} color="blue" />
          <MetricCard
            label="Part FP État"
            value={`${((NATIONAL_TOTALS.agents_etat / totalAgents) * 100).toFixed(0)} %`}
            sub={fmtM(NATIONAL_TOTALS.agents_etat) + " agents"}
            color="blue"
          />
          <MetricCard
            label="Part FP Territoriale"
            value={`${((NATIONAL_TOTALS.agents_territoriale / totalAgents) * 100).toFixed(0)} %`}
            sub={fmtM(NATIONAL_TOTALS.agents_territoriale) + " agents"}
            color="green"
          />
          <MetricCard
            label="Part FP Hospitalière"
            value={`${((NATIONAL_TOTALS.agents_hospitaliere / totalAgents) * 100).toFixed(0)} %`}
            sub={fmtM(NATIONAL_TOTALS.agents_hospitaliere) + " agents"}
            color="red"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Répartition par versant</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={FP_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${((value / totalAgents) * 100).toFixed(0)} %`}
                  labelLine={false}
                >
                  {FP_PIE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v.toLocaleString("fr-FR") + " agents"]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Répartition catégorielle A/B/C</h2>
            <div className="grid grid-cols-3 gap-2">
              <CategoryPie title="FP État" data={CATEGORIES_FP.etat} />
              <CategoryPie title="FP Territoriale" data={CATEGORIES_FP.territoriale} />
              <CategoryPie title="FP Hospitalière" data={CATEGORIES_FP.hospitaliere} />
            </div>
          </div>
        </div>

        {/* Féminisation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Taux de féminisation (2010–2022)</h2>
          <p className="text-xs text-gray-400 mb-4">Part des femmes dans les effectifs, par versant</p>
          <FeminisationChart />
        </div>

        {/* Encadrement primaire */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">
            Taux d'encadrement primaire – Top 8 départements les plus chargés
          </h2>
          <p className="text-xs text-gray-400 mb-4">Nombre d'élèves par enseignant dans le 1er degré (plus le ratio est élevé, moins il y a d'enseignants par élève)</p>
          <div className="space-y-2">
            {worst10Encadrement.map((d) => (
              <div key={d.code} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-40 flex-shrink-0">{d.code} – {d.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${((d.taux_encadrement_primaire - 18) / (30 - 18)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-24 text-right">
                  {d.taux_encadrement_primaire.toFixed(1)} élèves/ens.
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Region comparison */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Comparaison régionale</h2>
            <div className="flex gap-2">
              {(
                [
                  ["agents_pour_mille", "Agents / 1 000 hab."],
                  ["taux_vieillissement", "Vieillissement"],
                  ["agents_total", "Total agents"],
                  ["population", "Population"],
                ] as [RegionMetric, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRegionMetric(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    regionMetric === key
                      ? "bg-[#003189] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <RegionBarChart metric={regionMetric} />
        </div>
      </div>
    </div>
  );
}
