export interface StateConfig<S extends string, E extends string> {
  initial: S
  transitions: Array<{
    from: S | S[]
    event: E
    to: S
    guard?: () => boolean
  }>
  onEnter?: Partial<Record<S, (state: S) => void>>
  onExit?: Partial<Record<S, (state: S) => void>>
}

export interface TransitionLog<S, E> {
  from: S
  to: S
  event: E
  timestamp: number
}

export class StateMachine<S extends string, E extends string> {
  private current: S
  private transitions: Map<string, { to: S; guard?: () => boolean }>
  private enterCallbacks: Map<S, Array<(state: S) => void>>
  private exitCallbacks: Map<S, Array<(state: S) => void>>
  private history: TransitionLog<S, E>[] = []
  private _transitionCount: number = 0

  constructor(private config: StateConfig<S, E>) {
    this.current = config.initial
    this.transitions = new Map()
    this.enterCallbacks = new Map()
    this.exitCallbacks = new Map()

    for (const t of config.transitions) {
      const fromStates = Array.isArray(t.from) ? t.from : [t.from]
      for (const from of fromStates) {
        const key = this.makeKey(from, t.event)
        this.transitions.set(key, { to: t.to, guard: t.guard })
      }
    }

    if (config.onEnter) {
      for (const [state, cb] of Object.entries(config.onEnter)) {
        if (cb) {
          const arr = this.enterCallbacks.get(state as S) ?? []
          arr.push(cb as (state: S) => void)
          this.enterCallbacks.set(state as S, arr)
        }
      }
    }

    if (config.onExit) {
      for (const [state, cb] of Object.entries(config.onExit)) {
        if (cb) {
          const arr = this.exitCallbacks.get(state as S) ?? []
          arr.push(cb as (state: S) => void)
          this.exitCallbacks.set(state as S, arr)
        }
      }
    }
  }

  private makeKey(state: S, event: E): string {
    return `${state}:${event}`
  }

  send(event: E): S {
    const key = this.makeKey(this.current, event)
    const transition = this.transitions.get(key)
    if (!transition) return this.current

    if (transition.guard && !transition.guard()) {
      return this.current
    }

    const from = this.current
    const to = transition.to

    const exitCbs = this.exitCallbacks.get(from)
    if (exitCbs) {
      for (const cb of exitCbs) cb(from)
    }

    this.current = to
    this._transitionCount++

    this.history.push({ from, to, event, timestamp: Date.now() })

    const enterCbs = this.enterCallbacks.get(to)
    if (enterCbs) {
      for (const cb of enterCbs) cb(to)
    }

    return this.current
  }

  getState(): S {
    return this.current
  }

  canSend(event: E): boolean {
    const key = this.makeKey(this.current, event)
    const transition = this.transitions.get(key)
    if (!transition) return false
    if (transition.guard) return transition.guard()
    return true
  }

  getAvailableEvents(): E[] {
    const events: E[] = []
    for (const [key, transition] of this.transitions) {
      const [state, event] = key.split(':') as [S, E]
      if (state === this.current) {
        if (transition.guard && !transition.guard()) continue
        events.push(event)
      }
    }
    return events
  }

  getHistory(): TransitionLog<S, E>[] {
    return [...this.history]
  }

  get transitionCount(): number {
    return this._transitionCount
  }

  reset(): void {
    const exitCbs = this.exitCallbacks.get(this.current)
    if (exitCbs) {
      for (const cb of exitCbs) cb(this.current)
    }
    this.current = this.config.initial
    this.history = []
    this._transitionCount = 0
  }

  isState(state: S): boolean {
    return this.current === state
  }

  isFinalState(): boolean {
    return this.transitions.size > 0 && this.getAvailableEvents().length === 0
  }
}
