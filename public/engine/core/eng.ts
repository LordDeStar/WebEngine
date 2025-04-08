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
class Engine {
  private _canvas: HTMLCanvasElement;
  private _viewMatrix: mat4;
  public static _light: Light;
  private _objects: GameObject[] = [];
  constructor(width: string, height: string) {
    this._canvas = GLUtilities.init();
    this._canvas.style.width = width;
    this._canvas.style.height = height;
    Engine._light = this.createLight();
    this._viewMatrix = this.createViewMatrix();
  }
  private createLight(): Light {
    const light = new Light();
    light.setDirection(0.0, 1.0, 0.0);
    return light;
  }

  public resize(): void {
    // Синхронизируем физические размеры canvas с его отображаемыми размерами
    const displayWidth = this._canvas.clientWidth;
    const displayHeight = this._canvas.clientHeight;

    if (this._canvas.width !== displayWidth || this._canvas.height !== displayHeight) {
      this._canvas.width = displayWidth;
      this._canvas.height = displayHeight;
    }

    // Обновляем viewport и матрицу проекции
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    this._objects.forEach(i => {
      let renderer = <ResizableComponent>i.GetComponent("renderer");
      if (renderer) {
        renderer.OnResize({ _projection: this.createPerspectiveMatrix(), _viewMatrix: this._viewMatrix });
      }
    });
  }

  private createPerspectiveMatrix(): mat4 {
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = this._canvas.clientWidth / this._canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return projectionMatrix;
  }

  private createViewMatrix(): mat4 {
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
    this.resize();
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

  public async fromJson(json: string): Promise<void> {
    try {
      const data = await JSON.parse(json);
      if (!Array.isArray(data.camera) || data.camera.length !== 16 || !data.camera.every((val: any) => typeof val === "number")) {
        throw new Error("Invalid camera matrix format in JSON");
      }
      const cameraMatrix = data.camera as [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];


      const objectList = Promise.all(
        data.objects.map(async (object: string) => {
          await GameObject.fromJson(object);
        })
      );

      this._viewMatrix = mat4.fromValues(...cameraMatrix);
      Engine._light = await Light.fromJson(data.light);
      console.log(data.objects);
    }
    catch {
      console.error("Error deserialize engine")
    }
  }

  public async toJson(): Promise<string> {
    try {
      // Ожидаем завершения всех асинхронных операций для объектов
      const objectsJson = await Promise.all(
        this._objects.map(async (object) => await object.toJson())
      );

      // Сериализуем данные после завершения всех операций
      return JSON.stringify({
        camera: Array.from(this._viewMatrix),
        light: await Engine._light.toJson(),
        objects: objectsJson
      });
    } catch (error) {
      console.error("Error during engine serialization:", error);
      throw error;
    }
  }
}

export {
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