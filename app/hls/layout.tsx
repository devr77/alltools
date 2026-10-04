import HlsShell, { shellMetadata, shellViewport } from "./HlsShell";
import { onMain } from "./place";

// HLS as served at toolsbase.org/hls.
export const metadata = shellMetadata;
export const viewport = shellViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HlsShell place={onMain}>{children}</HlsShell>;
}
