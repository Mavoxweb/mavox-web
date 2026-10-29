import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Termos de Serviço", alternates: { canonical: "/termos" } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="surface-light section-y">
        <article className="container-x max-w-3xl space-y-5">
          <h1 className="t-h2">Termos de Serviço</h1>
          <p>Ao usar este site e contratar a Mavox, você concorda com os termos abaixo.</p>
          <h2 className="t-h3 pt-4">Propostas e contratação</h2>
          <p>Os orçamentos são gratuitos e sem compromisso. Escopo, prazo, valor e forma de pagamento constam na proposta aprovada por você.</p>
          <h2 className="t-h3 pt-4">Propriedade</h2>
          <p>Domínio, hospedagem contratada e código desenvolvido para o seu projeto ficam em seu nome, após a quitação das etapas acordadas.</p>
          <h2 className="t-h3 pt-4">Suporte</h2>
          <p>O suporte é prestado por WhatsApp e e-mail, conforme o plano contratado.</p>
          <h2 className="t-h3 pt-4">Contato</h2>
          <p>Dúvidas sobre estes termos: {SITE.emails[0]}.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
