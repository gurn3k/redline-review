import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Daily ping from Vercel Cron (see vercel.json) so the free-tier Supabase
 * project never goes 7 days without a request and gets paused.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations;
 * anything else is turned away so the route can't be used to hammer the DB.
 * The queries run as anon, so RLS returns no rows — the requests reaching the
 * database are all that matter. Supabase says "a few user requests to the
 * database each day" is typically enough, and Hobby crons only fire daily,
 * so each ping makes several reads.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  for (const table of ["documents", "red_lines", "documents", "red_lines"]) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
