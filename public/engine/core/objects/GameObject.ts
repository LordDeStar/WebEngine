import { Material } from './../gl/material';
import { Shader } from "../gl/shader";
import { Geometry } from "./geometry";
import { gl, GLUtilities } from "../gl/gl";
import { mat4 } from "gl-matrix";
import { Transform } from "./transform";

export class GameObject {
    private _geometry: Geometry;
    public _projection: mat4;
    public transform: Transform = new Transform();
    public material: Material;
    constructor() {
        this._geometry = this.loadGeometry();
        this._projection = mat4.create();
        this.transform.scale[0] = 100;
        this.transform.scale[1] = 100;
        this.transform.position[0] = 150;
        this.transform.position[1] = 150;
        this.transform.rotation[2] = Math.PI / 4;

        this.material = new Material();
        this.material.setColor(0.5, 0.75, 0, 1);


        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, [500, 5000, 5], [0, 0, 0], [0, 1, 0]);

        // Умножение матриц проекции и вида
        mat4.multiply(this._projection, this._projection, viewMatrix);
    }



    private loadGeometry(): Geometry {
        let vertices = [
            // Вершины куба
            0.0, 0.0, 1.0,
            1.0, 0.0, 1.0,
            1.0, 1.0, 1.0,
            0.0, 1.0, 1.0,

            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
        ];

        let indices = [
            // Индексы для граней куба
            0, 1, 2,
            0, 2, 3,

            4, 5, 6,
            4, 6, 7,

            0, 1, 5,
            0, 5, 4,

            2, 3, 7,
            2, 7, 6,

            1, 2, 6,
            1, 6, 5,

            0, 3, 7,
            0, 7, 4,
        ];

        let edgeIndices = [
            // Индексы для ребер куба
            0, 1,
            1, 2,
            2, 3,
            3, 0,

            4, 5,
            5, 6,
            6, 7,
            7, 4,

            0, 4,
            1, 5,
            2, 6,
            3, 7,
        ];

        return new Geometry(vertices, indices, edgeIndices);
    }

    public draw(): void {

        this.material.basicUse();
        let location = this.material.getAttributePosition('pos', 'basic');
        if (location == -1) {
            console.log('attrib not found');
            return;
        }

        this._geometry.bindBuffers();
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);

        const mvpMatrix = this.transform.getMvpMatrix(this._projection);

        let loc = this.material.getUniformPosition('matrix', 'basic');
        gl.uniformMatrix4fv(loc, false, new Float32Array(mvpMatrix));
        this._geometry.draw();


        this.material.edgeUse();
        location = this.material.getAttributePosition('pos', 'edge');
        if (location == -1) {
            console.log('attrib not found');
            return;
        }

        this._geometry.bindEdgeBuffers();
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);

        loc = this.material.getUniformPosition('matrix', 'edge');
        gl.uniformMatrix4fv(loc, false, new Float32Array(mvpMatrix));
        this._geometry.drawEdges();
    }
}