"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { projects } from "../../../data/projects";
import { achievements as achievementList } from "../../../data/achievements";
import AchievementTimeline from "@/components/projects/Achievements/AchievementTimeline";
import { Achievement } from "@evalieu/common";
import styles from "./ProjectDetail.module.scss";

export default function ProjectDetail() {
  const { id } = useParams() as { id: string };

  // Find the current project
  const project = projects.find((p) => p.id === id);

  // Filter achievements for project id
  const achievements: Achievement[] = achievementList.filter(
    (p) => p.projectId === id
  );

  // Find previous and next projects for navigation
  const currentIndex = projects.findIndex((p) => p.id === id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  // Handle case when project is not found or page is still loading
  if (!project) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        {useParams().isFallback ? (
          <p>Loading...</p>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2>Project not found</h2>
            <p style={{ marginTop: "1rem" }}>
              The project you're looking for doesn't exist.
            </p>
            <Link
              href="/projects"
              style={{
                display: "inline-block",
                marginTop: "1.5rem",
                color: "var(--primary-color)",
                fontWeight: "500",
              }}
            >
              ← Back to Projects
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.projectDetail}>
      <div className={styles.header}>
        <h1>{project.title}</h1>
        <div className={styles.date}>{project.date}</div>

        <div className={styles.links}>
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              View Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
            >
              GitHub Repository
            </a>
          )}
        </div>
      </div>

      <div className={styles.gallery}>
        <div className={styles.imageContainer}>
          {project.images.map((image, index) => (
            <div key={index} className={styles.image}>
              <img
                src={image}
                alt={`${project.title} screenshot ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.description}>
        <h2>Project Overview</h2>
        <div
          dangerouslySetInnerHTML={{
            __html: project.longDescription.replace(/\n/g, "<br />"),
          }}
        />
      </div>

      <div className={styles.technicalDetails}>
        <h2>Technical Details</h2>

        <div className={styles.challengesSolutions}>
          <div className={styles.section}>
            <h3>Challenges</h3>
            <ul>
              {project.challenges?.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h3>Solutions</h3>
            <ul>
              {project.solutions?.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.techStack}>
          <h3>Technologies Used</h3>
          <div className={styles.tags}>
            {project.technologies.map((tech, index) => (
              <span key={index}>{tech}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.achievements}>
        <h2>Achievements</h2>
        <div>
          {achievements.length > 0 && (
            <AchievementTimeline achievements={achievements} />
          )}
        </div>
      </div>

      <div className={styles.navigation}>
        {prevProject ? (
          <Link href={`/projects/${prevProject.id}`} className={styles.prev}>
            {prevProject.title}
          </Link>
        ) : (
          <div></div>
        )}

        {nextProject && (
          <Link href={`/projects/${nextProject.id}`} className={styles.next}>
            {nextProject.title}
          </Link>
        )}
      </div>
    </div>
  );
}
