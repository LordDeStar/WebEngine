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
  constructor() {
    this._canvas = GLUtilities.init('main');
    Engine._light = this.createLight();
    this._viewMatrix = this.createViewMatrix();
  }
  private createLight(): Light {
    const light = new Light();
    light.setDirection(0.0, 1.0, 0.0);
    return light;
  }

  private resize(): void {
    if (GLUtilities.resizeCanvasToDisplaySize(this._canvas)) {
      gl.viewport(0, 0, this._canvas.width, this._canvas.height);
      this._objects.forEach(i => {
        let renderer = <ResizableComponent>i.GetComponent("renderer");
        if (renderer) {
          renderer.OnResize({ _projection: this.createPerspectiveMatrix(), _viewMatrix: this._viewMatrix });
        }
      });
    }
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

  public start(): void {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this._objects.forEach(i => {
      i.components.forEach(j => {
        j.OnStart();
      })
    });

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
  AnimationClip,
  Animator,
  Engine,
  GameObject,
  Material,
  Renderer,
  Component,
  ResizableComponent,
  Transform,
  Cube,
  Sphere,
  TemplateGeometry,
  Script,
  GLUtilities
}