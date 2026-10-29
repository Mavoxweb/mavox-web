declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Dispara evento de Lead para Meta Pixel e Google Analytics / Ads */
export function trackLead(source: "formulario" | "whatsapp") {
  if (typeof window === "undefined") return;

  // Meta Pixel
  window.fbq?.("track", "Lead", { content_name: source });

  // Google Analytics / Ads
  window.gtag?.("event", "generate_lead", {
    event_category: "engagement",
    event_label: source,
  });
}

/** Dispara evento quando o cliente clica para falar no WhatsApp */
export function trackWhatsAppClick(label?: string) {
  if (typeof window === "undefined") return;

  window.fbq?.("trackCustom", "WhatsAppClick", { label: label || "botao_flutuante" });
  window.gtag?.("event", "click_whatsapp", {
    event_category: "contact",
    event_label: label || "botao_flutuante",
  });
}

/** Dispara evento quando uma proposta é aceita pelo cliente */
export function trackProposalAccepted(proposalCode: string, totalValue?: number) {
  if (typeof window === "undefined") return;

  // Meta Pixel (Purchase / Custom Lead fechado)
  window.fbq?.("track", "Purchase", {
    content_name: `Proposta ${proposalCode}`,
    value: totalValue || 0,
    currency: "BRL",
  });

  // Google Analytics / Ads
  window.gtag?.("event", "purchase", {
    transaction_id: proposalCode,
    value: totalValue || 0,
    currency: "BRL",
  });
}
