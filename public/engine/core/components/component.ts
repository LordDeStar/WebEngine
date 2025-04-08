import { GameObject } from "../objects/GameObject";
export interface Component {
    name: string;
    owner: GameObject | null;
    OnStart(): Promise<void>;
    OnUpdate(): void;
    BeforeRemove(): void;
    toJson(): Promise<string>;
}


export interface ResizableComponent extends Component {
    OnResize(args: any): void;
}