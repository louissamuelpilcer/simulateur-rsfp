-- Migration 002 : table des projections démographiques nationales

CREATE TABLE IF NOT EXISTS projections_demographie (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  annee         INTEGER     NOT NULL,
  age_min       INTEGER     NOT NULL,
  age_max       INTEGER     NOT NULL,
  population    INTEGER     NOT NULL,
  scenario      TEXT        NOT NULL DEFAULT 'central',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (annee, age_min, scenario)
);

CREATE INDEX IF NOT EXISTS idx_proj_demo_annee   ON projections_demographie (annee);
CREATE INDEX IF NOT EXISTS idx_proj_demo_scenario ON projections_demographie (scenario);

-- RLS
ALTER TABLE projections_demographie ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proj_demo_select" ON projections_demographie
  FOR SELECT TO anon, authenticated USING (TRUE);

COMMENT ON TABLE projections_demographie IS
  'Pyramide des âges nationale 2021-2070 — données réelles INSEE + projections scénario central';
COMMENT ON COLUMN projections_demographie.age_min    IS 'Borne inférieure du groupe d''âge quinquennal';
COMMENT ON COLUMN projections_demographie.age_max    IS 'Borne supérieure (105 pour le groupe 100+)';
COMMENT ON COLUMN projections_demographie.population IS 'Effectif total (hommes + femmes)';
COMMENT ON COLUMN projections_demographie.scenario   IS 'central | haut | bas';
