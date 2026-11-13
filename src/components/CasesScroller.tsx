"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioCase } from "@/data/cases";
import { CaseArticle } from "./CaseArticle";

const EAGER_COUNT = 2;

export function CasesScroller({ items }: { items: PortfolioCase[] }) {
  const [idx, setIdx] = useState(0);
  const startX = useRef<number | null>(null);
  const region = useRef<HTMLDivElement>(null);

  const go = (next: number) => {
    setIdx(Math.max(0, Math.min(items.length - 1, next)));
  };

  useEffect(() => {
    const urls = [items[idx], items[idx + 1]]
      .flatMap((item) => [item?.desktop?.src, item?.mobile?.src])
      .filter((src): src is string => !!src);
    for (const src of urls) {
      const img = new Image();
      img.src = src;
    }
  }, [idx, items]);

  return (
    <div
      ref={region}
      className="lg:hidden"
      data-testid="cases-carousel"
      aria-roledescription="carrossel"
      onTouchStart={(e) => {
        startX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (startX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
        startX.current = null;
        if (dx < -40) go(idx + 1);
        else if (dx > 40) go(idx - 1);
      }}
    >
      <div className="relative">
        <div data-testid="case-slide" data-slide={idx}>
          <CaseArticle item={items[idx]} eager />
        </div>
        {items.map((item, i) => {
          const preload = i !== idx && (i < EAGER_COUNT || i === idx + 1);
          if (!preload) return null;
          return (
            <div key={item.title} aria-hidden className="pointer-events-none fixed top-0 left-0 -z-10 w-full max-w-3xl invisible">
              <CaseArticle item={item} eager />
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-nowrap items-center justify-center gap-1">
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
          {items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Mostrar ${item.title}`}
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
          disabled={idx === items.length - 1}
          onClick={() => go(idx + 1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
