import { testimonials } from "@/data/content";
import { TestimonialCard } from "./TestimonialCard";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

export function Testimonials() {
  if (!testimonials.length) return null;
  const [first, ...others] = testimonials;
  return (
    <section aria-labelledby="dep-title" className="surface-light section-y">
      <div className="container-x">
        <h2 id="dep-title" className="t-h2 max-w-3xl">O que nossos clientes dizem</h2>
        <div className="mt-12 hidden gap-5 lg:grid lg:grid-cols-[1.4fr_1fr]">
          <TestimonialCard t={first} large />
          <div className="grid gap-5">{others.slice(0, 2).map((t) => <TestimonialCard key={t.name + t.company} t={t} />)}</div>
        </div>
        <div className="mt-10"><TestimonialsCarousel items={testimonials} /></div>
      </div>
    </section>
  );
}
