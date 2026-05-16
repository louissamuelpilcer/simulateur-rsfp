import type { Department, Indicator, IndicatorKey } from "@/types";

export const INDICATORS: Indicator[] = [
  {
    key: "population",
    label: "Population totale",
    unit: "hab.",
    description: "Population municipale au recensement 2022",
    format: (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)} M` : v >= 1000 ? `${Math.round(v / 1000)} k` : String(v),
    colorScheme: "blues",
  },
  {
    key: "densite",
    label: "Densité de population",
    unit: "hab./km²",
    description: "Nombre d'habitants par kilomètre carré",
    format: (v) => `${Math.round(v)}`,
    colorScheme: "purples",
  },
  {
    key: "agents_total",
    label: "Agents FP (total)",
    unit: "agents",
    description: "Total des agents des trois fonctions publiques",
    format: (v) => `${Math.round(v / 1000)} k`,
    colorScheme: "blues",
  },
  {
    key: "agents_pour_mille",
    label: "Agents FP / 1 000 hab.",
    unit: "‰",
    description: "Nombre total d'agents pour 1 000 habitants",
    format: (v) => `${v.toFixed(1)}`,
    colorScheme: "greens",
  },
  {
    key: "agents_etat_pour_mille",
    label: "FP État / 1 000 hab.",
    unit: "‰",
    description: "Agents de la fonction publique d'État pour 1 000 habitants",
    format: (v) => `${v.toFixed(1)}`,
    colorScheme: "blues",
  },
  {
    key: "agents_territoriale_pour_mille",
    label: "FP Territoriale / 1 000 hab.",
    unit: "‰",
    description: "Agents de la fonction publique territoriale pour 1 000 habitants",
    format: (v) => `${v.toFixed(1)}`,
    colorScheme: "greens",
  },
  {
    key: "agents_hospitaliere_pour_mille",
    label: "FP Hospitalière / 1 000 hab.",
    unit: "‰",
    description: "Agents de la fonction publique hospitalière pour 1 000 habitants",
    format: (v) => `${v.toFixed(1)}`,
    colorScheme: "reds",
  },
  {
    key: "taux_encadrement_primaire",
    label: "Taux d'encadrement primaire",
    unit: "élèves/enseignant",
    description: "Nombre moyen d'élèves par enseignant dans le premier degré",
    format: (v) => `${v.toFixed(1)}`,
    colorScheme: "oranges",
  },
  {
    key: "indice_vieillissement",
    label: "Indice de vieillissement",
    unit: "% de 60+",
    description: "Part de la population âgée de 60 ans ou plus",
    format: (v) => `${(v * 100).toFixed(1)} %`,
    colorScheme: "purples",
  },
];

export function getIndicatorValue(dept: Department, key: IndicatorKey): number {
  switch (key) {
    case "population": return dept.population;
    case "densite": return dept.population / dept.superficie;
    case "agents_total": return dept.agents_etat + dept.agents_territoriale + dept.agents_hospitaliere;
    case "agents_pour_mille": return ((dept.agents_etat + dept.agents_territoriale + dept.agents_hospitaliere) / dept.population) * 1000;
    case "agents_etat_pour_mille": return (dept.agents_etat / dept.population) * 1000;
    case "agents_territoriale_pour_mille": return (dept.agents_territoriale / dept.population) * 1000;
    case "agents_hospitaliere_pour_mille": return (dept.agents_hospitaliere / dept.population) * 1000;
    case "taux_encadrement_primaire": return dept.taux_encadrement_primaire;
    case "indice_vieillissement": return dept.indice_vieillissement;
    default: return 0;
  }
}
