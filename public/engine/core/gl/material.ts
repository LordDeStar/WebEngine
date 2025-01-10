import { gl } from "./gl";
import { vec4 } from "gl-matrix";
import { Shader } from "./shader";
import { Light } from "./light";
import { Component } from "../components/component";

export class Material {
  private _shader: Shader;
  private _edgeShader: Shader;
  private _color: vec4;
  private _light: Light;

  constructor(light: Light) {
    this._color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this._light = light;
    this._shader = this.loadShader();
    this._edgeShader = this.loadEdgeShader();
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
      varying vec3 vPos;
      void main(){
          gl_Position = matrix * vec4(pos, 1.0);
          vPos = vec3(matrix * vec4(pos, 1.0));
      }
    `;
    const fragment = `
        precision mediump float;
        uniform vec4 color;
        uniform vec3 lightDirection;
        uniform vec4 ambientLight;
        uniform vec4 diffuseLight;
        varying vec3 vPos;
        void main(void) {
            vec3 normal = normalize(vPos);
            vec3 lightDir = normalize(lightDirection);
            float diff = max(dot(normal, lightDir), 0.0);
            vec4 finalColor = ambientLight + diffuseLight * diff;
            gl_FragColor = finalColor * color;
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

    loc = this._shader.getUniformLocation('lightDirection');
    gl.uniform3fv(loc, this._light.direction);

    loc = this._shader.getUniformLocation('ambientLight');
    gl.uniform4fv(loc, this._light.ambient);

    loc = this._shader.getUniformLocation('diffuseLight');
    gl.uniform4fv(loc, this._light.diffuse);
  }

  public edgeUse(): void {
    this._edgeShader.use();
  }
}
