import { projects } from "@/data/projects";
import { Project } from "@evalieu/common";

export function getAllProjects(): Project[] {
  // Sort projects by creation date (newest first)
  return [...projects].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
