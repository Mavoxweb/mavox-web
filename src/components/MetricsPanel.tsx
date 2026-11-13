"use client";
import { useEffect, useRef, useState } from "react";
import type { Metric } from "@/data/clients";

function Counter({ m }: { m: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(m.value); // valor final já correto sem JS

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min((t - start) / dur, 1);
        setN(Math.round(m.value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [m.value]);

  return <span ref={ref} className="tabular">{m.prefix}{n}{m.suffix}</span>;
}

export function MetricsPanel({ metrics }: { metrics: Metric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="container-x relative z-10 -mb-12 mt-12 sm:-mb-14">
      <dl className={`glass shadow-float grid gap-y-6 rounded-[var(--radius-block)] border border-line p-6 sm:p-8 ${metrics.length > 1 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col text-center">
            <dt className="order-2 mt-1 text-sm text-fg-muted">{m.label}</dt>
            <dd className="order-1 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl"><Counter m={m} /></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

