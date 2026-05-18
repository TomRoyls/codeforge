export type Subscriber<T> = (event: T) => void

export interface EventEmitterOptions {
  maxListeners: number
}

const DEFAULT_MAX_LISTENERS = 50

export class TypedEventEmitter<Events extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof Events, Set<Subscriber<unknown>>>()
  private readonly maxListeners: number
  private totalEmitted: number = 0

  constructor(options: Partial<EventEmitterOptions> = {}) {
    this.maxListeners = options.maxListeners ?? DEFAULT_MAX_LISTENERS
  }

  public on<K extends keyof Events>(event: K, listener: Subscriber<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const set = this.listeners.get(event)!
    if (set.size >= this.maxListeners) {
      throw new Error(`Max listeners (${this.maxListeners}) exceeded for event "${String(event)}"`)
    }
    set.add(listener as Subscriber<unknown>)
    return () => this.off(event, listener)
  }

  public once<K extends keyof Events>(event: K, listener: Subscriber<Events[K]>): () => void {
    const unsubscribe = this.on(event, ((data: Events[K]) => {
      unsubscribe()
      listener(data)
    }) as Subscriber<Events[K]>)
    return unsubscribe
  }

  public off<K extends keyof Events>(event: K, listener: Subscriber<Events[K]>): void {
    const set = this.listeners.get(event)
    if (set) {
      set.delete(listener as Subscriber<unknown>)
      if (set.size === 0) this.listeners.delete(event)
    }
  }

  public emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.totalEmitted++
    const set = this.listeners.get(event)
    if (set) {
      for (const listener of set) {
        listener(data)
      }
    }
  }

  public listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners.get(event)?.size ?? 0
  }

  public removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event !== undefined) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  public getStats(): { events: number; totalListeners: number; totalEmitted: number } {
    let totalListeners = 0
    this.listeners.forEach((set) => { totalListeners += set.size })
    return {
      events: this.listeners.size,
      totalListeners,
      totalEmitted: this.totalEmitted,
    }
  }
}
