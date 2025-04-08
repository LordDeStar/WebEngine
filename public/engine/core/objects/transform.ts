import { mat4, vec3 } from "gl-matrix";

export class Transform {
    public scale: vec3;
    public position: vec3;
    public rotation: vec3;

    constructor() {
        this.scale = vec3.fromValues(1, 1, 1);
        this.position = vec3.create();
        this.rotation = vec3.create();
    }

    public getMvpMatrix(projection: mat4, view: mat4): mat4 {
        const modelMatrix = mat4.create();

        mat4.translate(modelMatrix, modelMatrix, this.position);
        mat4.scale(modelMatrix, modelMatrix, this.scale);

        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);

        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, projection, view);
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
        return mvpMatrix;
    }

    public toJson(): Promise<string> {
        return new Promise<string>(resolve => {
            resolve(JSON.stringify({
                scale: [...this.scale.values()],
                position: [...this.position.values()],
                rotation: [...this.rotation.values()]
            }));
        });
    }

    public static fromJson(json: string): Promise<Transform> {
        return new Promise<Transform>(resolve => {
            const transform = new Transform();
            const object = JSON.parse(json);

            transform.scale = vec3.fromValues(object.scale[0], object.scale[1], object.scale[2]);
            transform.position = vec3.fromValues(object.position[0], object.position[1], object.position[2]);
            transform.rotation = vec3.fromValues(object.rotation[0], object.rotation[1], object.rotation[2]);
            resolve(transform);
        });
    }
}
