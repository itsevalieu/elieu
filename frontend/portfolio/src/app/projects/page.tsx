import ProjectTimeline from "../../components/projects/Projects/ProjectTimeline";
import { projects } from "../../data/projects";

export default function Projects() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>My Projects</h1>
      <p
        style={{
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto 3rem auto",
        }}
      >
        Here's a timeline of my recent projects, showcasing my skills and
        experience.
      </p>

      <ProjectTimeline projects={projects} />
    </div>
  );
}
