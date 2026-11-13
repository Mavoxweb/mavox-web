import Link from "next/link";
import { TOP_BANNER } from "@/data/promo";

export function PromoBanner() {
  if (!TOP_BANNER.enabled) return null;
  return (
    <aside className="bg-bg px-4 py-2.5 text-center text-sm text-white" data-testid="promo-banner">
      <p className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>{TOP_BANNER.message}</span>
        <Link href={TOP_BANNER.href} className="font-bold text-accent underline-offset-2 [@media(hover:hover)]:hover:underline">
          {TOP_BANNER.cta}
        </Link>
      </p>
    </aside>
  );
}
