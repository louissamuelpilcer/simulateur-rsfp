"use client";

import dynamic from "next/dynamic";
import PageHeader from "@/components/ui/PageHeader";
import AgentsEvolutionChart from "@/components/charts/AgentsEvolutionChart";

const InteractivePyramid = dynamic(() => import("@/components/charts/InteractivePyramid"), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center text-gray-400 text-sm">Chargement…</div>,
});

export default function ProjectionsPage() {
  return (
    <div>
      <PageHeader
        title="Projections démographiques"
        description="Pyramide des âges de la France 2021–2070 — données réelles et scénario central INSEE"
        badge="Sources : INSEE · DGAFP"
      />

      <div className="p-6 space-y-6">
        {/* Interactive pyramid */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <InteractivePyramid />
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
