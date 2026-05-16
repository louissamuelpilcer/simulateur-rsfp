import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEPARTMENTS } from "@/lib/mock-data";

// Normalize apostrophes and whitespace for fuzzy name matching
function norm(s: string) {
  return s.toLowerCase().replace(/[''`]/g, "'").trim();
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json(DEPARTMENTS);

  const sb = createClient(url, key);

  const [fpe, fph, tauxFpe, tauxFph] = await Promise.all([
    sb.from("Effectifs_FPE_par_departement").select("Département, 2023"),
    sb.from("Effectifs_FPH_par_departement").select("_1, 2023"),
    sb.from("Taux_administration_FPE_par_departement").select("Département, 2023"),
    sb.from("Taux_administration_FPH_par_departement").select("Département, 2023"),
  ]);

  // Build lookup maps (normalized name → value)
  const fpeMap  = new Map<string, number>(
    (fpe.data  ?? []).map((r: any) => [norm(r["Département"]),       Number(r["2023"])])
  );
  const fphMap  = new Map<string, number>(
    (fph.data  ?? []).map((r: any) => [norm(r["_1"]),               Number(r["2023"])])
  );
  const tauxFpeMap = new Map<string, number>(
    (tauxFpe.data ?? []).map((r: any) => [norm(r["Département"]),   Number(r["2023"])])
  );
  const tauxFphMap = new Map<string, number>(
    (tauxFph.data ?? []).map((r: any) => [norm(r["Département"]),   Number(r["2023"])])
  );

  const departments = DEPARTMENTS.map((dept) => {
    const key = norm(dept.name);

    const agentsEtat = fpeMap.has(key)
      ? Math.round(fpeMap.get(key)! * 1000)
      : dept.agents_etat;

    const agentsHosp = fphMap.has(key)
      ? Math.round(fphMap.get(key)! * 1000)
      : dept.agents_hospitaliere;

    // Derive population from FPE taux if available (effectifs/taux*1000)
    const tFpe = tauxFpeMap.get(key);
    const population = tFpe && fpeMap.has(key)
      ? Math.round((fpeMap.get(key)! * 1000) / tFpe * 1000)
      : dept.population;

    // FPT: no Supabase table — keep mock value scaled to derived population
    const agentsTerr = Math.round(dept.agents_territoriale * (population / dept.population));

    const tauxEtat = tauxFpeMap.get(key) ?? (agentsEtat / population) * 1000;
    const tauxHosp = tauxFphMap.get(key) ?? (agentsHosp / population) * 1000;

    return {
      ...dept,
      population,
      agents_etat: agentsEtat,
      agents_hospitaliere: agentsHosp,
      agents_territoriale: agentsTerr,
      // Pass taux through as extra fields used by indicators
      _taux_etat: tauxEtat,
      _taux_hosp: tauxHosp,
    };
  });

  return NextResponse.json(departments);
}
