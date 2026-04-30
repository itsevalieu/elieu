"use client";
import Head from "next/head";
import Navbar from "../components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";

export default function Layout({ children, title = "My Portfolio" }) {
  return (
    <html>
      <body>
        <Head>
          <title>{title}</title>
          <meta
            name="description"
            content="My portfolio website with projects timeline"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
