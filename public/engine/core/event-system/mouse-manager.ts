import { EventEmitter } from "./emitter";
import { Engine } from "../eng";
import { vec4, mat4 } from "gl-matrix";

export class MouseManager {
    private emitter: EventEmitter;

    constructor(emitter: EventEmitter) {
        this.emitter = emitter;
        Engine.canvas?.addEventListener('mousedown', this.handleMouseDown.bind(this));
        Engine.canvas?.addEventListener('mouseup', this.handleMouseUp.bind(this));
        Engine.canvas?.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    private screenToWorld(x: number, y: number, canvasWidth: number, canvasHeight: number): { worldX: number, worldY: number, worldZ: number } {
        // 1. Переводим координаты экрана в нормализованные координаты устройства (NDC)
        const ndcX = (x / canvasWidth) * 2 - 1; // От -1 до 1 по оси X
        const ndcY = 1 - (y / canvasHeight) * 2; // От -1 до 1 по оси Y (инвертируем Y)

        // 2. Создаем вектор в клиповом пространстве (clip space)
        const clipSpace = vec4.fromValues(ndcX, ndcY, -1, 1); // Z = -1 (ближняя плоскость), W = 1

        // 3. Получаем обратную матрицу проекции и матрицу вида
        if (!Engine.viewMatrix) throw new Error("View matrix is not initialized!");
        const projectionMatrix = Engine.createPerspectiveMatrix(); // Матрица проекции
        const inverseProjectionMatrix = mat4.create();
        const inverseViewMatrix = mat4.create();
        mat4.invert(inverseProjectionMatrix, projectionMatrix);
        mat4.invert(inverseViewMatrix, Engine.viewMatrix);

        // 4. Преобразуем вектор из клипового пространства в мировое пространство
        const viewSpace = vec4.create();
        const worldSpace = vec4.create();

        // Применяем обратную матрицу проекции
        vec4.transformMat4(viewSpace, clipSpace, inverseProjectionMatrix);

        // Применяем обратную матрицу вида
        vec4.transformMat4(worldSpace, viewSpace, inverseViewMatrix);

        // 5. Нормализуем вектор (делим на W)
        const worldX = worldSpace[0] / worldSpace[3] + 0.08;
        const worldY = worldSpace[1] / worldSpace[3] + 0.026;
        const worldZ = worldSpace[2] / worldSpace[3];

        return { worldX, worldY, worldZ };
    }

    public handleMouseDown(event: MouseEvent): void {
        if (!Engine.canvas) throw new Error('Before create manager you must init the game engine!');
        const { worldX, worldY } = this.screenToWorld(event.clientX, event.clientY, Engine.canvas.clientWidth, Engine.canvas.clientHeight);
        this.emitter.emit({
            type: "mousedown",
            data: {
                x: worldX,
                y: worldY,
                button: event.button
            }
        });
    }

    public handleMouseUp(event: MouseEvent): void {
        if (!Engine.canvas) throw new Error('Before create manager you must init the game engine!');
        const { worldX, worldY } = this.screenToWorld(event.clientX, event.clientY, Engine.canvas.clientWidth, Engine.canvas.clientHeight);
        this.emitter.emit({
            type: "mousedown",
            data: {
                x: worldX,
                y: worldY,
                button: event.button
            }
        });
    }

    public handleMouseMove(event: MouseEvent): void {
        if (!Engine.canvas) throw new Error('Before create manager you must init the game engine!');
        const { worldX, worldY } = this.screenToWorld(event.clientX, event.clientY, Engine.canvas.clientWidth, Engine.canvas.clientHeight);
        this.emitter.emit({
            type: 'mousemove',
            data: {
                x: worldX,
                y: worldY
            }
        })
    }
}