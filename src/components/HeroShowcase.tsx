import { cases } from "@/data/cases";
import { BrowserFrame, PhoneFrame, hostOf } from "./DeviceFrames";

const showcase = cases.find((item) => item.title === "TGX Engenharia" && item.desktop && item.mobile);

export function HeroShowcase() {
  if (!showcase?.desktop || !showcase.mobile) return null;
  return (
    <figure className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-label="Site da TGX Engenharia no computador e no celular">
      <div className="grid grid-cols-[minmax(0,1fr)_28%] items-end gap-4">
        <BrowserFrame
          shot={showcase.desktop}
          host={hostOf(showcase.url)}
          sizes="(min-width: 1024px) 36rem, 70vw"
          priority
        />
        <PhoneFrame
          shot={showcase.mobile}
          sizes="(min-width: 1024px) 11rem, 28vw"
          eager
        />
      </div>
    </figure>
  );
}
