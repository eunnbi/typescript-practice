import { autobind } from "../decorators/autobind";
import { DragTarget } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/project";
import { projectState } from "../state/project";
import { Component } from "./base-component";
import ProjectItem from "./project-item";

export default class ProjectList
  extends Component<HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];
  listElement: HTMLUListElement;
  private DROPPABLE = "droppable";

  constructor(private type: ProjectStatus) {
    super("project-list", "project-section-box", false, `${type}-projects`);
    this.assignedProjects = [];
    this.listElement = this.element.querySelector("ul")!;
    this.listElement.id = `${this.type}-projects-list`;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      this.listElement.classList.add(this.DROPPABLE);
    }
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    this.listElement.classList.remove(this.DROPPABLE);
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const prjId = Number(event.dataTransfer!.getData("text/plain"));
    projectState.moveProject(prjId, this.type);
    this.listElement.classList.remove(this.DROPPABLE);
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);
    projectState.addListener((projects) => {
      this.assignedProjects = projects.filter(
        (project) => project.status === this.type
      );
      this.renderProjects();
    });
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent =
      `${this.type} Projects`.toUpperCase();
  }

  private renderProjects() {
    this.listElement.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.listElement.id, prjItem);
    }
  }
}
