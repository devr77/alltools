import HlsShell, { shellMetadata, shellViewport } from "../hls/HlsShell";
import { onDomain } from "../hls/place";

// HLS as served at the root of the HLS domain (NEXT_PUBLIC_HLS_URL), reached through middleware.ts.
export const metadata = shellMetadata;
export const viewport = shellViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HlsShell place={onDomain}>{children}</HlsShell>;
}
