"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { DEPARTMENTS, NATIONAL_TOTALS } from "@/lib/mock-data";
import type { ScenarioParams, ScenarioImpact } from "@/types";

const COUT_AGENT_MOYEN = 42000; // € / an

const DEFAULT_PARAMS: ScenarioParams = {
  reequilibrage_territorial: 0,
  taux_encadrement_primaire: 24.0,
  taux_encadrement_secondaire: 27.0,
  taux_retraite_annuel: 3.5,
  taux_teletravail: 20,
};

// National baseline: ~420,000 enseignants 1er degré
const BASE_ENSEIGNANTS_PRIMAIRE = 420000;
const BASE_ENCADREMENT_PRIMAIRE = 24.0;
// ~530,000 enseignants 2nd degré
const BASE_ENSEIGNANTS_SECONDAIRE = 530000;
const BASE_ENCADREMENT_SECONDAIRE = 27.0;

function computeImpact(params: ScenarioParams): ScenarioImpact {
  // 1. Rééquilibrage territorial : déplace des agents État de l'IDF vers le reste
  const idfDepts = ["75", "77", "78", "91", "92", "93", "94", "95"];
  const idfAgentsEtat = DEPARTMENTS.filter((d) => idfDepts.includes(d.code)).reduce(
    (s, d) => s + d.agents_etat,
    0
  );
  const idfPop = DEPARTMENTS.filter((d) => idfDepts.includes(d.code)).reduce(
    (s, d) => s + d.population,
    0
  );
  const idfRatioCurrent = (idfAgentsEtat / idfPop) * 1000;
  // 60‰ IDF vs ~37‰ national → redistribute (idfRatio - national) * reequil%
  const excessRatio = idfRatioCurrent - 37;
  const agentsToRedistribute = Math.round((idfPop * excessRatio) / 1000 * (params.reequilibrage_territorial / 100));

  // 2. Encadrement primaire : si on baisse le ratio (plus d'enseignants par élève)
  // Enseignants nécessaires = Enseignants_base * (BASE_ENCADREMENT / nouveau_taux)
  const newEnseignantsPrimaire = Math.round(
    BASE_ENSEIGNANTS_PRIMAIRE * (BASE_ENCADREMENT_PRIMAIRE / params.taux_encadrement_primaire)
  );
  const deltaEnseignantsPrimaire = newEnseignantsPrimaire - BASE_ENSEIGNANTS_PRIMAIRE;

  // 3. Encadrement secondaire
  const newEnseignantsSecondaire = Math.round(
    BASE_ENSEIGNANTS_SECONDAIRE * (BASE_ENCADREMENT_SECONDAIRE / params.taux_encadrement_secondaire)
  );
  const deltaEnseignantsSecondaire = newEnseignantsSecondaire - BASE_ENSEIGNANTS_SECONDAIRE;

  // 4. Départs en retraite non remplacés (au-delà du taux de base 3.5%)
  const deltaRetraite = Math.round(
    NATIONAL_TOTALS.agents_etat * ((params.taux_retraite_annuel - 3.5) / 100)
  );

  const delta_agents_etat =
    -agentsToRedistribute + deltaEnseignantsPrimaire + deltaEnseignantsSecondaire - deltaRetraite;

  // 5. Télétravail : impact indirect sur territoriale (besoin moins de postes de travail → légère réduction)
  const delta_agents_territoriale = Math.round(
    NATIONAL_TOTALS.agents_territoriale * (params.taux_teletravail - 20) * -0.001
  );

  // Hospitalière non affectée ici
  const delta_agents_hospitaliere = 0;

  const total_delta = delta_agents_etat + delta_agents_territoriale + delta_agents_hospitaliere;
  const delta_budget_m_eur = Math.round((total_delta * COUT_AGENT_MOYEN) / 1_000_000);

  return {
    delta_agents_etat,
    delta_agents_territoriale,
    delta_agents_hospitaliere,
    delta_budget_m_eur,
    departements_gagnants: agentsToRedistribute > 0 ? 87 : 0,
    departements_perdants: agentsToRedistribute > 0 ? 8 : 0,
  };
}

interface SliderRowProps {
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  color?: string;
}

function SliderRow({ label, description, min, max, step, value, unit, onChange, formatValue, color = "#003189" }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-sm font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#003189] min-w-[70px] text-center">
          {formatValue ? formatValue(value) : `${value}`} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

function DeltaBadge({ value, unit = "" }: { value: number; unit?: string }) {
  const pos = value >= 0;
  return (
    <span className={`text-sm font-bold ${pos ? "text-green-600" : "text-red-600"}`}>
      {pos ? "+" : ""}{value.toLocaleString("fr-FR")} {unit}
    </span>
  );
}

export default function ScenarioPanel() {
  const [params, setParams] = useState<ScenarioParams>(DEFAULT_PARAMS);

  const set = (key: keyof ScenarioParams) => (v: number) =>
    setParams((p) => ({ ...p, [key]: v }));

  const impact = useMemo(() => computeImpact(params), [params]);

  const deltaData = [
    { name: "FP État", value: impact.delta_agents_etat, fill: "#003189" },
    { name: "FP Territoriale", value: impact.delta_agents_territoriale, fill: "#16A34A" },
    { name: "FP Hospitalière", value: impact.delta_agents_hospitaliere, fill: "#E1000F" },
  ];

  const radarData = [
    { subject: "Répart. territoriale", value: params.reequilibrage_territorial, max: 100 },
    { subject: "Encadrement primaire", value: Math.round(((BASE_ENCADREMENT_PRIMAIRE - params.taux_encadrement_primaire) / (BASE_ENCADREMENT_PRIMAIRE - 18)) * 100), max: 100 },
    { subject: "Encadrement secondaire", value: Math.round(((BASE_ENCADREMENT_SECONDAIRE - params.taux_encadrement_secondaire) / (BASE_ENCADREMENT_SECONDAIRE - 22)) * 100), max: 100 },
    { subject: "Réduction retraites", value: params.taux_retraite_annuel > 3.5 ? Math.round(((params.taux_retraite_annuel - 3.5) / 2.5) * 100) : 0, max: 100 },
    { subject: "Télétravail", value: Math.round((params.taux_teletravail / 50) * 100), max: 100 },
  ];

  return (
    <div className="flex gap-6 h-full">
      {/* Sliders panel */}
      <div className="w-80 flex-shrink-0 space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Paramètres du scénario</h2>

          <SliderRow
            label="Rééquilibrage territorial"
            description="Part du sureffectif IDF redistribuée vers les autres territoires"
            min={0} max={100} step={5}
            value={params.reequilibrage_territorial}
            unit="%"
            onChange={set("reequilibrage_territorial")}
            color="#003189"
          />

          <SliderRow
            label="Taux d'encadrement primaire"
            description="Nombre d'élèves par enseignant dans le 1er degré"
            min={18} max={30} step={0.5}
            value={params.taux_encadrement_primaire}
            unit="élèves/enseignant"
            onChange={set("taux_encadrement_primaire")}
            formatValue={(v) => v.toFixed(1)}
            color="#EA580C"
          />

          <SliderRow
            label="Taux d'encadrement secondaire"
            description="Nombre d'élèves par enseignant dans le 2nd degré"
            min={22} max={35} step={0.5}
            value={params.taux_encadrement_secondaire}
            unit="élèves/enseignant"
            onChange={set("taux_encadrement_secondaire")}
            formatValue={(v) => v.toFixed(1)}
            color="#D97706"
          />

          <SliderRow
            label="Taux de retraite annuel"
            description="Taux de départ en retraite (référence nationale : 3,5 %)"
            min={1} max={6} step={0.1}
            value={params.taux_retraite_annuel}
            unit="%"
            onChange={set("taux_retraite_annuel")}
            formatValue={(v) => v.toFixed(1)}
            color="#7C3AED"
          />

          <SliderRow
            label="Part du télétravail"
            description="Proportion d'agents en situation de télétravail régulier"
            min={0} max={50} step={5}
            value={params.taux_teletravail}
            unit="%"
            onChange={set("taux_teletravail")}
            color="#0891B2"
          />

          <button
            onClick={() => setParams(DEFAULT_PARAMS)}
            className="w-full text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Réinitialiser les paramètres
          </button>
        </div>
      </div>

      {/* Impact visualizations */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* KPI summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Delta FP État", value: <DeltaBadge value={impact.delta_agents_etat} unit="agents" />, bg: "bg-blue-50 border-blue-100" },
            { label: "Delta FP Territoriale", value: <DeltaBadge value={impact.delta_agents_territoriale} unit="agents" />, bg: "bg-green-50 border-green-100" },
            { label: "Impact budgétaire", value: <DeltaBadge value={impact.delta_budget_m_eur} unit="M€" />, bg: "bg-orange-50 border-orange-100" },
            { label: "Dép. bénéficiaires", value: <span className="text-sm font-bold text-gray-800">{impact.departements_gagnants}</span>, bg: "bg-purple-50 border-purple-100" },
          ].map(({ label, value, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              {value}
            </div>
          ))}
        </div>

        {/* Delta by FP category */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">Impact sur les effectifs par versant</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deltaData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString("fr-FR")} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString("fr-FR") + " agents", "Variation"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {deltaData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.value >= 0 ? entry.fill : "#EF4444"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Intensité du scénario par levier (0–100)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar name="Scénario" dataKey="value" stroke="#003189" fill="#003189" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget detail */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Détail de l'impact budgétaire</h3>
          <p className="text-gray-500 text-xs mb-3">
            Coût moyen retenu : {COUT_AGENT_MOYEN.toLocaleString("fr-FR")} €/agent/an (toutes charges comprises)
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-2">Versant</th>
                <th className="text-right text-gray-500 font-medium pb-2">Effectif actuel</th>
                <th className="text-right text-gray-500 font-medium pb-2">Variation</th>
                <th className="text-right text-gray-500 font-medium pb-2">Impact (M€/an)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: "FP État", current: NATIONAL_TOTALS.agents_etat, delta: impact.delta_agents_etat },
                { name: "FP Territoriale", current: NATIONAL_TOTALS.agents_territoriale, delta: impact.delta_agents_territoriale },
                { name: "FP Hospitalière", current: NATIONAL_TOTALS.agents_hospitaliere, delta: impact.delta_agents_hospitaliere },
              ].map((row) => (
                <tr key={row.name} className="py-1">
                  <td className="py-2 text-gray-700">{row.name}</td>
                  <td className="py-2 text-right text-gray-600">{row.current.toLocaleString("fr-FR")}</td>
                  <td className={`py-2 text-right font-semibold ${row.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {row.delta >= 0 ? "+" : ""}{row.delta.toLocaleString("fr-FR")}
                  </td>
                  <td className={`py-2 text-right font-semibold ${row.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {row.delta >= 0 ? "+" : ""}{Math.round((row.delta * COUT_AGENT_MOYEN) / 1_000_000).toLocaleString("fr-FR")} M€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
