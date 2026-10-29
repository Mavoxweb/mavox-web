import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Register font descriptors for pdfmake
(pdfMake as any).vfs = pdfFonts;

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
      `SELECT id, quote_id, version, created_at
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
    }>(
      `SELECT id, code, lead_id, total, valid_until
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

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0);

    // Gerar PDF com pdfmake
    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      header: [
        {
          text: "MAVOX - Web Development Agency",
          fontSize: 18,
          bold: true,
          color: "#2563eb",
          alignment: "right",
          margin: [0, 0, 0, 20],
        },
        {
          text: `Proposta #${quote.code}`,
          fontSize: 12,
          bold: true,
          alignment: "right",
          margin: [0, 0, 0, 10],
        },
        {
          text: new Date(proposal.created_at).toLocaleDateString("pt-BR"),
          fontSize: 10,
          color: "#64748b",
          alignment: "right",
          margin: [0, 0, 0, 20],
        },
      ],
      content: [
        {
          text: "PROPOSTA COMERCIAL",
          fontSize: 24,
          bold: true,
          color: "#2563eb",
          alignment: "center",
          margin: [0, 20, 0, 30],
        },
        {
          columns: [
            {
              width: "60%",
              items: [
                {
                  text: "CLIENTE",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#64748b",
                  margin: [0, 0, 0, 5],
                },
                {
                  text: client.name,
                  fontSize: 16,
                  bold: true,
                  color: "#0f172a",
                  margin: [0, 0, 0, 5],
                },
                { text: client.company || "—", fontSize: 12, color: "#475569", margin: [0, 0, 0, 5] },
                { text: client.email || "—", fontSize: 12, color: "#475569", margin: [0, 0, 0, 5] },
                client.phone && { text: client.phone, fontSize: 12, color: "#475569" },
              ],
            },
            {
              width: "40%",
              items: [
                {
                  text: "DETALHES DA PROPOSTA",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#64748b",
                  margin: [0, 0, 0, 5],
                },
                { text: `Código: ${quote.code}`, fontSize: 12, color: "#475569", margin: [0, 0, 0, 5] },
                {
                  text: `Versão: ${proposal.version}`,
                  fontSize: 12,
                  color: "#475569",
                  margin: [0, 0, 0, 5],
                },
                {
                  text: `Data: ${new Date(proposal.created_at).toLocaleDateString("pt-BR")}`,
                  fontSize: 12,
                  color: "#475569",
                  margin: [0, 0, 0, 5],
                },
                quote.valid_until && {
                  text: `Validade: ${new Date(quote.valid_until).toLocaleDateString("pt-BR")}`,
                  fontSize: 12,
                  color: "#475569",
                },
              ],
            },
          ],
        },
        {
          text: "RESUMO DOS SERVIÇOS",
          fontSize: 14,
          bold: true,
          color: "#0f172a",
          margin: [0, 30, 0, 15],
        },
        {
          type: "table",
          header: [
            { text: "Descrição", style: "tableHeader" },
            { text: "Qtde", style: "tableHeader" },
            { text: "Unitário", style: "tableHeader" },
            { text: "Total", style: "tableHeader" },
          ],
          body: items.map((item: any) => [
            item.description,
            item.quantity.toString(),
            item.unit_price ? `R$ ${Number(item.unit_price).toFixed(2)}` : "—",
            item.unit_price
              ? `R$ ${Number(item.unit_price * item.quantity).toFixed(2)}`
              : "—",
          ]),
          columnWidths: ["*", "auto", "auto", "auto"],
        },
        {
          text: "",
          margin: [0, 20, 0, 0],
        },
        {
          text: "TOTAL",
          fontSize: 16,
          bold: true,
          color: "#0f172a",
          alignment: "right",
          margin: [0, 10, 0, 5],
        },
        {
          text: `R$ ${total.toFixed(2)}`,
          fontSize: 20,
          bold: true,
          color: "#2563eb",
          alignment: "right",
        },
        {
          text: "Condições e Observações",
          fontSize: 14,
          bold: true,
          color: "#0f172a",
          margin: [0, 30, 0, 15],
        },
        {
          text:
            "1. Esta proposta é válida pelo prazo informado acima.\n" +
            "2. Os valores poderão ser reajustados após o prazo de validade.\n" +
            "3. O pagamento deverá ser realizado conforme condições acordadas.\n" +
            "4. Para aceitar esta proposta, assine digitalmente ou entre em contato com nossa equipe.",
          fontSize: 10,
          color: "#475569",
          lineHeight: 1.5,
        },
        {
          text: "Assinatura do Cliente: _______________________________",
          fontSize: 11,
          margin: [0, 30, 0, 10],
        },
        {
          text: "Data: ____/____/______",
          fontSize: 11,
          margin: [0, 0, 0, 20],
        },
        {
          text: "Mavox - Desenvolvimento Web e Marketing Digital",
          fontSize: 9,
          color: "#94a3b8",
          alignment: "center",
          italics: true,
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: "#ffffff",
          fillColor: "#2563eb",
        },
      },
    };

    const pdfDoc = (pdfMake as any).createPdf(docDefinition);
    const pdfBuffer = await (pdfMake as any).makeBuffer(pdfDoc);

    return new NextResponse(Buffer.from(pdfBuffer as ArrayBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposta-${quote.code}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
