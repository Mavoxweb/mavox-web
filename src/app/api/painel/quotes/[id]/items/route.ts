import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const items = await query(
    `SELECT qi.*, s.name as "serviceName" FROM quote_items qi LEFT JOIN services s ON qi.service_id = s.id WHERE qi.quote_id = $1 ORDER BY qi.position`,
    [id]
  );

  return NextResponse.json({ data: items });
}