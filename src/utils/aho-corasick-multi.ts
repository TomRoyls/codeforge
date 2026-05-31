export class AhoCorasickMulti {
  private goto: Map<string, number>[] = []
  private fail: number[] = []
  private output: Set<number>[][] = []
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
}
