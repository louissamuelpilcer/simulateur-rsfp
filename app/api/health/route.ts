import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { status: "error", message: "Variables Supabase manquantes" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("departments")
      .select("count", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      supabase_url: url.replace(/^(https:\/\/[^.]+).*/, "$1…"),
      departments_table: "accessible",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
