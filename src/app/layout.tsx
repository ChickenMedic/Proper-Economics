import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://propereconomics.com"),
  title: {
    default: "ProperEconomics — every big idea in economics, explained plainly",
    template: "%s · ProperEconomics",
  },
  description:
    "A free, plain-English guide to the history of economic thought: the people, the ideas, and interactive toys you can play with.",
  openGraph: {
    siteName: "ProperEconomics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-(--bg-raised) focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
