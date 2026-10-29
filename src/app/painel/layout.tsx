import { connection } from "next/server";
import PainelShell from "./PainelShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O painel exibe dados do banco: garante renderização a cada requisição
  // em vez de congelar as páginas no momento do build.
  await connection();

  return <PainelShell>{children}</PainelShell>;
}
