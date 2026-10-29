import { NextResponse } from "next/server";
import { queryOne, run } from "@/lib/db";
import { parsePostInput } from "@/lib/blog-post-input";

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
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM posts WHERE id = $1`,
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = await parsePostInput(body, id);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error, field: parsed.field },
        { status: 400 }
      );
    }

    const v = parsed.values;
    await run(
      `UPDATE posts SET
         title = $1, slug = $2, content = $3, excerpt = $4, status = $5,
         published_at = $6, ai_generated = $7, cover_image = $8,
         seo_title = $9, meta_description = $10, agent = $11,
         cta_enabled = $12, scheduled_timezone = $13, updated_at = NOW()
       WHERE id = $14`,
      [
        v.title,
        v.slug,
        v.content,
        v.excerpt,
        v.status,
        v.published_at,
        v.ai_generated,
        v.cover_image,
        v.seo_title,
        v.meta_description,
        v.agent,
        v.cta_enabled,
        v.scheduled_timezone,
        id,
      ]
    );

    return NextResponse.json({ success: true, id, slug: v.slug });
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
