import type { Metadata } from "next";
import RandomRoller from "../RandomRoller";

export const metadata: Metadata = {
  title: "Dice Roller | ToolsBase",
  description: "Roll dice with custom sides and see individual results and totals.",
  alternates: { canonical: "/randomisers/dice-roller" },
};

export default function Page() { return <RandomRoller mode="dice" />; }
