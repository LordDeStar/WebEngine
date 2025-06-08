import { Engine, GameObject } from "../eng";
import { Event } from "../event-system/event";
import { Component } from "./component";

export class Script implements Component {
    public owner: GameObject | null = null;
    public name: string = "script";
    public params: any;
    public allowedToStart = false;
    public subname: string;
    public fileUrl: string | undefined;
    public data: any;


    constructor(scriptData: any) {
        this.data = scriptData;
        this.subname = scriptData.name;
        this.init();
    }

    public setParams(newData: any) {
        this.params = newData;
    }

    public async OnStart(): Promise<void> {
        if (this.data.onStart)
            this.data.onStart(this.owner, this.params);
        if (this.data.onKeyDown && typeof this.data.onKeyDown === 'function')
            Engine.eventEmitter.on('keydown', (event) => {
                this.data.onKeyDown(event, this.owner, this.params);
            });
        if (this.data.onKeyUp && typeof this.data.onKeyUp === 'function')
            Engine.eventEmitter.on('keyup', (event) => {
                this.data.onKeyUp(event, this.owner, this.params);
            });
        if (this.data.onMouseDown && typeof this.data.onMouseDown === 'function')
            Engine.eventEmitter.on('mousedown', (event) => {
                this.data.onMouseDown(event, this.owner, this.params);
            });
        if (this.data.onMouseUp && typeof this.data.onMouseUp === 'function')
            Engine.eventEmitter.on('mouseup', (event) => {
                this.data.onMouseUp(event, this.owner, this.params);
            });
    }
    public OnUpdate(): void {
        if (this.data.onUpdate && this.allowedToStart)
            this.data.onUpdate(this.owner, this.params);
    }
    public BeforeRemove(): void {
        if (this.data.beforeRemove)
            this.data.beforeRemove(this.owner);;
    }
    public toJson(): Promise<string> {
        return new Promise<string>(resolve => {
            resolve(JSON.stringify({
                name: this.name,
                subname: this.subname,
                fileUrl: this.fileUrl
            }))
        });
    }
    private init() {
        if (this.data.init)
            this.params = this.data.init();
    }
}