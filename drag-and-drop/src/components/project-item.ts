import { autobind } from "../decorators/autobind";
import { Draggable } from "../models/drag-drop";
import { Project } from "../models/project";
import { Component } from "./base-component";

export default class ProjectItem
  extends Component<HTMLLIElement, HTMLUListElement>
  implements Draggable
{
  private project: Project;

  get getNumOfPeople() {
    if (this.project.numOfPeople === 1) {
      return "1 person";
    } else {
      return `${this.project.numOfPeople} people`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, `project-${project.id}`);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent): void {
    console.log("dragstart", event);
    event.dataTransfer!.setData("text/plain", this.project.id.toString());
    event.dataTransfer!.effectAllowed = "move";
  }

  @autobind
  dragEndHander(event: DragEvent): void {
    console.log("dragend", event);
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHander);
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector(
      "h3"
    )!.textContent = `${this.getNumOfPeople} assigned`;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
