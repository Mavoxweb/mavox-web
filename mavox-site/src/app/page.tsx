import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ClientsStrip } from "@/components/ClientsStrip";
import { Pains } from "@/components/Pains";
import { Services } from "@/components/Services";
import { Cases } from "@/components/Cases";
import { Process } from "@/components/Process";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { metrics, showClients } from "@/data/clients";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        {metrics.length > 0 && <div aria-hidden className={`h-12 sm:h-14 ${showClients ? "surface-light" : "surface-paper"}`} />}
        <ClientsStrip />
        <Pains />
        <Services />
        <Cases />
        <Process />
        <About />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
