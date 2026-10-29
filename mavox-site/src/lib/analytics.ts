declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

/** Dispara o evento Lead do Meta Pixel (só se o pixel estiver carregado). */
export function trackLead(source: "formulario" | "whatsapp") {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "Lead", { content_name: source });
}
