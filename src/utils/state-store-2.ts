export type Listener2<T> = (state: T, prevState: T) => void
export type Unsubscribe2 = () => void

export class StateStore2<T> {
  private state: T
  private listeners: Listener2<T>[] = []
  private middleware: ((state: T, action: { type: string; payload?: unknown }) => T)[] = []

  constructor(initialState: T) {
    this.state = initialState
  }

  getState(): T {
    return this.state
  }

  setState(updater: T | ((prev: T) => T)): void {
    const prevState = this.state
    const newState = typeof updater === 'function'
      ? (updater as (prev: T) => T)(prevState)
      : updater

    if (newState === prevState) return

    this.state = newState
    for (const listener of this.listeners) {
      listener(this.state, prevState)
    }
  }

  subscribe(listener: Listener2<T>): Unsubscribe2 {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx !== -1) this.listeners.splice(idx, 1)
    }
  }

  use(middleware: (state: T, action: { type: string; payload?: unknown }) => T): this {
    this.middleware.push(middleware)
    return this
  }

  dispatch(action: { type: string; payload?: unknown }): void {
    let state = this.state
    for (const mw of this.middleware) {
      state = mw(state, action)
    }
    if (state !== this.state) {
      this.setState(state)
    }
  }

  select<R>(selector: (state: T) => R): R {
    return selector(this.state)
  }

  subscribeToSelector<R>(
    selector: (state: T) => R,
    listener: (value: R, prevValue: R) => void,
  ): Unsubscribe2 {
    let prevValue = selector(this.state)
    return this.subscribe((state) => {
      const newValue = selector(state)
      if (newValue !== prevValue) {
        listener(newValue, prevValue)
        prevValue = newValue
      }
    })
  }

  getListenerCount(): number {
    return this.listeners.length
  }

  reset(state: T): void {
    this.state = state
    for (const listener of this.listeners) {
      listener(this.state, this.state)
    }
  }

  destroy(): void {
    this.listeners = []
    this.middleware = []
  }

  toArray(): Listener2<T>[] { return [...this.listeners] }
  toString(): string { return JSON.stringify({ listeners: this.getListenerCount() }) }
  toJSON(): Record<string, unknown> { return { listeners: this.getListenerCount(), middleware: this.middleware.length } }
  clone(): StateStore2<T> {
    const store = new StateStore2<T>(this.state)
    this.middleware.forEach(mw => store.use(mw))
    return store
  }
  equals(other: unknown): boolean {
    if (!(other instanceof StateStore2)) return false
    return this.getListenerCount() === other.getListenerCount()
  }
  clear(): void { this.destroy(); this.state = {} as T }
}
