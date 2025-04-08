import { Component } from "./component";
import { GameObject } from "../eng";
export class AnimationClip {
    private target: GameObject;
    private updateFunc: any;
    constructor(target: GameObject, update: any) {
        this.target = target;
        this.updateFunc = update;
    }

    public async toJson(): Promise<string> {
        return JSON.stringify(this.updateFunc);
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
    public async OnStart(): Promise<void> {

    }
    public OnUpdate(): void {
        if (this.current) {
            this.current.Update();
        }
    }
    public BeforeRemove(): void {

    }
    // Исправленный метод toJson
    public async toJson(): Promise<string> {
        try {
            // Ожидаем завершения всех асинхронных операций для клипов
            const clipsJson = await Promise.all(
                this.clips.map(async (clip) => await clip.toJson())
            );

            // Сериализуем данные после завершения всех операций
            return JSON.stringify({
                name: this.name,
                clips: clipsJson,
                currentIndex: this.currentIndex,
            });
        } catch (error) {
            console.error("Error during Animator serialization:", error);
            throw error;
        }
    }
}