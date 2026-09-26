import ShareShell, { shellMetadata, shellViewport } from "./ShareShell";
import { onMain } from "./place";

// Share as served at toolsbase.org/share.
export const metadata = shellMetadata;
export const viewport = shellViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShareShell place={onMain}>{children}</ShareShell>;
}
