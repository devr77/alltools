import type { Metadata } from "next";
import RandomRoller from "../RandomRoller";

export const metadata: Metadata = {
  title: "Coin Flip | ToolsBase",
  description: "Flip coins online and see heads, tails, and totals.",
  alternates: { canonical: "/randomisers/coin-flip" },
};

export default function Page() { return <RandomRoller mode="coin" />; }
