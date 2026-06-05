import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "CryptoBazaar";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #000000, #111111)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "8px",
            fontSize: 100,
            fontWeight: 800,
            color: "#D4FF00", // Lime green
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          CRYPTOBAZAAR
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#A1A1AA", // zinc-400
            letterSpacing: "1px",
            fontWeight: 500,
          }}
        >
          India&apos;s Gated P2P Stablecoin Exchange
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            display: "flex",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", color: "#ffffff", fontSize: 28, letterSpacing: "2px", fontWeight: "bold" }}>
            USDT & USDC
          </div>
          <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, backgroundColor: "#D4FF00" }} />
          <div style={{ display: "flex", color: "#ffffff", fontSize: 28, letterSpacing: "2px", fontWeight: "bold" }}>
            100% ESCROW
          </div>
          <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, backgroundColor: "#D4FF00" }} />
          <div style={{ display: "flex", color: "#ffffff", fontSize: 28, letterSpacing: "2px", fontWeight: "bold" }}>
            NO FRAUD
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
