"use client";
import dynamic from "next/dynamic";

// Visual decorativo: carregado após a hidratação para não competir com o LCP/TBT.
const HeroVisual = dynamic(() => import("./HeroVisual").then((m) => m.HeroVisual), {
  ssr: false,
  loading: () => <div aria-hidden className="mx-auto min-h-[24rem] w-full max-w-md rounded-[var(--radius-block)] border border-line bg-surface lg:max-w-none" />,
});

export function HeroVisualLazy() { return <HeroVisual />; }
