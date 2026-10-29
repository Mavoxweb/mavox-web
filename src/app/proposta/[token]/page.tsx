"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, FileText, CheckCircle2 } from "lucide-react";
import { trackProposalAccepted } from "@/lib/analytics";

interface Proposal {
  id: string;
  code: string;
  quote_id: string;
  version: number;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  total: number | null;
  valid_until: string | null;
  created_at: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number | null;
    position: number;
  }>;
}

export default function ProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [token]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/propostas/${token}`);
      if (!res.ok) throw new Error("Proposta não encontrada");
      const data = await res.json();
      setProposal(data);
    } catch (err) {
      setError("Erro ao carregar proposta");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/propostas/${token}/pdf`);
      if (!res.ok) throw new Error("Erro ao gerar PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposta-${proposal?.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Erro ao gerar PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const res = await fetch(`/api/painel/quotes/${proposal?.quote_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "aprovado" }),
      });

      if (!res.ok) throw new Error("Erro ao aceitar proposta");

      if (proposal) {
        trackProposalAccepted(proposal.code, proposal.total || total);
      }
      setAccepted(true);
    } catch (err) {
      setError("Erro ao aceitar proposta");
    }
  };

  const handleWhatsApp = () => {
    if (!proposal?.client?.phone) return;
    const phone = proposal.client.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${proposal.client.name}! Sua proposta ${proposal.code} está pronta para assinatura. Acesse: ${window.location.origin}/proposta/${token}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const total = proposal?.items?.reduce(
    (sum, item) => sum + (item.unit_price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-4xl text-blue-600">⟳</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
          <h1 className="text-xl font-semibold text-red-600 mb-2">{error || "Proposta não encontrada"}</h1>
          <p className="text-gray-600 mb-4">O link da proposta pode estar inválido ou expirado.</p>
          <a href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-green-200 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Proposta Aceita!</h1>
          <p className="text-[#64748b] mb-6">Obrigado por confiar na Mavox. Nossa equipe entrará em contato em breve.</p>
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Voltar ao início
            </Link>
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              📱 WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Mavox" className="h-8" />
              <span className="font-bold text-[#0f172a] text-lg">Mavox</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#64748b]">Proposta #{proposal.code}</p>
              <p className="text-xs text-[#94a3b8]">Versão {proposal.version}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Client Info */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#0f172a] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Cliente
            </h2>
            <p className="text-lg font-semibold text-[#0f172a] mb-1">{proposal.client.name}</p>
            {proposal.client.company && (
              <p className="text-[#64748b] text-sm">{proposal.client.company}</p>
            )}
            <p className="text-sm text-[#64748b] mt-1">{proposal.client.email}</p>
            {proposal.client.phone && (
              <p className="text-sm text-[#64748b]">{proposal.client.phone}</p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              📱 WhatsApp
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#0f172a]/90 transition-colors text-sm font-medium"
            >
              {pdfLoading ? (
                <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              PDF
            </button>
          </div>
        </div>

        {/* Accept Button */}
        {proposal.status !== "aprovado" && (
          <button
            onClick={handleAccept}
            disabled={accepted}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold shadow-lg"
          >
            {accepted ? "✓ Aceito!" : "✓ Aceitar Proposta"}
          </button>
        )}

        {/* Items Table */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b]">Descrição</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748b]">Qtde</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748b]">Unitário</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748b]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {proposal.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc]">
                    <td className="px-6 py-4 text-[#0f172a] font-medium">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right text-[#475569]">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-[#475569]">
                      {item.unit_price ? `R$ ${Number(item.unit_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-[#475569] font-medium">
                      {item.unit_price
                        ? `R$ ${Number(item.unit_price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f8fafc]">
                <tr>
                  <td className="px-6 py-4 text-right text-sm font-medium text-[#0f172a]" colSpan={3}>
                    Total
                  </td>
                  <td className="px-6 py-4 text-right text-xl font-bold text-[#0f172a]">
                    {total ? `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-8 px-6 sm:px-8 lg:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img src="/logo.png" alt="Mavox" className="h-6" />
            <span className="font-bold text-lg">Mavox</span>
          </div>
          <p className="text-[#94a3b8] text-sm">
            Desenvolvendo soluções digitais que impulsionam negócios.
          </p>
        </div>
      </footer>
    </div>
  );
}
