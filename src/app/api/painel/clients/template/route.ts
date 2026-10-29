import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Create workbook with template data
    const workbook = XLSX.utils.book_new();

    // Template data with examples
    const templateData = [
      {
        name: "João Silva",
        email: "joao@email.com",
        phone: "(11) 99999-9999",
        company: "Empresa A Ltda",
        source: "manual",
        intent: "conhecer",
        tagIds: "tag-id-1;tag-id-2",
      },
      {
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "(21) 88888-8888",
        company: "Empresa B S.A.",
        source: "site",
        intent: "avaliando",
        tagIds: "tag-id-3",
      },
      {
        name: "Pedro Oliveira",
        email: "pedro@email.com",
        phone: "(31) 77777-7777",
        company: "",
        source: "manual",
        intent: "pronto_para_contratar",
        tagIds: "",
      },
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const colWidths = [
      { wch: 25 }, // name
      { wch: 30 }, // email
      { wch: 18 }, // phone
      { wch: 25 }, // company
      { wch: 12 }, // source
      { wch: 22 }, // intent
      { wch: 20 }, // tagIds
    ];
    worksheet["!cols"] = colWidths;

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="template-importacao-clientes.xlsx"',
      },
    });
  } catch (error) {
    console.error("Erro ao gerar template:", error);
    return NextResponse.json({ error: "Erro ao gerar template" }, { status: 500 });
  }
}