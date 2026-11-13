import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { SITE } from "@/lib/site";
import { showClients } from "@/data/clients";

const nav = [
  ["/#servicos", "Serviços"],
  ...(showClients ? [["/#clientes", "Clientes"]] : []),
  ["/#processo", "Como funciona"],
  ["/#sobre", "Sobre"],
  ["/#faq", "Dúvidas"],
  ["/orcamento", "Pedir orçamento"],
];

export function Footer() {
  return (
    <footer className="surface-dark border-t border-line pb-24 pt-14 text-sm lg:pb-10">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-block rounded-lg px-3 py-1.5"><Image src="/logo.png" alt="Mavox" width={150} height={50} sizes="160px" className="h-12 w-auto" /></Link>
          <p className="mt-4 max-w-sm">Tecnologia e desenvolvimento web para pequenas e médias empresas crescerem com autoridade digital.</p>
          {SITE.socials.length > 0 && (
            <ul className="mt-5 flex gap-2">
              {SITE.socials.map((s) => (
                <li key={s.label}><a href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer" className="icon-btn border border-line text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{s.label === "Instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></> : <path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z" />}</svg>
                </a></li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Rodapé">
          <h2 className="font-display text-base font-bold text-white">Navegação</h2>
          <ul className="mt-3 space-y-1">
            {nav.map(([h, l]) => <li key={h}><Link href={h} className="inline-flex min-h-11 items-center [@media(hover:hover)]:hover:text-white">{l}</Link></li>)}
          </ul>
        </nav>

        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-white">Contato & Legal</h2>
          <ul className="mt-3 space-y-3">
            <li className="flex min-w-0 gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden /><span className="min-w-0 [overflow-wrap:anywhere]">{SITE.address}</span></li>
            <li className="flex min-w-0 gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden /><a href={SITE.phoneHref} className="min-w-0 [overflow-wrap:anywhere] [@media(hover:hover)]:hover:text-white">{SITE.phone}</a></li>
            {SITE.emails.map((e) => <li key={e} className="flex min-w-0 gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden /><a href={`mailto:${e}`} className="min-w-0 [overflow-wrap:anywhere] [@media(hover:hover)]:hover:text-white">{e}</a></li>)}
          </ul>
          <ul className="mt-6 space-y-1">
            <li><Link href="/privacidade" className="inline-flex min-h-11 items-center text-xs [@media(hover:hover)]:hover:text-white">Política de Privacidade</Link></li>
            <li><Link href="/termos" className="inline-flex min-h-11 items-center text-xs [@media(hover:hover)]:hover:text-white">Termos de Serviço</Link></li>
          </ul>
        </div>
      </div>
      <p className="container-x mt-12 border-t border-line pt-6 text-xs">© {new Date().getFullYear()} Mavox. Todos os direitos reservados.</p>
    </footer>
  );
}

