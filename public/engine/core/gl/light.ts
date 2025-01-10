import { vec3, vec4 } from "gl-matrix";

export class Light {
    public position: vec3;
    public direction: vec3;
    public ambient: vec4;
    public diffuse: vec4;
    public specular: vec4;
    public shininess: number;

    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.direction = vec3.fromValues(-1.0, -1.0, -1.0);
        this.ambient = vec4.fromValues(0.4, 0.4, 0.4, 1.0);
        this.diffuse = vec4.fromValues(1, 1, 1, 1.0);
        this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
        this.shininess = 32.0;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.position = vec3.fromValues(x, y, z);
    }

    public setDirection(x: number, y: number, z: number): void {
        this.direction = vec3.fromValues(x, y, z);
    }

    public setAmbient(r: number, g: number, b: number, a: number): void {
        this.ambient = vec4.fromValues(r, g, b, a);
    }

    public setDiffuse(r: number, g: number, b: number, a: number): void {
        this.diffuse = vec4.fromValues(r, g, b, a);
    }

    public setSpecular(r: number, g: number, b: number, a: number): void {
        this.specular = vec4.fromValues(r, g, b, a);
    }

    public setShininess(shininess: number): void {
        this.shininess = shininess;
    }
}
