type Transition = { to: string; action?: () => void }

export class StateMachine2 {
  private states = new Set<string>()
  private transitions = new Map<string, Map<string, Transition>>()
  private current: string
  private history: string[] = []

  constructor(initial: string) {
    this.current = initial
    this.states.add(initial)
    this.history.push(initial)
  }

  addState(name: string): void {
    this.states.add(name)
  }

  addTransition(from: string, event: string, to: string, action?: () => void): void {
    this.states.add(from)
    this.states.add(to)
    if (!this.transitions.has(from)) this.transitions.set(from, new Map())
    this.transitions.get(from)!.set(event, { to, action })
  }

  send(event: string): boolean {
    const trans = this.transitions.get(this.current)?.get(event)
    if (!trans) return false
    if (trans.action) trans.action()
    this.current = trans.to
    this.history.push(this.current)
    return true
  }

  canSend(event: string): boolean {
    return this.transitions.get(this.current)?.has(event) ?? false
  }

  get state(): string { return this.current }
  get stateHistory(): string[] { return [...this.history] }

  reset(): void {
    this.current = this.history[0]
    this.history = [this.current]
  }

  get stateCount(): number { return this.states.size }

  toArray(): string[] { return [...this.states] }
  toString(): string { return JSON.stringify({ current: this.current, states: this.stateCount }) }
  toJSON(): Record<string, unknown> { return { current: this.current, states: this.stateCount } }
  clone(): StateMachine2 {
    const c = new StateMachine2(this.history[0])
    for (const [from, events] of this.transitions)
      for (const [event, trans] of events) c.addTransition(from, event, trans.to)
    return c
  }
  equals(other: unknown): boolean { return other instanceof StateMachine2 }
}
