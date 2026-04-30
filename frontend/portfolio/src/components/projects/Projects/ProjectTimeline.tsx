import styles from "../Timeline/Timeline.module.scss";
import ProjectItem from "./ProjectItem";
import { Project } from "@evalieu/common";

export default function ProjectTimeline({ projects }: { projects: Project[] }) {
  const groupedProjects = projects.reduce((acc, project) => {
    const year = new Date(project.date).getFullYear();
    const month = new Date(project.date).toLocaleString("default", {
      month: "long",
    });

    if (!acc[year]) {
      acc[year] = {};
    }

    if (!acc[year][month]) {
      acc[year][month] = [];
    }

    acc[year][month].push(project);

    return acc;
  }, {});

  const sortedYears = Object.keys(groupedProjects).sort((a, b) => b - a);

  return (
    <div className={styles.timelineContainer}>
      {sortedYears.map((year) => (
        <div key={year} className={styles.yearContainer}>
          <div className={styles.year}>
            <div className={styles.yearLabel}>{year}</div>
            {Object.keys(groupedProjects[year])
              .sort((a, b) => {
                const dateA = new Date(`${a} 1, ${year}`);
                const dateB = new Date(`${b} 1, ${year}`);
                return dateB - dateA;
              })
              .map((month) => (
                <div key={month} className={styles.monthContainer}>
                  <div className={styles.month}>
                    {month.slice(0, 3).toUpperCase()}
                  </div>
                  <div className={styles.timelineItems}>
                    {groupedProjects[year][month].map((project) => (
                      <ProjectItem key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
