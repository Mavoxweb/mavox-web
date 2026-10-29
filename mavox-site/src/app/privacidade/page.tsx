import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Política de Privacidade", alternates: { canonical: "/privacidade" } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="surface-light section-y">
        <article className="container-x max-w-3xl space-y-5">
          <h1 className="t-h2">Política de Privacidade</h1>
          <p>A Mavox respeita a sua privacidade e trata dados pessoais conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
          <h2 className="t-h3 pt-4">Quais dados coletamos</h2>
          <p>Nome, WhatsApp, e-mail, empresa e as informações que você escolhe enviar nos formulários de orçamento. Também podemos coletar dados de navegação por meio de cookies e ferramentas de análise e publicidade.</p>
          <h2 className="t-h3 pt-4">Para que usamos</h2>
          <p>Para responder ao seu pedido, elaborar propostas, prestar suporte e melhorar nossos serviços e campanhas. Não vendemos seus dados.</p>
          <h2 className="t-h3 pt-4">Seus direitos</h2>
          <p>Você pode solicitar acesso, correção ou exclusão dos seus dados, e revogar consentimentos, escrevendo para {SITE.emails[0]}.</p>
          <p className="text-sm">Última atualização: {new Date().getFullYear()}.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
