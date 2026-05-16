import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });

  const sb = createClient(url, key);

  // Fetch all rows — 1000 rows (10 years × 100 ages)
  const { data, error } = await sb
    .from("projections_demographie")
    .select("ANNEE, AGE, POP")
    .order("ANNEE")
    .order("AGE");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
