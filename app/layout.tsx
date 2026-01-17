import "./globals.css";
import { PostHogProvider } from "./provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-bg text-text min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a className="font-semibold" href="/">
              All tools
            </a>
            <nav className="text-sm text-muted space-x-6">
              <a href="/">Tools</a>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 py-10 flex-1">
          <PostHogProvider>{children}</PostHogProvider>
        </main>
        <footer className="border-t border-border mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted space-y-2">
            <p>© {new Date().getFullYear()} AllTools. All rights reserved.</p>

            <p className="max-w-3xl">
              AllTools provides free online utilities for developers, creators,
              and general use. Tools are offered “as is” without warranties of
              any kind. Use at your own discretion.
            </p>

            <p>
              Not affiliated with any third-party brands or services mentioned.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
