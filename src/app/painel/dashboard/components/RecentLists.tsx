import Link from "next/link";
import type { RecentLead, RecentQuote } from "@/lib/dashboard-repository";

export function RecentLeadsList({ leads }: { leads: RecentLead[] }) {
  return (
    <div>
      <div className="painel-ch">
        <span className="font-semibold text-sm">Leads Recentes</span>
        <Link
          href="/painel/clients"
          className="more hover:underline"
          style={{ color: "var(--p)" }}
        >
          Ver todos
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: "var(--mu)" }}>
          Nenhum lead cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between p-2.5 rounded-lg border"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--tx)" }}>
                  {lead.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--mu)" }}>
                  {lead.email || lead.phone || "Sem contato"}
                </p>
              </div>
              <span className={`painel-pill ${getSourcePillClass(lead.source)} flex-shrink-0`}>
                {getSourceLabel(lead.source)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RecentQuotesList({ quotes }: { quotes: RecentQuote[] }) {
  return (
    <div>
      <div className="painel-ch">
        <span className="font-semibold text-sm">Orçamentos Recentes</span>
        <Link
          href="/painel/quotes"
          className="more hover:underline"
          style={{ color: "var(--p)" }}
        >
          Ver todos
        </Link>
      </div>

      {quotes.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: "var(--mu)" }}>
          Nenhum orçamento emitido.
        </p>
      ) : (
        <ul className="space-y-2">
          {quotes.map((quote) => (
            <li
              key={quote.id}
              className="flex items-center justify-between p-2.5 rounded-lg border"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--tx)" }}>
                  {quote.code}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--mu)" }}>
                  {quote.clientName}
                </p>
              </div>
              <span className={`painel-pill ${getStatusPillClass(quote.status)} flex-shrink-0`}>
                {getStatusLabel(quote.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getSourcePillClass(source: string | null) {
  switch (source) {
    case "site": return "up";
    case "manual": return "";
    default: return "";
  }
}

function getSourceLabel(source: string | null) {
  switch (source) {
    case "site": return "Site";
    case "manual": return "Manual";
    case "apify": return "Importado";
    case "google_maps": return "Google";
    case "instagram": return "Instagram";
    default: return source || "—";
  }
}

function getStatusPillClass(status: string) {
  switch (status) {
    case "aprovado": return "up";
    case "recusado": return "dn";
    case "proposta_enviada": return "up";
    default: return "";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "novo": return "Novo";
    case "em_analise": return "Em Análise";
    case "proposta_enviada": return "Proposta";
    case "aprovado": return "Aprovado";
    case "recusado": return "Recusado";
    case "expirado": return "Expirado";
    default: return status;
  }
}
