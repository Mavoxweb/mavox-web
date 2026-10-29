"use client";

import { useEffect, useCallback } from "react";

export interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

export function pushEvent(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  const w = window as typeof window & { dataLayer?: DataLayerEvent[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(event);
}

export default function GtmDataLayer() {
  const initDataLayer = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as typeof window & { dataLayer?: DataLayerEvent[] };
    w.dataLayer = w.dataLayer || [];
  }, []);

  useEffect(() => {
    initDataLayer();

    // Page view automático
    pushEvent({ event: "page_view", page_path: window.location.pathname, page_url: window.location.href, page_title: document.title });

    // Click no WhatsApp
    const waHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href*='wa.me']") as HTMLAnchorElement | null;
      if (link) {
        pushEvent({ event: "whatsapp_click", url: link.href, text: link.textContent?.trim() || "" });
      }
    };

    // Submit de formulários
    const formHandler = (event: Event) => {
      const target = event.target as HTMLFormElement;
      pushEvent({ event: "form_submit", form_action: target.action || window.location.pathname, form_id: target.id || "" });
    };

    document.addEventListener("click", waHandler, true);
    document.addEventListener("submit", formHandler, true);

    return () => {
      document.removeEventListener("click", waHandler, true);
      document.removeEventListener("submit", formHandler, true);
    };
  }, [initDataLayer]);

  return null;
}
