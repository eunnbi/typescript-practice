import { autobind } from "../decorators/autobind";
import { projectState } from "../state/project";
import { Validatable, validate } from "../utils/validation";
import { Component } from "./base-component";

export default class ProjectForm extends Component<HTMLFormElement> {
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
  }
}
