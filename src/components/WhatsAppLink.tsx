"use client";
import type { ComponentProps } from "react";
import { trackLead } from "@/lib/analytics";
import { whatsappLink } from "@/lib/site";

/** Link de WhatsApp. O evento de lead no clique fica desligado quando `leadEvent` é false. */
export function WhatsAppLink({ message, onClick, leadEvent = true, ...props }: { message?: string; leadEvent?: boolean } & Omit<ComponentProps<"a">, "href">) {
  return (
    <a
      {...props}
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { if (leadEvent) trackLead("whatsapp"); onClick?.(e); }}
    />
  );
}
