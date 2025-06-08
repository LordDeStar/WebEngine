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

    }

    public RemoveComponent(name: string, subname?: string): void {
        let components = this.components.filter(com => com.name === name);
        if (components.length == 1) {
            let index = this.components.findIndex(comp => comp === components[0]);
            this.components[index].BeforeRemove();
            this.components.splice(index, 1);
        }
        else if (components.length > 1 && subname) {
            let component = this.components.findIndex(com => com.subname == subname);
            this.components[component].BeforeRemove();
            this.components.splice(component, 1);
        }
        else {
            console.error(`Component with name [${name}] is undefined`);
        }
    }


    public static async fromJson(json: string): Promise<GameObject> {

        const data = JSON.parse(json);
        const components = Promise.all(
            data.components.map(async (component: string) => {
                let comp = JSON.parse(component);
                switch (comp.name) {
                    case 'renderer':
                        return
                }
            })
        );
        const gameObject = new GameObject(data.tag);



        gameObject.transform = await Transform.fromJson(data.transform);
        return gameObject;
    }
    public async toJson(): Promise<string> {
        const componentsJson = await Promise.all(
            this.components.map(async (component) => await component.toJson())
        );
        return JSON.stringify({
            tag: this.tag,
            transform: await this.transform.toJson(),
            components: componentsJson
        });
    }

}
