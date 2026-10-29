"use client";
import { useRef, useState } from "react";
import type { Testimonial } from "@/data/content";
import { TestimonialCard } from "./TestimonialCard";

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [idx, setIdx] = useState(0);
  return (
    <div className="lg:hidden">
      <ul ref={ref} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none]"
        onScroll={(e) => { const el = e.currentTarget; setIdx(Math.round(el.scrollLeft / (el.firstElementChild?.clientWidth ?? 1))); }}>
        {items.map((t) => <li key={t.name + t.company} className="w-[86%] shrink-0 snap-center"><TestimonialCard t={t} /></li>)}
      </ul>
      <div className="mt-2 flex justify-center gap-1" role="group" aria-label="Depoimentos">
        {items.map((t, i) => (
          <button key={i} type="button" aria-label={`Ir para depoimento ${i + 1}`} aria-current={i === idx}
            onClick={() => ref.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })}
            className="grid h-11 w-8 place-items-center"><span className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-surface" : "w-2 bg-paper-line"}`} /></button>
        ))}
      </div>
    </div>
  );
}
