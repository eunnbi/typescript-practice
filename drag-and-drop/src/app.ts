// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// validation
interface Validatable {
  value: string | number;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength !== undefined &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength !== undefined &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min !== undefined &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max !== undefined &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHander(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project State Management
type ProjectStatus = "active" | "finished";

interface Project {
  id: number;
  title: string;
  description: string;
  numOfPeople: number;
  status: ProjectStatus;
}

type Listener<T> = (items: T[]) => void;

class ListenerState<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

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
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Component Base Class
abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement = HTMLDivElement
> {
  templateElement: HTMLTemplateElement;
  hostElement: U;
  element: T;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.querySelector(`template#${templateId}`)!;
    this.hostElement = document.getElementById(hostElementId) as U;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as T;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectItem class
class ProjectItem
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
  dragStartHandler(event: DragEvent): void {}

  @autobind
  dragEndHander(event: DragEvent): void {}

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

// ProjectList class
class ProjectList extends Component<HTMLElement> {
  assignedProjects: Project[];
  private listId: string;

  constructor(private type: ProjectStatus) {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];
    this.listId = `${this.type}-projects-list`;
    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects) => {
      this.assignedProjects = projects.filter(
        (project) => project.status === this.type
      );
      this.renderProjects();
    });
  }

  renderContent() {
    this.element.querySelector("ul")!.id = this.listId;
    this.element.querySelector("h2")!.textContent =
      `${this.type} Projects`.toUpperCase();
  }

  private renderProjects() {
    const listEl = document.getElementById(this.listId)!;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.listId, prjItem);
    }
  }
}

// ProjectInput class
class ProjectInput extends Component<HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descInputElement: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector("input#title")!;
    this.descInputElement = this.element.querySelector("textarea#description")!;
    this.peopleInputElement = this.element.querySelector("input#people")!;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherUserInput() {
    const title = this.titleInputElement.value;
    const description = this.descInputElement.value;
    const numOfPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: title,
      required: true,
    };
    const descValidatable: Validatable = {
      value: description,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: numOfPeople,
      required: true,
      min: 1,
      max: 5,
    };
    if (
      validate(titleValidatable) &&
      validate(descValidatable) &&
      validate(peopleValidatable)
    ) {
      return {
        title,
        description,
        numOfPeople: Number(numOfPeople),
      };
    } else {
      alert("Invalid input, Please try again!");
      return;
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      projectState.addProject(userInput);
      this.clearInputs();
    }
    console.log(userInput);
  }
}

const prjInput = new ProjectInput();
console.log(prjInput);
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
