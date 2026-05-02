import type { Metadata } from "next";
import {
  DM_Sans,
  Inter,
  JetBrains_Mono,
  Lora,
  Playfair_Display,
} from "next/font/google";
import "./globals.scss";
import { Suspense } from "react";
import { Analytics } from "@/components/Analytics";
import { AdSenseScript } from "@/components/AdSlot";
import { LayoutProvider } from "@/context/LayoutContext";
import { ThemeProvider } from "@/context/ThemeContext";

/** Avoid prerender-time fetch to the API during `next build` when the backend is offline. */
export const dynamic = "force-dynamic";

const fontHeadline = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
});

const fontBody = Lora({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontDmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://newsletter.evalieu.com";

export const metadata: Metadata = {
  title: {
    default: "The Eva Times",
    template: "%s — The Eva Times",
  },
  description:
    "A personal newsletter: essays, projects, tracking, recipes, and more — newspaper-style editions from Eva.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "The Eva Times",
    title: "The Eva Times",
    description: "Essays, projects, tracking, recipes, and more — newspaper-style editions.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Eva Times",
    description: "Essays, projects, tracking, recipes, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVarsOnHtml = `${fontHeadline.variable} ${fontBody.variable} ${fontInter.variable} ${fontDmSans.variable}`;

  return (
    <html lang="en" className={fontVarsOnHtml}>
      <body className={fontMono.variable}>
        <Analytics />
        <AdSenseScript />
        <Suspense fallback={<>{children}</>}>
          <ThemeProvider>
            <LayoutProvider>{children}</LayoutProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
