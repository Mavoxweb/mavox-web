import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#47b749", color: "#110c38", fontSize: 40, fontWeight: 800, borderRadius: 14 }}>M</div>),
    size
  );
}
