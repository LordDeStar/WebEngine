import { mat4 } from "gl-matrix";

export let gl: WebGLRenderingContext;
export class GLUtilities {
    public static init(elementId?: string): HTMLCanvasElement {
        let canvas: HTMLCanvasElement;
        if (elementId) {
            canvas = <HTMLCanvasElement>document.getElementById(elementId);
            if (canvas === undefined) {
                throw new Error(`Cannot find a canvas with id=[${elementId}]`)
            }
        }
        else {
            canvas = <HTMLCanvasElement>document.createElement('canvas');
            document.body.appendChild(canvas);
        }

        gl = <WebGLRenderingContext>canvas.getContext('webgl');

        if (gl === null) {
            throw new Error('Unable to init webgl');
        }
        return canvas
    }

    public static resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            return true;
        }
        return false;
    }
}
