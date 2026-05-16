export interface Department {
  code: string;
  name: string;
  region: string;
  population: number;
  superficie: number;
  chef_lieu: string;
  agents_etat: number;
  agents_territoriale: number;
  agents_hospitaliere: number;
  taux_encadrement_primaire: number;
  indice_vieillissement: number;
}

export interface DepartmentGeoProperties {
  code: string;
  nom: string;
}

export type IndicatorKey =
  | "population"
  | "densite"
  | "agents_total"
  | "agents_pour_mille"
  | "agents_etat_pour_mille"
  | "agents_territoriale_pour_mille"
  | "agents_hospitaliere_pour_mille"
  | "taux_encadrement_primaire"
  | "indice_vieillissement";

export interface Indicator {
  key: IndicatorKey;
  label: string;
  unit: string;
  description: string;
  format: (v: number) => string;
  colorScheme: "blues" | "greens" | "oranges" | "purples" | "reds";
}

export interface PopulationRow {
  year: number;
  sex: "M" | "F";
  age: number;
  pop: number;
}

export interface AggregatedYear {
  year: number;
  total: number;
  active: number;
  young: number;
  senior: number;
  male: number;
  female: number;
}

export interface ScenarioParams {
  reequilibrage_territorial: number;
  taux_encadrement_primaire: number;
  taux_encadrement_secondaire: number;
  taux_retraite_annuel: number;
  taux_teletravail: number;
}

export interface ScenarioImpact {
  delta_agents_etat: number;
  delta_agents_territoriale: number;
  delta_agents_hospitaliere: number;
  delta_budget_m_eur: number;
  departements_gagnants: number;
  departements_perdants: number;
}

export interface RegionSummary {
  region: string;
  population: number;
  agents_total: number;
  agents_pour_mille: number;
  taux_vieillissement: number;
  nb_departments: number;
}
