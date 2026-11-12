import Image from "next/image";
import { cases } from "@/data/cases";

export function Cases() {
  return (
    <section id="cases" aria-labelledby="cases-title" className="surface-paper section-y">
      <div className="container-x">
        <h2 id="cases-title" className="t-h2">Sites que entregamos</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item) => (
            <article key={item.url} className="group overflow-hidden rounded-[var(--radius-card)] border border-paper-line bg-white shadow-card transition-shadow duration-200 [@media(hover:hover)]:hover:shadow-float">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col">
                <div className="relative aspect-video bg-bg">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span
                    className={`text-xs font-bold uppercase tracking-widest text-accent-ink ${item.tag ? "" : "invisible"}`}
                    aria-hidden={item.tag ? undefined : true}
                  >
                    {item.tag ?? "\u00a0"}
                  </span>
                  <h3 className="mt-2 font-display font-bold text-paper-ink">{item.title}</h3>
                  <span className="sr-only">Abre em uma nova aba.</span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
