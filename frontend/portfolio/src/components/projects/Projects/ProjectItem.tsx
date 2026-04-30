import Link from "next/link";
import styles from "./Project.module.scss";
import { Project } from "@evalieu/common";

export default function ProjectItem({ project }: { project: Project }) {
  return (
    <div className={styles.projectItem}>
      <div className={styles.projectContent}>
        <h3>{project.title}</h3>
        <div className={styles.date}>{project.date}</div>
        <p>{project.description}</p>

        <div className={styles.tags}>
          {project.technologies.slice(0, 5).map((tech, index) => (
            <span key={index}>{tech}</span>
          ))}
        </div>

        <div className={styles.links}>
          <Link href={`/projects/${project.id}`}>View Details</Link>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
