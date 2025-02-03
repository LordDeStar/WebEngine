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

    public static async loadMTL(url: string): Promise<MaterialProperties[]> {
        try {
            const response = await fetch(url);
            const data = await response.text();

            const materials: MaterialProperties[] = []; // Массив для хранения материалов
            let currentMaterial: MaterialProperties | null = null; // Текущий материал

            const lines = data.split('\n');
            for (const line of lines) {
                // Пропускаем комментарии и пустые строки
                if (line.startsWith('#') || line.trim() === '') continue;

                const parts = line.trim().split(/\s+/);
                const keyword = parts[0];

                switch (keyword) {
                    case 'newmtl':
                        // Если текущий материал существует, добавляем его в массив
                        if (currentMaterial) {
                            materials.push(currentMaterial);
                        }
                        // Создаем новый материал
                        currentMaterial = {
                            name: parts[1],
                            Ns: 0,
                            Ka: vec4.fromValues(0, 0, 0, 1),
                            Kd: vec4.fromValues(0, 0, 0, 1),
                            Ks: vec4.fromValues(0, 0, 0, 1),
                            d: 1,
                            illum: 0
                        };
                        break;

                    case 'Ns':
                    case 'd':
                        if (currentMaterial && !isNaN(parseFloat(parts[1]))) {
                            currentMaterial[keyword] = parseFloat(parts[1]);
                        }
                        break;

                    case 'Ka':
                    case 'Kd':
                    case 'Ks':
                        if (currentMaterial && parts.length >= 4) {
                            currentMaterial[keyword] = vec4.fromValues(
                                parseFloat(parts[1]),
                                parseFloat(parts[2]),
                                parseFloat(parts[3]),
                                1
                            );
                        }
                        break;

                    case 'illum':
                        if (currentMaterial && !isNaN(parseInt(parts[1]))) {
                            currentMaterial.illum = parseInt(parts[1]);
                        }
                        break;

                    case 'map_Kd':
                    case 'map_Bump':
                    case 'map_Ks':
                        if (currentMaterial) {
                            const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
                            currentMaterial[keyword] = baseUrl + parts[1];
                        }
                        break;

                    default:
                        console.warn(`Неизвестный параметр в MTL-файле: ${keyword}`);
                        break;
                }
            }

            // Добавляем последний материал в массив, если он существует
            if (currentMaterial) {
                materials.push(currentMaterial);
            }

            return materials;
        } catch (error) {
            console.error('Ошибка загрузки MTL-файла:', error);
            throw error;
        }
    }
}
