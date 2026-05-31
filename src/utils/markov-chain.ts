export class MarkovChain<T> {
  private transitions: Map<T, Map<T, number>> = new Map()
  private totals: Map<T, number> = new Map()

  addTransition(from: T, to: T): void {
    if (!this.transitions.has(from)) this.transitions.set(from, new Map())
    const row = this.transitions.get(from)!
    row.set(to, (row.get(to) ?? 0) + 1)
    this.totals.set(from, (this.totals.get(from) ?? 0) + 1)
  }

  train(sequence: T[]): void {
    for (let i = 0; i < sequence.length - 1; i++) {
      this.addTransition(sequence[i]!, sequence[i + 1]!)
    }
  }

  next(state: T, rng: () => number = Math.random): T | null {
    const row = this.transitions.get(state)
    if (!row || this.totals.get(state) === 0) return null
    const total = this.totals.get(state)!
    let r = rng() * total
    for (const [next, count] of row) {
      r -= count
      if (r <= 0) return next
    }
    return row.keys().next().value ?? null
  }

  generate(start: T, length: number, rng: () => number = Math.random): T[] {
    const result: T[] = [start]
    let current = start
    for (let i = 1; i < length; i++) {
      const next = this.next(current, rng)
      if (next === null) break
      result.push(next)
      current = next
    }
    return result
  }

  getTransitionProbability(from: T, to: T): number {
    const row = this.transitions.get(from)
    if (!row) return 0
    const total = this.totals.get(from) ?? 1
    return (row.get(to) ?? 0) / total
  }

  getStates(): T[] {
    return [...this.transitions.keys()]
  }

  getTransitionsFrom(state: T): Map<T, number> {
    return new Map(this.transitions.get(state) ?? new Map())
  }
}
