import { Script } from './components/Script';
import { GLUtilities, gl } from "./gl/gl";
import { GameObject } from "./objects/GameObject";
import { mat4, vec3 } from "gl-matrix";
import { Light } from "./gl/light";
import { Component, ResizableComponent } from "./components/component";
import { Material } from "./gl/material";
import { Renderer } from "./components/Renderer";
import { Transform } from "./objects/transform";
import { Cube, Sphere, TemplateGeometry } from "./objects/geometries";
import { AnimationClip, Animator } from "./components/Animator";
import { Camera } from './components/Camera';
class Engine {
  private _canvas: HTMLCanvasElement | undefined;
  public static viewMatrix: mat4 | undefined;
  public static _light: Light;
  private _objects: GameObject[] = [];
  public isInited: boolean
  public static mousePosition: vec3;
  constructor(width: string, height: string) {
    this.isInited = false
  }

  public init(id: string): void {
    this._canvas = GLUtilities.init(id);

    Engine._light = this.createLight();
    Engine.viewMatrix = Engine.createViewMatrix();
    this._canvas.addEventListener('mousemove', (e: MouseEvent) => {
      Engine.mousePosition = 
    })
    this.isInited = true;
  }

  private getMousePos(event: MouseEvent): vec3 {
    const rect = this._canvas?.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;    // Соотношение ширины канваса и его CSS-размера
    const scaleY = this.canvas.height / rect.height;  // Соотношение высоты канваса и его CSS-размера

    const x = (event.clientX - rect.left) * scaleX;
    const y = (this.canvas.height - (event.clientY - rect.top) * scaleY); // Инвертируем Y-координату
    const z = 0; // Предполагаем, что Z-координата равна 0 (плоскость экрана)

    return vec3.fromValues(x, y, z);
  }


  private createLight(): Light {
    const light = new Light();
    light.setDirection(0.0, 1.0, 0.0);
    return light;
  }

  public resize(): void {
    if (!this._canvas) {
      return;
    }
    // Синхронизируем физические размеры canvas с его отображаемыми размерами
    const displayWidth = this._canvas?.clientWidth;
    const displayHeight = this._canvas?.clientHeight;

    if (this._canvas.width !== displayWidth || this._canvas.height !== displayHeight) {
      this._canvas.width = displayWidth;
      this._canvas.height = displayHeight;
    }

    // Обновляем viewport и матрицу проекции
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    this._objects.forEach(i => {
      let renderer = <ResizableComponent | undefined>i.GetComponent("renderer");
      if (renderer) {
        renderer.OnResize({ _projection: this.createPerspectiveMatrix(), _viewMatrix: Engine.viewMatrix });
      }
    });
  }

  private createPerspectiveMatrix(): mat4 {
    const projectionMatrix = mat4.create();
    if (!this._canvas) {
      return projectionMatrix;
    }
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = this._canvas.clientWidth / this._canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return projectionMatrix;
  }

  public static createViewMatrix(): mat4 {
    const viewMatrix = mat4.create();
    const eye = vec3.fromValues(0, 0, 3);
    const center = vec3.fromValues(0, 0, 5);
    const up = vec3.fromValues(0, 1, 0);
    mat4.lookAt(viewMatrix, eye, center, up);
    return viewMatrix;
  }

  public async start(): Promise<void> {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    window.addEventListener('resize', () => this.resize());

    await Promise.all(
      this._objects.map(obj =>
        Promise.all(obj.components.map(async component => {
          if (typeof component.OnStart === 'function') {
            await component.OnStart();
          }
        }))
      )
    );

    this.resize();

    this.loop();
  }

  private loop(): void {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this._objects.forEach(i => {
      i.components.forEach(j => {
        j.OnUpdate();
      })
    });
    requestAnimationFrame(() => this.loop());
  }

}

export {
  Camera,
  AnimationClip,
  Animator,
  Engine,
  GameObject,
  Material,
  Renderer,
  Transform,
  Cube,
  Sphere,
  TemplateGeometry,
  Script,
  GLUtilities
}

const SDK = {
  Camera,
  AnimationClip,
  Animator,
  Engine,
  GameObject,
  Material,
  Renderer,
  Transform,
  Cube,
  Sphere,
  TemplateGeometry,
  Script,
  GLUtilities
}

export default SDK;
export type {
  Component,
  ResizableComponent,
}