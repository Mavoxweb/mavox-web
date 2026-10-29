import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

interface ProposalViewResult {
  id: string;
  quote_id: string;
  viewed_at: string | null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Atualizar viewed_at na proposta se ainda não foi visualizada
    const proposal = await query<ProposalViewResult>(
      `UPDATE proposals
       SET viewed_at = CASE WHEN viewed_at IS NULL THEN NOW() ELSE viewed_at END
       WHERE public_token = $1
       RETURNING id, quote_id, viewed_at`,
      [token]
    );

    if (proposal.length === 0) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const proposalData = proposal[0];

    // Registrar evento no quote_events para follow-up
    await run(
      `INSERT INTO quote_events (id, quote_id, type, data, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [proposalData.quote_id, "proposta_visualizada", JSON.stringify({ token })]
    );

    return NextResponse.json({ success: true, viewed_at: proposalData.viewed_at });
  } catch (error) {
    console.error("Erro ao registrar visualização:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}