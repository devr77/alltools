import ShareShell, { shellMetadata } from "../share/ShareShell";
import { onDomain } from "../share/place";

// Share as served at the root of the share domain (NEXT_PUBLIC_SHARE_URL), reached through middleware.ts.
export const metadata = shellMetadata;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShareShell place={onDomain}>{children}</ShareShell>;
}
