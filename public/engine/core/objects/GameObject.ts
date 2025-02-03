import { Component, ResizableComponent } from './../components/component';
import { Transform } from "./transform";

export class GameObject {

    public tag: string;
    public readonly components: Component[] = [];
    public transform: Transform = new Transform();

    constructor(tag: string) {
        this.tag = tag;
    }

    public AddComponent(component: Component): void {
        component.owner = this;
        this.components.push(component);
    }

    public GetComponent<T extends Component>(name: string): T | undefined {
        let component = this.components.find(com => com.name === name);
        if (component) {
            return component as T;
        }
        console.error(`Component with name [${name}] is undefined`);
    }

    public RemoveComponent(name: string): void {
        let component = this.components.findIndex(com => com.name === name);
        if (component != -1) {
            this.components[component].BeforeRemove();
            this.components.splice(component, 1);
        }
        else {
            console.error(`Component with name [${name}] is undefined`);
        }
    }


}
