import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexus AI — Simulate Decisions Before Reality Does",
    template: "%s | Nexus AI",
  },
  description:
    "Multi-Agent Decision Intelligence Platform. Launch expert AI agents to simulate the chain reactions of your strategic decisions.",
  keywords: ["AI", "decision intelligence", "simulation", "multi-agent", "strategy", "enterprise"],
  authors: [{ name: "Nexus AI Team" }],
  creator: "Nexus AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexus-ai.app",
    title: "Nexus AI — Simulate Decisions Before Reality Does",
    description: "Multi-Agent Decision Intelligence Platform",
    siteName: "Nexus AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus AI",
    description: "Simulate Decisions Before Reality Does",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-background`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
