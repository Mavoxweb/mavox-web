"use client";
import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "motion/react";
import { Pause, Play, MessageCircle, FileText, ShoppingBag } from "lucide-react";

const pool = [
  { icon: MessageCircle, title: "Mensagem no WhatsApp", detail: "Interessado em site institucional" },
  { icon: FileText, title: "Pedido de orçamento", detail: "Landing page para campanha" },
  { icon: ShoppingBag, title: "Novo contato", detail: "Quer abrir uma loja virtual" },
  { icon: MessageCircle, title: "Mensagem no WhatsApp", detail: "Quer um sistema sob medida" },
  { icon: FileText, title: "Pedido de orçamento", detail: "Tráfego pago e marketing" },
];
const spring = { type: "spring", bounce: 0, duration: 0.4 } as const;

export function HeroVisual() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const visible = [0, 1, 2].map((i) => ({ key: tick - i, ...pool[(((tick - i) % pool.length) + pool.length) % pool.length], age: i })).filter((x) => x.key >= 0);

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative mx-auto w-full max-w-md lg:max-w-none" role="img" aria-label="Ilustração: um site e uma lista de novos contatos chegando">
        <div className="shadow-float overflow-hidden rounded-[var(--radius-block)] border border-line bg-surface">
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-3" aria-hidden>
            <i className="h-2.5 w-2.5 rounded-full bg-white/25" /><i className="h-2.5 w-2.5 rounded-full bg-white/25" /><i className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="ml-3 h-5 flex-1 rounded-full bg-white/8" />
          </div>
          <div className="space-y-3 p-5" aria-hidden>
            <div className="h-3 w-20 rounded bg-white/25" />
            <div className="h-6 w-4/5 rounded bg-white" />
            <div className="h-6 w-3/5 rounded bg-white/70" />
            <div className="h-2.5 w-full rounded bg-white/15" />
            <div className="h-2.5 w-5/6 rounded bg-white/15" />
            <div className="h-10 w-40 rounded-full bg-accent" />
          </div>
        </div>

        <div className="shadow-float relative -mt-6 ml-auto w-[90%] rounded-[var(--radius-card)] border border-line bg-surface p-4 backdrop-blur sm:-mt-8">
          <div className="mb-3 flex items-center justify-between text-xs text-fg-muted">
            <span className="font-medium text-white">Feed de contatos</span>
            {!reduce && (
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Retomar animação" : "Pausar animação"} className="icon-btn !h-9 !w-9 -m-2 text-white/80">
                {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
              </button>
            )}
          </div>
          <ul className="min-h-[8rem] space-y-2" aria-hidden>
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((v) => (
                <m.li key={v.key} layout transition={spring} initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} animate={{ opacity: 1 - v.age * 0.5, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <span className="text-sm font-semibold text-white">{v.title}</span>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </LazyMotion>
  );
}
