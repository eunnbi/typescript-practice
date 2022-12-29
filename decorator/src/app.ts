/* 클래스 데코레이터 */
function Component1(target: Function) {
  target.prototype.type = "component";
  target.prototype.version = "0.0.1";
}

function Component2<T extends { new (...args: any[]): {} }>(target: T) {
  // 재정의
  return class extends target {
    // 속성
    type: string = "component";
    version: string = "0.1.0";

    constructor(...args: any[]) {
      super(...args);
    }
    // 메서드
    info() {
      //@ts-ignore
      console.log(this.name, this.type, this.version);
    }
  };
}

// 데코레이터 팩토리
function Logger(logString: string) {
  console.log("LOGGER FACTORY");
  return function (target: Function) {
    console.log(logString);
    console.log(target);
  };
}

function WithTemplate(template: string, hookId: string, name: string) {
  console.log("TEMPLATE FACTORY");
  return function (target: any) {
    console.log("Rendering template");
    const hookEl = document.getElementById(hookId);
    const p = new target(name);
    if (hookEl) {
      hookEl.innerHTML = template;
      hookEl.querySelector("h1")!.textContent = p.name;
    }
  };
}

// 멀티 데코레이터
//@Component1
@Component2
@Logger("LOGGING - PERSON")
@WithTemplate("<h1>My Person Object</h1>", "app", "Max")
class Person {
  constructor(public name: string) {
    console.log("Creating person object...");
  }

  info() {
    console.log(this.name);
  }
}
const person = new Person("Max");
console.log((person as any).type);
(person as any).info();

/* 메서드 데코레이터 */
function Write(able: boolean = true) {
  return function (target: any, name: string, desc: PropertyDescriptor) {
    console.log(target, name, desc);
    desc.writable = able;
  };
}

/* 매개변수 데코레이터 */
function Log(target: any, name: string, index: number) {
  console.log(
    target.name === undefined ? target.constructor.name : target.name
  );
  console.log(`
    매개변수 순서: ${index}, 
    멤버 이름: ${name === undefined ? "constructor" : name}
  `);
}

class Product {
  constructor(@Log public title: string, @Log private price: number) {}

  @Write(false)
  getPriceWithTax(@Log tax: number) {
    return this.price * (1 + tax);
  }
}
const product = new Product("Chocolate", 1000);
/*
product.getPriceWithTax = function (_: number) {
  console.log(this);
  return 0;
}; // ERROR
*/

/* 접근 제어자 데코레이터 */
function Configurable(remove: boolean) {
  return function (_: any, _2: string, desc: PropertyDescriptor) {
    desc.configurable = remove;
  };
}

class Rectangle {
  public color?: string = "#000";

  constructor(private _width: number, private _height: number) {}

  @Configurable(false)
  get width() {
    return this._width;
  }

  @Configurable(false)
  get height() {
    return this._height;
  }
}
const rect = new Rectangle(400, 210);
delete rect.color;
// delete rect.width; //ERROR

/* 속성 데코레이터 */
// 속성을 읽거나 쓸 때 로그를 남기는 데코레이터
function LogProp(target: any, name: string) {
  let value = target[name];

  if (delete target[name]) {
    Object.defineProperty(target, name, {
      get() {
        console.log(`GET: ${name} => ${value}`);
        return value;
      },
      set(newVal: any) {
        value = newVal;
        console.log(`SET: ${name} => ${value}`);
      },
      enumerable: true,
      configurable: true,
    });
  }
}

class Button {
  @LogProp
  type: string = "button";

  @LogProp
  version: string = "0.0.2";
}
const btn = new Button();
console.log(btn.type);
btn.type = "버튼";

// -------------------------------------------

function Autobind(target: any, name: string, _: PropertyDescriptor) {
  const originialMethod = target[name];
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originialMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

class Printer {
  message = "This works!";

  @Autobind
  showMessage() {
    console.log(this.message);
  }
}

const p = new Printer();
const button = document.querySelector("button");
button?.addEventListener("click", p.showMessage);
