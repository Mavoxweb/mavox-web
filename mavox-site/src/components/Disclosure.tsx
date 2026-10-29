"use client";
import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";

/** Bloco recolhível com altura animada (grid 0fr -> 1fr). */
export function Disclosure({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-inherit underline-offset-4 [@media(hover:hover)]:hover:underline">
        <Plus className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden /> {label}
      </button>
      <div id={id} role="region" className="collapse" data-open={open}>
        <div inert={!open}>{children}</div>
      </div>
    </div>
  );
}
