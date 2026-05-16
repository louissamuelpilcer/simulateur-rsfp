"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/ui/PageHeader";
import AgentsEvolutionChart from "@/components/charts/AgentsEvolutionChart";

const PopulationPyramidChart = dynamic(() => import("@/components/charts/PopulationPyramidChart"), {
  ssr: false,
  loading: () => <div className="h-72 flex items-center justify-center text-gray-400 text-sm">Chargement…</div>,
});

const PopulationTrendChart = dynamic(() => import("@/components/charts/PopulationTrendChart"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Chargement…</div>,
});

const AVAILABLE_YEARS = [1991, 2000, 2010, 2015, 2020, 2022, 2024, 2026];

export default function ProjectionsPage() {
  const [year, setYear] = useState(2022);
  const [compareYear, setCompareYear] = useState<number | undefined>(undefined);

  return (
    <div>
      <PageHeader
        title="Projections démographiques"
        description="Évolution de la pyramide des âges et des effectifs de la fonction publique (1991–2040)"
        badge="Sources : INSEE · DGAFP"
      />

      <div className="p-6 space-y-6">
        {/* Population trend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Évolution de la population par tranche d'âge</h2>
          <p className="text-xs text-gray-400 mb-4">
            Données réelles 1991–2022, projections INSEE 2023–2026
          </p>
          <PopulationTrendChart />
        </div>

        {/* Pyramid */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Pyramide des âges</h2>
              <p className="text-xs text-gray-400 mt-0.5">Données INSEE par sexe et tranche d'âge quinquennale</p>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Année principale</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Comparer avec</label>
                <select
                  value={compareYear ?? ""}
                  onChange={(e) => setCompareYear(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Aucune</option>
                  {AVAILABLE_YEARS.filter((y) => y !== year).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <PopulationPyramidChart year={year} compareYear={compareYear} />
        </div>

        {/* Agents evolution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Évolution et projection des effectifs FP</h2>
          <p className="text-xs text-gray-400 mb-4">
            Historique 2010–2022 · Projections tendancielles 2023–2040
            (base : taux de retraite constant, pas de réforme majeure)
          </p>
          <AgentsEvolutionChart />
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>Note de lecture :</strong> Le vieillissement de la population entraîne mécaniquement
            une hausse des effectifs de la FP Hospitalière (+18 % d'ici 2040) pour répondre à l'augmentation
            des besoins de soins. La FP d'État suit une légère baisse tendancielle liée aux départs en retraite
            non intégralement remplacés.
          </div>
        </div>

        {/* Key insights */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Part des 60+ en 2040",
              value: "33 %",
              desc: "Contre 26 % en 2022. Le vieillissement accélère la demande de soins et services de proximité.",
              color: "text-purple-700",
              bg: "bg-purple-50 border-purple-100",
            },
            {
              title: "Pic de départs en retraite",
              value: "2028–2035",
              desc: "La génération du baby-boom quitte la FP. Enjeu majeur de renouvellement des compétences.",
              color: "text-orange-700",
              bg: "bg-orange-50 border-orange-100",
            },
            {
              title: "Ratio actifs / seniors 2040",
              value: "2,1",
              desc: "En 2022 : 2,6. La diminution du ratio actifs/inactifs complexifie le financement de la FP hospitalière.",
              color: "text-red-700",
              bg: "bg-red-50 border-red-100",
            },
          ].map(({ title, value, desc, color, bg }) => (
            <div key={title} className={`border rounded-xl p-4 ${bg}`}>
              <p className="text-xs text-gray-500 font-medium">{title}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
