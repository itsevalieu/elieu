import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "My portfolio website with projects timeline",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
