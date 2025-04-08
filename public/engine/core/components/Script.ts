import { GameObject } from "../eng";
import { Component } from "./component";

export class Script implements Component {
    public owner: GameObject | null = null;
    public name: string = "script";
    private _params: any;
    private _data: any;

    constructor(scriptData: any) {
        this._data = scriptData;
    }
    public async OnStart(): Promise<void> {
        this.init();
        if (this._data.onStart)
            this._data.onStart(this.owner);
    }
    public OnUpdate(): void {
        if (this._data.onUpdate)
            this._data.onUpdate(this.owner, this._params);
    }
    public BeforeRemove(): void {
        if (this._data.beforeRemove)
            this._data.beforeRemove(this.owner);;
    }
    public toJson(): Promise<string> {
        return new Promise<string>(resolve => {
            resolve(JSON.stringify({
                name: this.name,
                params: this._params,
                data: this._data
            }))
        });
    }
    private init() {
        if (this._data.init)
            this._params = this._data.init();
    }
}