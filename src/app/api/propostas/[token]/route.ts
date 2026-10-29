import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Buscar proposta pelo public_token
    const proposal = await queryOne<{
      id: string;
      quote_id: string;
      version: number;
      content: any;
      created_at: string;
    }>(
      `SELECT id, quote_id, version, content, created_at
       FROM proposals
       WHERE public_token = $1`,
      [token]
    );

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    // Buscar o orçamento vinculado
    const quote = await queryOne<{
      id: string;
      code: string;
      lead_id: string;
      total: number | null;
      valid_until: string | null;
      created_at: string;
    }>(
      `SELECT id, code, lead_id, total, valid_until, created_at
       FROM quotes
       WHERE id = $1`,
      [proposal.quote_id]
    );

    if (!quote) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }

    // Buscar o lead (cliente)
    const client = await queryOne<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      company: string | null;
    }>(
      `SELECT id, name, email, phone, company
       FROM leads
       WHERE id = $1`,
      [quote.lead_id]
    );

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Buscar itens do orçamento
    const items = await query<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number | null;
      position: number;
    }>(
      `SELECT description, quantity, unit_price, position
       FROM quote_items
       WHERE quote_id = $1
       ORDER BY position ASC`,
      [quote.id]
    );

    return NextResponse.json({
      id: proposal.id,
      code: quote.code,
      quote_id: quote.id,
      version: proposal.version,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
      },
      total: quote.total,
      valid_until: quote.valid_until,
      created_at: proposal.created_at,
      items: items || [],
    });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
