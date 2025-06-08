import type { Event } from "./event"

export class EventEmitter {
    private listeners: Map<string, Array<(event: Event) => void>>;

    constructor() {
        this.listeners = new Map();
    }

    public on(eventType: string, callback: (event: Event) => void): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)?.push(callback);
    }

    public off(eventType: string, callback: (event: Event) => void): void {
        if (!this.listeners.has(eventType)) {
            throw new Error("Такого события не существует!");
        }

        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            this.listeners.set(
                eventType,
                callbacks.filter(cb => cb != callback)
            );
        }
    }

    public emit(event: Event) {
        const callbacks = this.listeners.get(event.type);
        if (callbacks) {
            callbacks.forEach(callback => callback(event));
        }
    }
} 