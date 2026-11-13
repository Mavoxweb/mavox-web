/** Notebook e celular desenhados em CSS, sem print de cliente e sem nome inventado. */
export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-hidden>
      <div className="rounded-t-2xl border border-white/20 bg-[#1A1548] p-2 shadow-float sm:p-3">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-2 h-5 flex-1 rounded-md bg-white/10" />
        </div>
        <div className="overflow-hidden rounded-lg bg-white">
          <div className="flex items-center justify-between bg-[#1A1548] px-4 py-3">
            <span className="h-2.5 w-16 rounded bg-white/80" />
            <span className="h-6 w-20 rounded-full bg-[#4CB748]" />
          </div>
          <div className="space-y-3 px-4 py-5">
            <span className="block h-3 w-4/5 rounded bg-[#1A1548]" />
            <span className="block h-3 w-3/5 rounded bg-[#1A1548]/30" />
            <span className="mt-2 block h-8 w-36 rounded-full bg-[#4CB748]" />
          </div>
          <div className="mx-4 mb-4 rounded-xl border border-[#1A1548]/10 p-3">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-[#0085C6]">Google</span>
            <span className="mt-1 block h-2.5 w-2/3 rounded bg-[#1A1548]/70" />
            <span className="mt-2 block h-2 w-full rounded bg-[#1A1548]/20" />
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-24 rounded-b-md bg-[#1A1548]" />
      <div className="mx-auto h-1.5 w-36 rounded-b-xl bg-[#0085C6]" />

      <div className="absolute -bottom-2 right-0 w-[7.25rem] rounded-[1.35rem] bg-[#1A1548] p-1.5 shadow-float sm:w-32">
        <div className="overflow-hidden rounded-[1rem] bg-white">
          <div className="flex justify-center bg-[#1A1548] py-1.5">
            <span className="h-1 w-8 rounded-full bg-white/40" />
          </div>
          <div className="space-y-2 px-2 py-3">
            <span className="block h-2 w-3/4 rounded bg-[#1A1548]" />
            <span className="block h-2 w-1/2 rounded bg-[#1A1548]/25" />
            <span className="block h-12 rounded-lg bg-[linear-gradient(160deg,#1A1548,#0085C6)]" />
            <span className="block h-5 rounded-full bg-[#4CB748]" />
          </div>
        </div>
      </div>
    </div>
  );
}
