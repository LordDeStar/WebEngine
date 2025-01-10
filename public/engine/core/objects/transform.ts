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
}
