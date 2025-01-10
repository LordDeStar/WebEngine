import { TemplateGeometry } from '../objects/geometries';
import { Transform } from './../objects/transform';
import { mat4 } from 'gl-matrix';
import { Geometry } from './../objects/geometry';
import { Component, ResizableComponent } from "./component";
import { Material } from '../gl/material';
import { GameObject } from '../objects/GameObject';
import { gl } from '../gl/gl';

export class Renderer implements ResizableComponent {
    public name: string = "renderer";
    public material: Material | undefined;
    public _transform: Transform | undefined;
    public owner: GameObject | null = null;

    private _projection: mat4;
    private _viewMatrix: mat4;
    private _geometry: Geometry | undefined;

    constructor(geometry: TemplateGeometry) {
        this._projection = mat4.create();
        this._viewMatrix = mat4.create();
        this.loadGeometry(geometry);
    }
    public OnStart(): void {
        this._transform = this.owner?.transform;
    }
    public OnUpdate(): void {
        this.draw();
    }
    public BeforeRemove(): void {

    }
    public OnResize(args: any): void {
        this._projection = args._projection;
        this._viewMatrix = args._viewMatrix;
    }
    public loadGeometry(template: TemplateGeometry): void {
        this._geometry = Geometry.loadFromClass(template);
    }

    private draw(): void {
        if (!this._transform) {
            console.error("[Transform] must be not null");
            return;
        }
        else if (!this.material) {
            console.error("[Material] must be not null");
            return;
        }
        else if (!this._geometry) {
            console.error("[Geometry] must be not null");
            return;
        }
        this.material.basicUse();
        let posLocation = this.material.getAttributePosition('pos', 'basic');
        if (posLocation == -1) {
            console.log('attrib not found');
            return;
        }

        this._geometry.bindBuffers();
        gl.enableVertexAttribArray(<GLuint>posLocation);
        gl.vertexAttribPointer(<GLuint>posLocation, 3, gl.FLOAT, false, 0, 0);

        const mvpMatrix = this._transform.getMvpMatrix(this._projection, this._viewMatrix);

        let loc = this.material.getUniformPosition('matrix', 'basic');
        gl.uniformMatrix4fv(loc, false, new Float32Array(mvpMatrix));

        this._geometry.draw();

        this.material.edgeUse();
        posLocation = this.material.getAttributePosition('pos', 'edge');
        if (posLocation == -1) {
            console.log('attrib not found');
            return;
        }

        this._geometry.bindEdgeBuffers();
        gl.enableVertexAttribArray(posLocation);
        gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, false, 0, 0);

        loc = this.material.getUniformPosition('matrix', 'edge');
        gl.uniformMatrix4fv(loc, false, new Float32Array(mvpMatrix));
        this._geometry.drawEdges();
    }
}