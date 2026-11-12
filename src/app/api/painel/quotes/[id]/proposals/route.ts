import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const proposals = await query(
      `SELECT id, quote_id, version, public_token, content, sent_at, viewed_at, accepted_at
       FROM proposals
       WHERE quote_id = $1
       ORDER BY version DESC`,
      [id]
    );

    return NextResponse.json({ data: proposals });
  } catch (error) {
    console.error("Erro ao buscar propostas do orçamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}