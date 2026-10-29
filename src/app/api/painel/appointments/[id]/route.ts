import { NextResponse } from "next/server";
import { query, run, queryOne } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await queryOne(
      `SELECT a.*, c.name as "clientName", c.email as "clientEmail"
       FROM appointments a
       LEFT JOIN clients c ON a.client_id = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
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
    const { clientId, title, startsAt, endsAt, meetLink } = body;

    if (!title || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Título, início e fim são obrigatórios" }, { status: 400 });
    }

    await run(
      `UPDATE appointments
       SET client_id = $1, title = $2, starts_at = $3, ends_at = $4, meet_link = $5
       WHERE id = $6`,
      [clientId || null, title, startsAt, endsAt, meetLink || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await run(`DELETE FROM appointments WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return NextResponse.json({ error: "Erro ao excluir agendamento" }, { status: 500 });
  }
}

