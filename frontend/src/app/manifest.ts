import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CryptoBazaar",
    short_name: "CryptoBazaar",
    description: "India's only gated P2P stablecoin exchange. Trade USDT and USDC securely.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#D4FF00",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
