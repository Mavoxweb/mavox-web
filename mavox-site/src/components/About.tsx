import Image from "next/image";
import { Check, Quote } from "lucide-react";

export function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="surface-paper section-y">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div aria-hidden className="absolute -bottom-3 -right-3 h-full w-full rounded-[var(--radius-block)] border-2 border-accent" />
          <div className="relative aspect-[4/5] max-h-[34rem] w-full overflow-hidden rounded-[var(--radius-block)] bg-surface shadow-card">
            <Image src="/alex.jpg" alt="Alex Marques, CEO da Mavox" fill sizes="(min-width:1024px) 40vw, (min-width:640px) 384px, 90vw" className="object-cover" />
          </div>
        </div>
        <div>
          <h2 id="sobre-title" className="t-h2">Não somos uma simples agência. Somos seu parceiro de crescimento.</h2>
          <p className="t-lead mt-5">
            Desenvolvemos sites, sistemas e estratégias de marketing com DNA de inovação. Cada projeto começa com consultoria, porque entender o seu negócio vem antes da primeira linha de código.
          </p>
          <figure className="surface-dark mt-8 rounded-[var(--radius-card)] p-6 shadow-card sm:p-8">
            <Quote className="h-7 w-7 text-accent" aria-hidden />
            <blockquote className="mt-3 font-display text-lg font-semibold leading-snug text-white sm:text-xl">
              “Meu grande objetivo é dar acesso à tecnologia de qualidade a pequenas e médias empresas, de uma forma democrática.”
            </blockquote>
            <figcaption className="mt-4 text-sm">Alex Marques, CEO da Mavox</figcaption>
          </figure>
          <ul className="mt-8 space-y-3">
            {["Atendimento próximo, direto com quem decide", "Tecnologia moderna, rápida e segura", "Foco em resultado mensurável, não em estética vazia"].map((t) => (
              <li key={t} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-accent-ink" aria-hidden />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
