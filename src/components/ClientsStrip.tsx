import Image from "next/image";
import { clients, showClients } from "@/data/clients";

export function ClientsStrip() {
  if (!showClients) return null;
  const logos = clients.map((c) => (
    <Image key={c.name} src={c.logo} alt={c.name} width={c.width} height={c.height} sizes="160px"
      className="h-10 w-auto object-contain opacity-70 grayscale transition duration-200 [@media(hover:hover)]:hover:opacity-100 [@media(hover:hover)]:hover:grayscale-0" />
  ));
  return (
    <section id="clientes" aria-labelledby="clientes-title" className="surface-light section-y !pb-12">
      <div className="container-x">
        <h2 id="clientes-title" className="t-h3 mx-auto max-w-xl text-center">Empresas que já cresceram com a Mavox</h2>
        <ul className="mt-10 hidden grid-cols-3 items-center justify-items-center gap-x-8 gap-y-10 md:grid lg:grid-cols-6">
          {logos.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>
      <div className="marquee mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] md:hidden">
        <ul className="marquee-track items-center gap-12 pr-12">
          {[...logos, ...logos].map((l, i) => <li key={i} aria-hidden={i >= logos.length}>{l}</li>)}
        </ul>
      </div>
    </section>
  );
}
