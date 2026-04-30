import Link from "next/link";
import { projects } from "../data/projects";
import ContactSection from "../components/layout/Contact/Contact";
import styles from "./Home.module.scss";

export default function Home() {
  // Show only the latest 3 projects on the homepage
  const latestProjects = projects.slice(0, 3);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Hi, I'm Eva Lieu</h1>
        <p className={styles.heroDescription}>
          A passionate web developer focused on creating modern, responsive
          websites and applications.
        </p>
      </section>

      <section className={styles.latestProjects}>
        <h2 className={styles.latestProjectsTitle}>Latest Projects</h2>
        <div className={styles.projectGrid}>
          {latestProjects.map((project, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <h3 style={{ color: "var(--primary-color)" }}>{project.title}</h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.85rem",
                  margin: "0.5rem 0",
                }}
              >
                {project.date}
              </p>
              <p style={{ marginBottom: "1rem" }}>{project.description}</p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {project.technologies.slice(0, 3).map((tech, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#f0f0f0",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <Link
                href={`/projects/${project.id}`}
                style={{
                  color: "var(--primary-color)",
                  fontWeight: "500",
                }}
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" style={{ textAlign: "center" }}>
        <ContactSection />
      </section>
    </div>
  );
}
