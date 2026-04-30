import styles from "./Footer.module.scss";
import SubscribeSection from "../Subscribe/Subscribe";
export function Footer() {
  return (
    <footer className={styles.footer}>
      <section id="subscribe" style={{ textAlign: "center" }}>
        <SubscribeSection />
      </section>

      <p>© {new Date().getFullYear()} Eva Lieu. All rights reserved.</p>
      <div className={styles.links}>
        <a
          href="https://github.com/itsevalieu"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/eva-lieu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
