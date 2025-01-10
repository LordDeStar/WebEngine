import { Component } from "./component";
import { GameObject } from "../eng";
export class AnimationClip {
    private target: GameObject;
    private updateFunc: any;
    constructor(target: GameObject, update: any) {
        this.target = target;
        this.updateFunc = update;
    }
    public Update(): void {
        this.updateFunc(this.target);
    }

}
export class Animator implements Component {
    public name: string = "animator";
    public clips: AnimationClip[] = [];
    public current: AnimationClip | null = null;
    public currentIndex: number = -1;
    public owner: GameObject | null = null;
    constructor() {
    }

    public AddClip(update: any): void {
        if (!this.owner) return;
        this.clips.push(new AnimationClip(this.owner, update));

    }

    public Next(): void {
        this.currentIndex++;
        if (this.currentIndex >= 0 && this.currentIndex < this.clips.length) {
            this.current = this.clips[this.currentIndex];
        }
    }

    public OnStart(): void {

    }
    public OnUpdate(): void {
        if (this.current) {
            this.current.Update();
        }
    }
    public BeforeRemove(): void {

    }
}