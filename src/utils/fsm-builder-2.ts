import { StateMachine2 } from './state-machine-2.js'

export class FSMBuilder2 {
  private states = new Set<string>()
  private transitions: [string, string, string][] = []
  private initial = ''
  private accepting = new Set<string>()

  setInitial(state: string): void {
    this.initial = state
    this.states.add(state)
  }

  addState(name: string, accepting = false): void {
    this.states.add(name)
    if (accepting) this.accepting.add(name)
  }

  addTransition(from: string, input: string, to: string): void {
    this.states.add(from)
    this.states.add(to)
    this.transitions.push([from, input, to])
  }

  build(): StateMachine2 {
    const sm = new StateMachine2(this.initial || [...this.states][0] || 'init')
    for (const [from, input, to] of this.transitions) {
      sm.addTransition(from, input, to)
    }
    return sm
  }

  test(input: string[]): boolean {
    let current = this.initial
    for (const symbol of input) {
      const trans = this.transitions.find(([from, inp]) => from === current && inp === symbol)
      if (!trans) return false
      current = trans[2]
    }
    return this.accepting.has(current)
  }

  get stateCount(): number { return this.states.size }
  get transitionCount(): number { return this.transitions.length }

  clear(): void {
    this.states.clear()
    this.transitions = []
    this.accepting.clear()
    this.initial = ''
  }

  toArray(): string[] { return [...this.states] }
  toString(): string { return JSON.stringify({ states: this.stateCount, transitions: this.transitionCount }) }
  toJSON(): Record<string, number> { return { states: this.stateCount, transitions: this.transitionCount } }
  clone(): FSMBuilder2 {
    const c = new FSMBuilder2()
    c.initial = this.initial
    c.states = new Set(this.states)
    c.transitions = [...this.transitions]
    c.accepting = new Set(this.accepting)
    return c
  }
  equals(other: unknown): boolean { return other instanceof FSMBuilder2 }
}
