import { KeyboardManager } from './event-system/keyboard-manager';
import { Script } from './components/Script';
import { GLUtilities, gl } from "./gl/gl";
import { GameObject } from "./objects/GameObject";
import { mat4, vec3, vec4 } from "gl-matrix";
import { Light } from "./gl/light";
import { Component, ResizableComponent } from "./components/component";
import { Material } from "./gl/material";
import { Renderer } from "./components/Renderer";
import { Transform } from "./objects/transform";
import { Cube, Sphere, TemplateGeometry } from "./objects/geometries";
import { AnimationClip, Animator } from "./components/Animator";
import { Camera } from './components/Camera';
import { EventEmitter } from './event-system/emitter';
import { MouseManager } from './event-system/mouse-manager';
class Engine {
  public static canvas: HTMLCanvasElement | undefined;
  public static viewMatrix: mat4 | undefined;
  public static _light: Light;
  private _objects: GameObject[] = [];
  private _color: string | null = null;
  public isInited: boolean
  public static eventEmitter: EventEmitter;
  private keyboardManager: KeyboardManager | undefined;
  private mouseManager: MouseManager | undefined;
  constructor(width: string, height: string) {
    this.isInited = false
    Engine.eventEmitter = new EventEmitter();
  }

  public init(id: string, theme: string): void {
    Engine.canvas = GLUtilities.init(id);
    this._color = theme;
    Engine._light = this.createLight();
    Engine.viewMatrix = Engine.createViewMatrix();
    this.keyboardManager = new KeyboardManager(Engine.eventEmitter);
    this.mouseManager = new MouseManager(Engine.eventEmitter);
    this.isInited = true;
  }

  private createLight(): Light {
    const light = new Light();
    light.setDirection(0.0, 1.0, 0.0);
    return light;
  }

  public resize(): void {
    if (!Engine.canvas) {
      return;
    }
    // Синхронизируем физические размеры canvas с его отображаемыми размерами
    const displayWidth = Engine.canvas?.clientWidth;
    const displayHeight = Engine.canvas?.clientHeight;

    if (Engine.canvas.width !== displayWidth || Engine.canvas.height !== displayHeight) {
      Engine.canvas.width = displayWidth;
      Engine.canvas.height = displayHeight;
    }

    // Обновляем viewport и матрицу проекции
    gl.viewport(0, 0, Engine.canvas.width, Engine.canvas.height);
    this._objects.forEach(i => {
      let renderer = <ResizableComponent | undefined>i.GetComponent("renderer");
      if (renderer) {
        renderer.OnResize({ _projection: Engine.createPerspectiveMatrix(), _viewMatrix: Engine.viewMatrix });
      }
    });
  }

  public static createPerspectiveMatrix(): mat4 {
    const projectionMatrix = mat4.create();
    if (!Engine.canvas) {
      return projectionMatrix;
    }
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = Engine.canvas.clientWidth / Engine.canvas.clientHeight;
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

  public async start(theme: string): Promise<void> {
    this._color = theme;
    if (this._color && this._color == "light") {
      gl.clearColor(1, 1, 1, 1);
    }
    else {
      gl.clearColor(0, 0, 0, 1);
    }
    gl.enable(gl.DEPTH_TEST);

    window.addEventListener('resize', () => this.resize());

    await Promise.all(
      this._objects.map(obj =>
        Promise.all(obj.components.map(async component => {
          return await component.OnStart();
        }))
      )
    );

    this.resize();
    this.loop();
  }

  public loop(): void {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this._objects.forEach(i => {
      i.components.forEach(j => {
        j.OnUpdate();
      })
    });
    requestAnimationFrame(() => this.loop());
  }

  public async saveToJson(): Promise<string> {
    if (!Engine.viewMatrix) throw new Error("Camera must be initialized!");
    if (!Engine._light) throw new Error("Light must be initialized!");
    const objects = await Promise.all(
      this._objects.map(async (object) => {
        return await object.toJson();
      })
    )
    return JSON.stringify({
      camera: Array.from(Engine.viewMatrix),
      light: Engine._light.toJson(),
      objects: objects,
    })
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