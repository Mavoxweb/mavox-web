import { NextResponse } from "next/server";
import { query, queryOne, run } from "@/lib/db";
import { normalizePhoneE164 } from "@/lib/lead-import";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = await queryOne(
    `SELECT c.*, 
      COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
     FROM clients c
     LEFT JOIN client_tags ct ON c.id = ct.client_id
     LEFT JOIN tags t ON ct.tag_id = t.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const quotes = await query(
    `SELECT id, code, status, total, created_at as "createdAt" FROM quotes WHERE lead_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  return NextResponse.json({ ...client, quotes });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, email, phone, company, source, intent, tagIds, notes } = body;

    await run(
      `UPDATE clients SET
         name = $1,
         email = $2,
         phone = $3,
         phone_e164 = COALESCE($4, phone_e164),
         company = $5,
         source = $6,
         intent = $7,
         notes = $8,
         updated_at = now()
       WHERE id = $9`,
      [
        name,
        email || null,
        phone || null,
        normalizePhoneE164(phone),
        company || null,
        source,
        intent,
        notes || null,
        id,
      ]
    );

    if (tagIds) {
      await run(`DELETE FROM client_tags WHERE client_id = $1`, [id]);
      for (const tagId of tagIds) {
        await run(
          `INSERT INTO client_tags (client_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, tagId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await run(`DELETE FROM clients WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}