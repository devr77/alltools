import type { ReactNode } from "react";
import ToolLayout from "@/app/components/ToolLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <ToolLayout categorySlug="encoding-decoding">{children}</ToolLayout>;
}
