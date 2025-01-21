import { TemplateGeometry } from '../objects/geometries';
import { Transform } from './../objects/transform';
import { mat4, vec4 } from 'gl-matrix';
import { Geometry } from './../objects/geometry';
import { Component, ResizableComponent } from "./component";
import { Material } from '../gl/material';
import { GameObject } from '../objects/GameObject';
import { gl } from '../gl/gl';
import { Engine } from '../eng';
import { GLUtilities } from '../gl/gl';

export class Renderer implements ResizableComponent {
    public name: string = "renderer";
    public material: Material | undefined;
    public _transform: Transform | undefined;
    public owner: GameObject | null = null;
    public textureUrl: string | undefined;
    private _projection: mat4;
    private _viewMatrix: mat4;
    private _geometry: Geometry | undefined;

    constructor(geometry: TemplateGeometry) {
        this._projection = mat4.create();
        this._viewMatrix = mat4.create();
        this.loadGeometry(geometry);
    }

    public async OnStart(): Promise<void> {
        this._transform = this.owner?.transform;
        if (!this.material) {
            const materials = await GLUtilities.loadMTL('../../../cube.mtl'); // Загрузите MTL-файл
            if (materials) {
                this.material = new Material(Engine._light, materials); // Используйте первый материал из MTL-файла
            } else {
                this.material = new Material(Engine._light, {
                    name: 'default',
                    Ns: 0,
                    Ka: vec4.fromValues(0, 0, 0, 1),
                    Kd: vec4.fromValues(1, 1, 1, 1),
                    Ks: vec4.fromValues(0, 0, 0, 1),
                    d: 1,
                    illum: 0
                });
            }
        }
    }

    public OnUpdate(): void {
        this.draw();
    }

    public BeforeRemove(): void {
        // Очистка ресурсов, если необходимо
    }

    public OnResize(args: any): void {
        this._projection = args._projection;
        this._viewMatrix = args._viewMatrix;
    }

    public loadGeometry(template: TemplateGeometry): void {
        this._geometry = Geometry.loadFromClass(template);
    }

    public loadTexture(url: string): void {
        if (this.material) {
            this.material.loadTexture(url);
        } else {
            console.error(`Material not set, cannot load texture: ${url}`);
        }
    }

    private draw(): void {
        if (!this._transform) {
            console.error("[Transform] must be not null");
            return;
        } else if (!this.material) {
            console.error("[Material] must be not null");
            return;
        } else if (!this._geometry) {
            console.error("[Geometry] must be not null");
            return;
        }

        this.material.basicUse();

        let posLocation = this.material.getAttributePosition('pos', 'basic');
        if (posLocation == -1) {
            console.log('attrib not found');
            return;
        }

        let texCoordLocation = this.material.getAttributePosition('texCoord', 'basic');
        if (texCoordLocation == -1) {
            console.log('texCoord attrib not found');
            return;
        }

        this._geometry.bindBuffers();

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

        loc = this.material.getUniformPosition('matrix', 'edge');
        gl.uniformMatrix4fv(loc, false, new Float32Array(mvpMatrix));
        this._geometry.drawEdges();
    }
}
