import type { ReactNode } from "react";
import ToolLayout from "../components/ToolLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <ToolLayout categorySlug="data-convertor">{children}</ToolLayout>;
}
