import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
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

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Header />
      <main id="main">
        <Hero />
        <Pains />
        <Cases />
        <ClientsStrip />
        <Services />
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
