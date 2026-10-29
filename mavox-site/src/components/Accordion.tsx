"use client";
import { useId, useState } from "react";
import { Plus } from "lucide-react";

type Item = { q: string; a: string };

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="divide-y divide-paper-line overflow-hidden rounded-[var(--radius-card)] border border-paper-line bg-white shadow-card">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button type="button" id={`${base}-b${i}`} aria-expanded={isOpen} aria-controls={`${base}-p${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-bold text-paper-ink sm:px-7 sm:text-lg">
                {it.q}
                <Plus aria-hidden className={`h-5 w-5 shrink-0 text-accent-ink transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
              </button>
            </h3>
            <div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} className={isOpen ? "collapse-open" : "collapse"}>
              <p className="px-5 pb-5 pt-3 text-[15px] leading-relaxed text-paper-ink">{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
