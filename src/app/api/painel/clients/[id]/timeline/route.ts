import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await query(
    `SELECT id, lead_id, type, title, description, metadata, created_by, created_at FROM lead_timeline WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [id]
  );
  return NextResponse.json({ data: rows });
}
