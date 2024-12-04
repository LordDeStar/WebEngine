import { GLUtilities, gl } from "./gl/gl";
import { GameObject } from "./objects/GameObject";
import { mat4 } from "gl-matrix";

let red = 0;
let blue = 0;
export class Engine {

  private _canvas: HTMLCanvasElement;
  private _gameObject: GameObject;
  constructor() {
    this._canvas = GLUtilities.init('main');
    this._gameObject = new GameObject();
    if (gl) {

      this.start();
    }
  }


  private resize(): void {
    if (GLUtilities.resizeCanvasToDisplaySize(this._canvas)) {
      gl.viewport(0, 0, this._canvas.width, this._canvas.height);
      this._gameObject._projection = this.createOrthoMatrix();
    }
  }

  private createOrthoMatrix(): mat4 {
    const left = 0;
    const right = window.innerWidth;
    const top = window.innerHeight;
    const bottom = 0;
    return mat4.ortho(mat4.create(), left, right, bottom, top, -1, 100);
  }
  public start(): void {
    gl.clearColor(0, 0, 0, 1);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  private loop(): void {
    gl.clear(gl.COLOR_BUFFER_BIT);
    this._gameObject.draw();
    this._gameObject.transform.rotation[1] += 0.01;
    this._gameObject.transform.rotation[0] += 0.02;

    red += 0.001;
    blue += 0.001;
    this._gameObject.material.setColor(red, 0, 0, 1);
    requestAnimationFrame(() => this.loop());
  }
}