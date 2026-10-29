"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ArrowRight } from "lucide-react";
import { showClients } from "@/data/clients";

const links = [
  { id: "servicos", label: "Serviços" },
  ...(showClients ? [{ id: "clientes", label: "Clientes" }] : []),
  { id: "processo", label: "Como funciona" },
  { id: "sobre", label: "Sobre" },
  { id: "faq", label: "Dúvidas" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = links
      .map((l) => document.getElementById(l.id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className="sticky top-0 z-50 text-white transition-all duration-300 border-b border-white/10 shadow-md"
      style={{
        backgroundColor: scrolled
          ? "rgba(18, 12, 56, 0.96)"
          : "#120c38",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        ["--header-h" as string]: scrolled ? "60px" : "72px",
      }}
    >
      <div
        className="container-x flex items-center justify-between transition-[height] duration-300"
        style={{ height: "var(--header-h)" }}
      >
        <Link
          href="/"
          aria-label="Mavox, página inicial"
          className="rounded-lg px-3 py-1.5 focus-visible:outline-white"
        >
          <Image
            src="/logo.png"
            alt="Mavox"
            width={150}
            height={50}
            priority
            sizes="160px"
            className={`w-auto transition-[height] duration-300 ${
              scrolled ? "h-10" : "h-12"
            }`}
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              aria-current={active === l.id ? "true" : undefined}
              className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                active === l.id
                  ? "bg-white/20 text-white shadow-inner font-semibold"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/orcamento"
            className="btn btn-primary hidden !min-h-11 !px-5 !py-2 text-sm sm:inline-flex shadow-lg"
          >
            Pedir orçamento grátis
          </Link>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className="icon-btn border border-white/30 text-white lg:hidden hover:bg-white/10 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 data-[state=open]:animate-[fade_.2s_ease-out]" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,90vw)] flex-col p-5 shadow-float bg-[#120c38] text-white border-l border-white/10 data-[state=open]:animate-[slide_.35s_cubic-bezier(.32,.72,0,1)]"
                style={{
                  paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
                }}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-lg font-bold text-white">
                    Menu
                  </Dialog.Title>
                  <Dialog.Close
                    className="icon-btn border border-white/25 text-white hover:bg-white/10"
                    aria-label="Fechar menu"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </Dialog.Close>
                </div>
                <nav
                  aria-label="Menu mobile"
                  className="mt-6 flex flex-1 flex-col"
                >
                  {links.map((l) => (
                    <Dialog.Close asChild key={l.id}>
                      <a
                        href={`/#${l.id}`}
                        className="flex min-h-14 items-center border-b border-white/15 text-lg font-medium text-white hover:text-white/80 transition-colors"
                      >
                        {l.label}
                      </a>
                    </Dialog.Close>
                  ))}
                </nav>
                <Dialog.Close asChild>
                  <Link
                    href="/orcamento"
                    className="btn btn-primary btn-block mt-6"
                  >
                    Pedir orçamento grátis{" "}
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
