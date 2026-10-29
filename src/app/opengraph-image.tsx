import { ImageResponse } from "next/og";

export const alt = "Mavox: sites e sistemas que geram clientes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#110c38", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 800 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#47b749" }} />
          MAVOX
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
          <span>Seu site deveria</span>
          <span>trazer clientes.</span>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#47b749" }}>Proposta grátis em até 24h</div>
      </div>
    ),
    size
  );
}
