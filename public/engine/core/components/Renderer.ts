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
    public color: number[];
    public _transform: Transform | undefined;
    public owner: GameObject | null = null;
    public textureUrl: string | undefined;
    private _projection: mat4;
    private _viewMatrix: mat4;
    private _geometry: Geometry | undefined;
    public isDrawingEdges: boolean;
    private _isMaterialLoaded: boolean;
    private _materialUrl: string;
    public geometryUrl: string | undefined;
    public allowedToStart = true;
    public subname: string = 'renderer';

    constructor(geometryUrl: string, materialUrl: string, isDrawingEdges: boolean = false, textureUrl: string | undefined = undefined, color: number[]) {
        this._projection = mat4.create();
        this._viewMatrix = mat4.create();
        this.isDrawingEdges = isDrawingEdges;
        this.loadFromUrl(geometryUrl);
        this._isMaterialLoaded = false;
        this._materialUrl = materialUrl;
        this.color = color;
        this.textureUrl = textureUrl;


    }

    public async OnStart(): Promise<void> {
        this._transform = this.owner?.transform;
        if (!this.material) {
            const materials = await GLUtilities.loadMTL(this._materialUrl);
            if (materials) {
                this.material = new Material(Engine._light, materials);
            } else {
                this.material = new Material(Engine._light, [{
                    name: 'default',
                    Ns: 0,
                    Ka: vec4.fromValues(0, 0, 0, 1),
                    Kd: vec4.fromValues(1, 1, 1, 1),
                    Ks: vec4.fromValues(0, 0, 0, 1),
                    d: 1,
                    illum: 0
                }]);
            }
            this.material.setCurrentMaterial(0);
            this._isMaterialLoaded = true;
            this.setColor(this.color[0], this.color[1], this.color[2], this.color[3]);

            if (this.textureUrl) {
                this.loadTexture(this.textureUrl);
            }
        }
    }

    public OnUpdate(): void {
        this.draw();
    }

    public BeforeRemove(): void {
    }
    public setColor(r: number, g: number, b: number, a: number): void {
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;
        this.color[3] = a;
        this.material?.setColor(r, g, b, a);
    }
    public OnResize(args: any): void {
        this._projection = args._projection;
        this._viewMatrix = args._viewMatrix;
    }
    public async loadFromUrl(url: string) {
        const geometry = await TemplateGeometry.loadFromOBJ(url);
        this.geometryUrl = url;
        this.loadGeometry(geometry);
    }
    public loadGeometry(template: TemplateGeometry): void {
        this._geometry = Geometry.loadFromClass(template);
    }
    public async loadTexture(url: string): Promise<void> {
        this.textureUrl = url;
        await this.material?.loadTexture(url, this.material?.getCurrentMaterialIndex());
    }

    public toJson(): Promise<string> {
        return new Promise<string>(async resolve => {
            resolve(JSON.stringify({
                name: this.name,
                color: Array.from(this.color),
                materialUrl: this._materialUrl,
                geometryUrl: this.geometryUrl,
                textureUrl: this.textureUrl
            }))
        })
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
        if (this.isDrawingEdges) {
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
}
