export default function PainelLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div
            className="h-5 w-40 rounded-md"
            style={{ background: "var(--bd)" }}
          />
          <div
            className="h-3 w-64 max-w-full rounded-md"
            style={{ background: "var(--bd)" }}
          />
        </div>
        <div
          className="h-8 w-28 rounded-lg"
          style={{ background: "var(--bd)" }}
        />
      </div>

      <div className="painel-g">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="painel-c painel-k">
            <div className="painel-ch">
              <div
                className="h-8 w-8 rounded-lg"
                style={{ background: "var(--bd)" }}
              />
              <div
                className="h-3 w-24 rounded-md"
                style={{ background: "var(--bd)" }}
              />
            </div>
            <div
              className="h-6 w-16 rounded-md mt-3"
              style={{ background: "var(--bd)" }}
            />
          </div>
        ))}
      </div>

      <div className="painel-c">
        <div
          className="h-4 w-44 rounded-md mb-4"
          style={{ background: "var(--bd)" }}
        />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-full rounded-xl"
              style={{ background: "var(--bd)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
