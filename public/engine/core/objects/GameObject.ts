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
        // Ожидаем завершения всех асинхронных операций для компонентов
        const componentsJson = await Promise.all(
            this.components.map(async (component) => await component.toJson())
        );

        // Сериализуем объект после завершения всех операций
        return JSON.stringify({
            tag: this.tag,
            transform: await this.transform.toJson(),
            components: componentsJson
        });
    }

}
