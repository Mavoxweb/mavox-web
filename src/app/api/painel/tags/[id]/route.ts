import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, color } = body;

    await run(`UPDATE tags SET name = $1, color = $2 WHERE id = $3`, [name, color || "#3b82f6", id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json({ error: "Erro ao atualizar tag" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await run(`DELETE FROM tags WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Erro ao excluir tag" }, { status: 500 });
  }
}