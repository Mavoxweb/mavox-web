import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const rows = await query(
      `SELECT id, event_name, pixel_type, pixel_id, event_data, event_id, status, error_message, created_at
       FROM pixel_event_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Error fetching pixel logs:", error);
    return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_name,
      pixel_type,
      pixel_id,
      event_data,
      event_id,
    } = body;

    if (!event_name || !pixel_type) {
      return NextResponse.json({ error: "event_name e pixel_type são obrigatórios" }, { status: 400 });
    }

    // Hash do IP para privacidade (LGPD)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const crypto = await import("crypto");
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const userAgent = request.headers.get("user-agent") || "";

    await run(
      `INSERT INTO pixel_event_logs
         (event_name, pixel_type, pixel_id, event_data, event_id, user_agent, ip_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent')`,
      [event_name, pixel_type, pixel_id || null, JSON.stringify(event_data || {}), event_id || null, userAgent, ipHash]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging pixel event:", error);
    return NextResponse.json({ error: "Erro ao registrar evento" }, { status: 500 });
  }
}