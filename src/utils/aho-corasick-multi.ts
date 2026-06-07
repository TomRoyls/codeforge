export class AhoCorasickMulti {
  private goto: Map<string, number>[] = []
  private fail: number[] = []
  private output: number[][] = []
  private stateCount = 1

  constructor(patterns: string[]) {
    this.goto.push(new Map())
    this.fail.push(0)
    this.output.push([])
    for (let i = 0; i < patterns.length; i++) {
      this.addPattern(patterns[i]!, i)
    }
    this.buildFail()
  }

  private addPattern(pattern: string, id: number): void {
    let state = 0
    for (const c of pattern) {
      if (!this.goto[state]!.has(c)) {
        const newState = this.stateCount++
        this.goto.push(new Map())
        this.fail.push(0)
        this.output.push([])
        this.goto[state]!.set(c, newState)
      }
      state = this.goto[state]!.get(c)!
    }
    this.output[state]!.push(id)
  }

  private buildFail(): void {
    const queue: number[] = []
    for (const [_, nextState] of this.goto[0]!) {
      this.fail[nextState] = 0
      queue.push(nextState)
    }
    while (queue.length > 0) {
      const state = queue.shift()!
      for (const [c, nextState] of this.goto[state]!) {
        let f = this.fail[state]!
        while (f > 0 && !this.goto[f]!.has(c)) {
          f = this.fail[f]!
        }
        if (this.goto[f]!.has(c) && this.goto[f]!.get(c) !== nextState) {
          this.fail[nextState] = this.goto[f]!.get(c)!
        } else {
          this.fail[nextState] = 0
        }
        this.output[nextState] = [...this.output[nextState]!, ...this.output[this.fail[nextState]!]!]
        queue.push(nextState)
      }
    }
  }

  search(text: string): Map<number, number[]> {
    const result = new Map<number, number[]>()
    let state = 0
    for (let i = 0; i < text.length; i++) {
      const c = text[i]!
      while (state > 0 && !this.goto[state]!.has(c)) {
        state = this.fail[state]!
      }
      if (this.goto[state]!.has(c)) {
        state = this.goto[state]!.get(c)!
      }
      for (const id of this.output[state]!) {
        if (!result.has(id)) result.set(id, [])
        result.get(id)!.push(i)
      }
    }
    return result
  }

  toString(): string {
    return `AhoCorasickMulti(states=${this.stateCount})`
  }

  toJSON(): unknown {
    return {
      stateCount: this.stateCount,
      goto: this.goto.map(m => [...m.entries()]),
      fail: this.fail,
      output: this.output,
    }
  }

  clone(): this {
    const c = Object.create(AhoCorasickMulti.prototype) as AhoCorasickMulti
    ;(c as unknown as { goto: Map<string, number>[] }).goto = this.goto.map(m => new Map(m))
    ;(c as unknown as { fail: number[] }).fail = [...this.fail]
    ;(c as unknown as { output: number[][] }).output = this.output.map(o => [...o])
    ;(c as unknown as { stateCount: number }).stateCount = this.stateCount
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AhoCorasickMulti)) return false
    if (this.stateCount !== other.stateCount) return false
    if (this.fail.length !== other.fail.length) return false
    for (let i = 0; i < this.fail.length; i++) {
      if (this.fail[i] !== other.fail[i]) return false
    }
    if (this.goto.length !== other.goto.length) return false
    for (let i = 0; i < this.goto.length; i++) {
      const a = this.goto[i]!
      const b = other.goto[i]!
      if (a.size !== b.size) return false
      for (const [k, v] of a) {
        if (b.get(k) !== v) return false
      }
    }
    if (this.output.length !== other.output.length) return false
    for (let i = 0; i < this.output.length; i++) {
      const a = this.output[i]!
      const b = other.output[i]!
      if (a.length !== b.length) return false
      for (let j = 0; j < a.length; j++) {
        if (a[j] !== b[j]) return false
      }
    }
    return true
  }
}
