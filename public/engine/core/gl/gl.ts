import { vec4 } from "gl-matrix";
import { MaterialProperties } from "./material";
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

    public static async loadMTL(url: string): Promise<MaterialProperties> {
        try {
            const response = await fetch(url);
            const data = await response.text();

            const materials: MaterialProperties[] = [];
            let currentMaterial: MaterialProperties | null = null;

            const lines = data.split('\n');
            lines.forEach(line => {
                const parts = line.trim().split(' ');
                if (parts[0] === 'newmtl') {
                    if (currentMaterial) {
                        materials.push(currentMaterial);
                    }
                    currentMaterial = {
                        name: parts[1],
                        Ns: 0,
                        Ka: vec4.fromValues(0, 0, 0, 1),
                        Kd: vec4.fromValues(0, 0, 0, 1),
                        Ks: vec4.fromValues(0, 0, 0, 1),
                        d: 1,
                        illum: 0
                    };
                } else if (parts[0] === 'Ns') {
                    currentMaterial!.Ns = parseFloat(parts[1]);
                } else if (parts[0] === 'Ka') {
                    currentMaterial!.Ka = vec4.fromValues(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 1);
                } else if (parts[0] === 'Kd') {
                    currentMaterial!.Kd = vec4.fromValues(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 1);
                } else if (parts[0] === 'Ks') {
                    currentMaterial!.Ks = vec4.fromValues(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 1);
                } else if (parts[0] === 'd') {
                    currentMaterial!.d = parseFloat(parts[1]);
                } else if (parts[0] === 'illum') {
                    currentMaterial!.illum = parseInt(parts[1]);
                } else if (parts[0] === 'map_Kd') {
                    currentMaterial!.map_Kd = parts[1];
                }
            });

            if (currentMaterial) {
                materials.push(currentMaterial);
            }

            console.log(materials[0]);
            return materials[0];
        } catch (error) {
            console.error('Ошибка загрузки MTL-файла:', error);
            throw error;
        }
    }
}
