"use client";

import { usePathname } from "next/navigation";

/** Shared header/main/footer for the site. Sections with their own layout (e.g. /share) render without them. */
export default function SiteChrome({ header, footer, children }: { header: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (pathname === "/share" || pathname.startsWith("/share/")) return <>{children}</>;
  return (
    <>
      {header}
      <main className="site-main">{children}</main>
      {footer}
    </>
  );
}
