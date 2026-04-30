export interface Project {
  id: string;
  title: string;
  date: string;
  summary?: string;
  description: string;
  longDescription: string;
  challenges?: string[];
  solutions?: string[];
  images: string[];
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}
