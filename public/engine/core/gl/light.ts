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
    public toJson(): Promise<string> {
        return new Promise<string>(resolve => {
            resolve(JSON.stringify({
                position: Array.from(this.position),
                direction: Array.from(this.direction),
                ambient: Array.from(this.ambient),
                diffuse: Array.from(this.diffuse),
                specular: Array.from(this.specular),
                shininess: this.shininess
            }));
        })
    }

    public static fromJson(json: string): Promise<Light> {

        return new Promise<Light>(resolve => {
            const light = new Light();
            const obj = JSON.parse(json);
            const pos = obj.position as [number, number, number];
            const dir = obj.direction as [number, number, number];
            const amb = obj.ambient as [number, number, number, number];
            const diff = obj.diffuse as [number, number, number, number];
            const spec = obj.specular as [number, number, number, number];

            light.position = vec3.fromValues(...pos);
            light.direction = vec3.fromValues(...dir);
            light.ambient = vec4.fromValues(...amb);
            light.diffuse = vec4.fromValues(...diff);
            light.specular = vec4.fromValues(...spec);
            light.shininess = obj.shininess;

            resolve(light)
        });
    }
}
