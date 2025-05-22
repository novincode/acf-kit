// Generic Event Map for strong typing
export type EventMap = Record<string, any>;

export class EventEmitter<Events extends EventMap = any> {
  private listeners: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, callback: (payload: Events[K]) => void): void {
    (this.listeners[event] ||= []).push(callback);
  }

  off<K extends keyof Events>(event: K, callback: (payload: Events[K]) => void): void {
    const cbs = this.listeners[event];
    if (!cbs) return;
    this.listeners[event] = cbs.filter(cb => cb !== callback);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(cb => cb(payload));
  }

  once<K extends keyof Events>(event: K, callback: (payload: Events[K]) => void): void {
    const wrapper = (payload: Events[K]) => {
      callback(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}