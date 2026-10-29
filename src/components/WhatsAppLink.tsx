"use client";
import type { ComponentProps } from "react";
import { trackLead } from "@/lib/analytics";
import { whatsappLink } from "@/lib/site";

/** Link de WhatsApp que dispara o evento Lead no clique. */
export function WhatsAppLink({ message, onClick, ...props }: { message?: string } & Omit<ComponentProps<"a">, "href">) {
  return (
    <a
      {...props}
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { trackLead("whatsapp"); onClick?.(e); }}
    />
  );
}
