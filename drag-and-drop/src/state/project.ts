import type { Project, ProjectStatus } from "../models/project";
import { ListenerState } from "./listener";

class ProjectState extends ListenerState<Project> {
  private projects: Project[] = [];
  private nextId: number = 1;
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addProject({
    title,
    description,
    numOfPeople,
  }: Omit<Project, "id" | "status">) {
    const newProject = {
      id: this.nextId++,
      title,
      description,
      numOfPeople,
      status: "active" as const,
    };
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: number, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

export const projectState = ProjectState.getInstance();
