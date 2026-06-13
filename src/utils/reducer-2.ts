export type ReducerFn2<S, A = { type: string; payload?: unknown }> = (state: S, action: A) => S

export class Reducer2<S, A = { type: string; payload?: unknown }> {
  private reducers: Map<string, ReducerFn2<S, A>> = new Map()
  private defaultHandler: ReducerFn2<S, A> | null = null
  private composedReducers: ReducerFn2<S, A>[] = []

  add(actionType: string, reducer: ReducerFn2<S, A>): this {
    this.reducers.set(actionType, reducer)
    return this
  }

  remove(actionType: string): boolean {
    return this.reducers.delete(actionType)
  }

  has(actionType: string): boolean {
    return this.reducers.has(actionType)
  }

  setDefault(reducer: ReducerFn2<S, A>): this {
    this.defaultHandler = reducer
    return this
  }

  compose(reducer: ReducerFn2<S, A>): this {
    this.composedReducers.push(reducer)
    return this
  }

  reduce(state: S, action: A): S {
    let newState = state

    const reducer = this.reducers.get((action as { type: string }).type)
    if (reducer) {
      newState = reducer(newState, action)
    } else if (this.defaultHandler) {
      newState = this.defaultHandler(newState, action)
    }

    for (const composed of this.composedReducers) {
      newState = composed(newState, action)
    }

    return newState
  }

  getActionTypes(): string[] {
    return Array.from(this.reducers.keys())
  }

  count(): number {
    return this.reducers.size
  }

  createInitialState(initial: S): S {
    return initial
  }

  static combine<S extends Record<string, unknown>>(
    reducers: { [K in keyof S]: ReducerFn2<S[K]> },
  ): ReducerFn2<S> {
    return (state: S, action: { type: string; payload?: unknown }): S => {
      const newState: Partial<S> = {}
      let changed = false

      for (const key in reducers) {
        newState[key] = reducers[key](state[key], action)
        if (newState[key] !== state[key]) changed = true
      }

      return changed ? newState as S : state
    }
  }

  toArray(): string[] { return this.getActionTypes() }
  toString(): string { return JSON.stringify({ reducers: this.count() }) }
  toJSON(): Record<string, unknown> { return { reducers: this.getActionTypes() } }
  clone(): Reducer2<S, A> {
    const r = new Reducer2<S, A>()
    this.reducers.forEach((fn, type) => r.add(type, fn))
    if (this.defaultHandler) r.setDefault(this.defaultHandler)
    return r
  }
  equals(other: unknown): boolean {
    if (!(other instanceof Reducer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.reducers.clear()
    this.defaultHandler = null
    this.composedReducers = []
  }
}
