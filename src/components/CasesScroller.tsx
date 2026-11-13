"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CasesScroller({
  labels,
  children,
}: {
  labels: string[];
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [idx, setIdx] = useState(0);

  const go = (next: number) => {
    const list = ref.current;
    const child = list?.children[next] as HTMLElement | undefined;
    if (!list || !child) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = child.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    list.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    setIdx(next);
  };

  return (
    <div>
      <ul
        ref={ref}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-16 lg:overflow-visible"
        onScroll={(e) => {
          if (window.matchMedia("(min-width: 1024px)").matches) return;
          const list = e.currentTarget;
          const slide = list.firstElementChild?.clientWidth || list.clientWidth || 1;
          setIdx(Math.max(0, Math.min(labels.length - 1, Math.round(list.scrollLeft / slide))));
        }}
      >
        {children}
      </ul>
      <div className="mt-5 flex flex-nowrap items-center justify-center gap-1 lg:hidden">
        <button
          type="button"
          className="icon-btn shrink-0 border border-paper-line text-paper-ink disabled:opacity-40"
          aria-label="Projeto anterior"
          disabled={idx === 0}
          onClick={() => go(idx - 1)}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <div role="group" aria-label="Escolher projeto" className="flex items-center">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-label={`Mostrar ${label}`}
              aria-current={i === idx ? "true" : undefined}
              onClick={() => go(i)}
              className="grid h-11 w-7 shrink-0 place-items-center"
            >
              <span className={`h-2 rounded-full ${i === idx ? "w-6 bg-bg" : "w-2 bg-paper-line"}`} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="icon-btn shrink-0 border border-paper-line text-paper-ink disabled:opacity-40"
          aria-label="Próximo projeto"
          disabled={idx === labels.length - 1}
          onClick={() => go(idx + 1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
