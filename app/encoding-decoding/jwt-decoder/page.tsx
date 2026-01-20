import React from "react";
import JwtDecoder from "./JwtDecoder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder - Decode and Inspect JWT Tokens | ToolsBase",
  description:
    "Decode and inspect JWT (JSON Web Tokens) to view header, payload, and signature information. Debug and analyze JWT tokens. Free online JWT decoder.",
  keywords: ["jwt decoder", "jwt inspector", "token decoder", "json web tokens"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/jwt-decoder" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JwtDecoder />
    </div>
  );
}

export default page;
