"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { DEPARTMENTS } from "@/lib/mock-data";
import { INDICATORS, getIndicatorValue } from "@/lib/indicators";
import type { Department, IndicatorKey } from "@/types";

const FranceMap = dynamic(() => import("@/components/map/FranceMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Chargement de la carte…
    </div>
  ),
});

export default function CartePage() {
  const [selectedKey, setSelectedKey] = useState<IndicatorKey>("agents_pour_mille");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const indicator = INDICATORS.find((i) => i.key === selectedKey)!;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Carte des indicateurs par département"
        description="Sélectionnez un indicateur puis survolez ou cliquez sur un département"
        badge="101 départements"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar controls */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Indicateur affiché
            </label>
            <div className="space-y-1">
              {INDICATORS.map((ind) => (
                <button
                  key={ind.key}
                  onClick={() => setSelectedKey(ind.key as IndicatorKey)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedKey === ind.key
                      ? "bg-[#003189] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium">{ind.label}</p>
                  <p className={`text-xs mt-0.5 ${selectedKey === ind.key ? "text-blue-200" : "text-gray-400"}`}>
                    {ind.unit}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Selected department detail */}
          {selectedDept && (
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 space-y-3">
              <div>
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Département sélectionné</p>
                <h3 className="font-bold text-[#003189] mt-1">
                  {selectedDept.code} – {selectedDept.name}
                </h3>
                <p className="text-xs text-blue-600">{selectedDept.region}</p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Population", value: selectedDept.population.toLocaleString("fr-FR") + " hab." },
                  { label: "Densité", value: `${Math.round(selectedDept.population / selectedDept.superficie)} hab./km²` },
                  { label: "FP État", value: selectedDept.agents_etat.toLocaleString("fr-FR") + " agents" },
                  { label: "FP Territoriale", value: selectedDept.agents_territoriale.toLocaleString("fr-FR") + " agents" },
                  { label: "FP Hospitalière", value: selectedDept.agents_hospitaliere.toLocaleString("fr-FR") + " agents" },
                  { label: "Encadrement 1er degré", value: `${selectedDept.taux_encadrement_primaire.toFixed(1)} élèves/enseignant` },
                  { label: "Population 60+", value: `${(selectedDept.indice_vieillissement * 100).toFixed(1)} %` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-blue-100">
                <p className="text-xs text-blue-500">{indicator.label}</p>
                <p className="text-lg font-bold text-[#003189]">
                  {indicator.format(getIndicatorValue(selectedDept, selectedKey))} {indicator.unit}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-gray-50">
          <FranceMap
            departments={DEPARTMENTS}
            selectedIndicator={indicator}
            onDepartmentClick={setSelectedDept}
          />
        </div>
      </div>
    </div>
  );
}
