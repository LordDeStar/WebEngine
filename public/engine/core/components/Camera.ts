import { mat4, vec3 } from 'gl-matrix';
import { GameObject } from '../eng';
import type { Component } from './component';
import { Engine } from '../eng';
export class Camera implements Component {
    public name: string;
    public owner: GameObject | null = null;
    public viewMatrix: mat4;
    public eye: vec3;
    public center: vec3;
    public up: vec3;
    public subname: string;
    private speed: number;
    public allowedToStart = false;

    constructor(name: string) {
        this.speed = 1;
        this.name = "camera";
        this.viewMatrix = mat4.create();
        this.subname = name;

        this.eye = vec3.fromValues(0, 0, 3);
        this.center = vec3.fromValues(0, 0, 5);
        this.up = vec3.fromValues(0, 1, 0);


        Engine.eventEmitter.on('keydown', (event) => {
            const { data } = event;
            if (!this.owner) throw new Error('Работай кусок говна');
            switch (data.key) {
                case 'w':
                    this.owner.transform.position[2] += this.speed;
                    break;
                case 's':
                    this.owner.transform.position[2] -= this.speed;
                    break;
                case 'd':
                    this.owner.transform.position[0] += this.speed;
                    this.center[0] += this.speed;
                    break;
                case 'a':
                    this.owner.transform.position[0] -= this.speed;
                    this.center[0] -= this.speed;
                    break;
            }
        })
    }





    private updateMatrix(): void {
        if (this.owner) {
            this.eye = this.owner.transform.position;
        }
        mat4.lookAt(this.viewMatrix, this.eye, this.center, this.up);
    }

    public async OnStart(): Promise<void> {
        this.updateMatrix();
        if (this.allowedToStart) Engine.viewMatrix = this.viewMatrix;

    }
    public OnUpdate(): void {
        this.updateMatrix();
        if (this.allowedToStart) Engine.viewMatrix = this.viewMatrix;
    }
    public BeforeRemove(): void {
        Engine.viewMatrix = Engine.createViewMatrix();
    }
    public async toJson(): Promise<string> {
        return '';
    }


}