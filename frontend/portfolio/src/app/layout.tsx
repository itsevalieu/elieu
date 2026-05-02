import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@evalieu/design-system/styles";
import "./globals.scss";

import { Footer } from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Eva Lieu — Portfolio",
  description: "Portfolio website with projects and achievements",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-app="portfolio">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
