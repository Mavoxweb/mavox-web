import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/data/content";

export function TestimonialCard({ t, large = false }: { t: Testimonial; large?: boolean }) {
  return (
    <figure className={`flex h-full flex-col rounded-[var(--radius-card)] border border-paper-line bg-white ${large ? "p-8 lg:p-12" : "p-6"}`}>
      <Quote className="h-6 w-6 text-accent-ink" aria-hidden />
      <blockquote className={`mt-4 flex-1 text-paper-ink ${large ? "font-display text-xl font-semibold leading-snug lg:text-2xl" : "text-base"}`}>{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.photo && <Image src={t.photo} alt={t.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />}
        <span className="text-sm"><strong className="block text-paper-ink">{t.name}</strong>{t.role}, {t.company}</span>
      </figcaption>
    </figure>
  );
}
