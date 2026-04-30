"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Portfolio</Link>
      </div>
      <div className={styles.navItems}>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="#contact">Contact</Link>
      </div>
    </nav>
  );
}
