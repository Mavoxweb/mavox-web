import { NextResponse } from "next/server";
import { run } from "@/lib/db";

const ALLOWED = new Set(["aberta", "concluida", "descartada"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body.status;

    if (!ALLOWED.has(status)) {
      return NextResponse.json(
        { error: "Status inválido. Use aberta, concluida ou descartada." },
        { status: 400 }
      );
    }

    await run(`UPDATE ai_opportunities SET status = $1 WHERE id = $2`, [status, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar oportunidade" },
      { status: 500 }
    );
  }
}
