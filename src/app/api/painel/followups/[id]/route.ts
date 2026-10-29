import { NextResponse } from "next/server";
import { query, run, queryOne } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const followup = await queryOne(
      `SELECT f.*, q.code as "quoteCode", l.name as "clientName", l.phone as "clientPhone"
       FROM followups f
       LEFT JOIN quotes q ON f.quote_id = q.id
       LEFT JOIN leads l ON q.lead_id = l.id
       WHERE f.id = $1`,
      [id]
    );

    if (!followup) {
      return NextResponse.json({ error: "Follow-up não encontrado" }, { status: 404 });
    }

    return NextResponse.json(followup);
  } catch (error) {
    console.error("Erro ao buscar follow-up:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quote_id, stage, message, channel = "whatsapp" } = body;

    let resolvedQuoteId = quote_id?.trim();
    if (resolvedQuoteId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedQuoteId);
      if (!isUuid) {
        const found = await queryOne<{ id: string }>(
          `SELECT id FROM quotes WHERE code ILIKE $1 LIMIT 1`,
          [resolvedQuoteId]
        );
        if (found) {
          resolvedQuoteId = found.id;
        }
      }
    }

    await run(
      `UPDATE followups
       SET quote_id = COALESCE($1, quote_id),
           stage = COALESCE($2, stage),
           message = COALESCE($3, message),
           channel = COALESCE($4, channel)
       WHERE id = $5`,
      [resolvedQuoteId || null, stage, message, channel, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar follow-up:", error);
    return NextResponse.json({ error: "Erro ao atualizar follow-up" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await run(`DELETE FROM followups WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir follow-up:", error);
    return NextResponse.json({ error: "Erro ao excluir follow-up" }, { status: 500 });
  }
}

