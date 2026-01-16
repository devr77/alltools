import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "./provider";

export const metadata: Metadata = {
  title: "All tools",
  description: "A collection of useful tools ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-bg text-text">
        <header className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-semibold">All tools</span>
            <nav className="text-sm text-muted space-x-6">
              <a href="/tools">Tools</a>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          <PostHogProvider>{children}</PostHogProvider>
        </main>

        <footer className="border-t border-border mt-20">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-muted">
            © {new Date().getFullYear()} Toolbox
          </div>
        </footer>
      </body>
    </html>
  );
}
