-- Simulateur RSFP – Schéma Supabase
-- Exécuter dans l'ordre dans l'éditeur SQL de Supabase

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table : departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  population INTEGER NOT NULL,
  superficie INTEGER NOT NULL,
  chef_lieu TEXT,
  agents_etat INTEGER NOT NULL DEFAULT 0,
  agents_territoriale INTEGER NOT NULL DEFAULT 0,
  agents_hospitaliere INTEGER NOT NULL DEFAULT 0,
  taux_encadrement_primaire NUMERIC(5,2),
  indice_vieillissement NUMERIC(4,3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : population_data (pyramide des âges)
-- ============================================================
CREATE TABLE IF NOT EXISTS population_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annee INTEGER NOT NULL,
  sexe CHAR(1) NOT NULL CHECK (sexe IN ('M', 'F')),
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 99),
  pop INTEGER NOT NULL,
  UNIQUE (annee, sexe, age)
);

-- Index sur annee pour les requêtes par année
CREATE INDEX IF NOT EXISTS idx_population_annee ON population_data (annee);

-- ============================================================
-- Table : scenarios
-- ============================================================
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  params JSONB NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : projections_fp (projections effectifs FP)
-- ============================================================
CREATE TABLE IF NOT EXISTS projections_fp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annee INTEGER NOT NULL,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  agents_etat INTEGER,
  agents_territoriale INTEGER,
  agents_hospitaliere INTEGER,
  hypothese TEXT DEFAULT 'baseline',
  UNIQUE (annee, scenario_id, hypothese)
);

-- ============================================================
-- Row-Level Security (RLS)
-- ============================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE population_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projections_fp ENABLE ROW LEVEL SECURITY;

-- Lecture publique (anon)
CREATE POLICY "departments_select" ON departments FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "population_select" ON population_data FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "scenarios_select" ON scenarios FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "projections_select" ON projections_fp FOR SELECT TO anon, authenticated USING (TRUE);

-- Écriture uniquement pour les utilisateurs authentifiés
CREATE POLICY "scenarios_insert" ON scenarios FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "projections_insert" ON projections_fp FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ============================================================
-- Vue : department_indicators
-- ============================================================
CREATE OR REPLACE VIEW department_indicators AS
SELECT
  d.*,
  d.population::FLOAT / NULLIF(d.superficie, 0) AS densite,
  d.agents_etat + d.agents_territoriale + d.agents_hospitaliere AS agents_total,
  (d.agents_etat + d.agents_territoriale + d.agents_hospitaliere)::FLOAT / NULLIF(d.population, 0) * 1000 AS agents_pour_mille,
  d.agents_etat::FLOAT / NULLIF(d.population, 0) * 1000 AS agents_etat_pour_mille,
  d.agents_territoriale::FLOAT / NULLIF(d.population, 0) * 1000 AS agents_territoriale_pour_mille,
  d.agents_hospitaliere::FLOAT / NULLIF(d.population, 0) * 1000 AS agents_hospitaliere_pour_mille
FROM departments d;

-- ============================================================
-- Fonction : aggregate_population_by_year
-- Calcule les totaux par tranche d'âge pour une année donnée
-- ============================================================
CREATE OR REPLACE FUNCTION aggregate_population_by_year(p_annee INTEGER)
RETURNS TABLE (
  total BIGINT,
  young BIGINT,
  active BIGINT,
  senior BIGINT,
  male BIGINT,
  female BIGINT
) LANGUAGE SQL STABLE AS $$
  SELECT
    SUM(pop)                                              AS total,
    SUM(CASE WHEN age < 15 THEN pop ELSE 0 END)          AS young,
    SUM(CASE WHEN age >= 15 AND age < 60 THEN pop ELSE 0 END) AS active,
    SUM(CASE WHEN age >= 60 THEN pop ELSE 0 END)          AS senior,
    SUM(CASE WHEN sexe = 'M' THEN pop ELSE 0 END)        AS male,
    SUM(CASE WHEN sexe = 'F' THEN pop ELSE 0 END)        AS female
  FROM population_data
  WHERE annee = p_annee;
$$;

-- ============================================================
-- Commentaires
-- ============================================================
COMMENT ON TABLE departments IS 'Données RH et démographiques par département (source: DGAFP, INSEE 2022)';
COMMENT ON TABLE population_data IS 'Pyramide des âges nationale (source: INSEE, 1991-2026)';
COMMENT ON TABLE scenarios IS 'Scénarios de simulation RH sauvegardés par les utilisateurs';
COMMENT ON TABLE projections_fp IS 'Projections des effectifs FP par scénario et hypothèse';
