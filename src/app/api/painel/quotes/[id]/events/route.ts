import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const events = await query(
    `SELECT * FROM quote_events WHERE quote_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  return NextResponse.json({ data: events });
}