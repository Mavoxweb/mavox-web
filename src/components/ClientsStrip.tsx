import Image from "next/image";
import { clients, showClients } from "@/data/clients";

export function ClientsStrip() {
  if (!showClients) return null;
  const logos = clients.map((c) => (
    <Image key={c.name} src={c.logo} alt={c.name} width={c.width} height={c.height} sizes="160px"
      className={`h-10 w-auto max-w-[9rem] object-contain ${c.lightLogo ? "brightness-0 opacity-80" : ""}`} />
  ));
  return (
    <section id="clientes" aria-labelledby="clientes-title" className="surface-light section-y !py-14">
      <div className="container-x">
        <h2 id="clientes-title" className="t-h3 mx-auto max-w-xl text-center">Empresas com quem a Mavox já trabalhou</h2>
      </div>
      <div className="marquee mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track items-center [animation-duration:36s]">
          {[...logos, ...logos].map((l, i) => <li key={i} className="shrink-0 px-10" aria-hidden={i >= logos.length}>{l}</li>)}
        </ul>
      </div>
    </section>
  );
}
