import { NextResponse } from "next/server";
import { query, queryOne, run } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await queryOne(`SELECT * FROM posts WHERE id = $1`, [id]);

  if (!post) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { title, slug, content, excerpt, status, published_at, ai_generated } = body;

    await run(
      `UPDATE posts SET title = $1, slug = $2, content = $3, excerpt = $4, status = $5, published_at = $6, ai_generated = $7 WHERE id = $8`,
      [title, slug, content || null, excerpt || null, status, published_at || null, ai_generated || false, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Erro ao atualizar artigo" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await run(`DELETE FROM posts WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Erro ao excluir artigo" }, { status: 500 });
  }
}