import type { Metadata } from "next";
import { JetBrains_Mono, Lora, Playfair_Display } from "next/font/google";
import "./globals.scss";

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

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "The Eva Times",
  description:
    "A personal newsletter: essays, projects, tracking, recipes, and more — newspaper-style editions from Eva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontHeadline.variable} ${fontBody.variable} ${fontMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
