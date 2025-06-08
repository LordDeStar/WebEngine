import { EventEmitter } from "./emitter";

export class KeyboardManager {
    private emitter: EventEmitter;

    constructor(emitter: EventEmitter) {
        this.emitter = emitter;
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.emitter.emit({
            type: "keydown",
            data: { key: event.key, keyCode: event.keyCode }
        });
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.emitter.emit({
            type: "keyup",
            data: { key: event.key, keyCode: event.keyCode }
        });
    }
}