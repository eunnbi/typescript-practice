export type ProjectStatus = "active" | "finished";

export interface Project {
  id: number;
  title: string;
  description: string;
  numOfPeople: number;
  status: ProjectStatus;
}
