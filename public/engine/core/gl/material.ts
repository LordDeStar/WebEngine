import { gl } from "./gl";
import { vec3, vec4 } from "gl-matrix";
import { Shader } from "./shader";

export class Material {
    private _shader: Shader;
    private _edgeShader: Shader;
    private _color: vec4;

    constructor() {
        this._shader = this.loadShader();
        this._edgeShader = this.loadEdgeShader();
        this._color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    }


    private loadEdgeShader(): Shader {
        const vertex = `
      attribute vec3 pos;
      uniform mat4 matrix;
      void main(){
        gl_Position = matrix * vec4(pos, 1.0);
      }
    `;
        const fragment = `
      precision mediump float;
      void main(void) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // черный цвет для ребер
      }
    `;

        return new Shader('edge', vertex, fragment);
    }


    private loadShader(): Shader {
        const vertex = `
      attribute vec3 pos;
      uniform mat4 matrix;
      void main(){
        gl_Position = matrix * vec4(pos, 1.0);
      }
    `;
        const fragment = `
        precision mediump float;
        uniform vec4 color;
      void main(void) {
        gl_FragColor = color;
      }
    `;

        return new Shader('basic', vertex, fragment);
    }
    public setColor(red: number, green: number, blue: number, alpha: number): void {
        this._color = vec4.fromValues(red, green, blue, alpha);
    }
    public getAttributePosition(attr: string, shaderName: string): number {
        return (shaderName != 'edge') ? this._shader.getAttributeLocation(attr) : this._edgeShader.getAttributeLocation(attr);
    }
    public getUniformPosition(uniform: string, shaderName: string): WebGLUniformLocation {

        return (shaderName != 'edge') ? this._shader.getUniformLocation(uniform) : this._edgeShader.getUniformLocation(uniform);
    }
    public basicUse(): void {
        this._shader.use();
        let loc = this._shader.getUniformLocation('color');
        gl.uniform4fv(loc, this._color);
    }
    public edgeUse(): void {
        this._edgeShader.use();
    }
}