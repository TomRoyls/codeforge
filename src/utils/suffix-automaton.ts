interface SAMState {
  length: number
  link: number
  next: Map<string, number>
}

export class SuffixAutomaton {
  private states: SAMState[]
  private size_: number
  private last: number
  private inputLength: number

  constructor(input?: string) {
    this.states = []
    this.size_ = 0
    this.last = 0
    this.inputLength = 0

    this.states.push({ length: 0, link: -1, next: new Map() })
    this.size_ = 1

    if (input !== undefined) {
      for (const ch of input) {
        this.extend(ch)
      }
    }
  }

  extend(ch: string): void {
    const cur = this.size_++
    this.states.push({ length: this.states[this.last]!.length + 1, link: 0, next: new Map() })

    let p = this.last
    while (p !== -1 && !this.states[p]!.next.has(ch)) {
      this.states[p]!.next.set(ch, cur)
      p = this.states[p]!.link
    }

    if (p === -1) {
      this.states[cur]!.link = 0
    } else {
      const q = this.states[p]!.next.get(ch)!
      if (this.states[p]!.length + 1 === this.states[q]!.length) {
        this.states[cur]!.link = q
      } else {
        const clone = this.size_++
        this.states.push({
          length: this.states[p]!.length + 1,
          link: this.states[q]!.link,
          next: new Map(this.states[q]!.next),
        })

        while (p !== -1 && this.states[p]!.next.get(ch) === q) {
          this.states[p]!.next.set(ch, clone)
          p = this.states[p]!.link
        }

        this.states[q]!.link = clone
        this.states[cur]!.link = clone
      }
    }

    this.last = cur
    this.inputLength++
  }

  contains(substring: string): boolean {
    if (substring.length === 0) return true
    let current = 0
    for (const ch of substring) {
      const next = this.states[current]!.next.get(ch)
      if (next === undefined) return false
      current = next
    }
    return true
  }

  countOccurrences(substring: string): number {
    if (substring.length === 0) return this.inputLength + 1

    let current = 0
    for (const ch of substring) {
      const next = this.states[current]!.next.get(ch)
      if (next === undefined) return 0
      current = next
    }

    const dp = new Int32Array(this.size_).fill(0)
    dp[current] = 1

    const order = this.topologicalOrder()
    for (let i = order.length - 1; i >= 0; i--) {
      const v = order[i]!
      if (dp[v] === 0 && v !== current) continue
      const link = this.states[v]!.link
      if (link !== -1) {
        dp[link]! += dp[v]!
      }
    }

    return dp[0] ?? 0
  }

  longestCommonSubstring(other: string): string {
    let current = 0
    let len = 0
    let best = 0
    let bestEnd = 0

    for (let i = 0; i < other.length; i++) {
      const ch = other[i]!
      while (current !== 0 && !this.states[current]!.next.has(ch)) {
        current = this.states[current]!.link
        len = this.states[current]!.length
      }
      if (this.states[current]!.next.has(ch)) {
        current = this.states[current]!.next.get(ch)!
        len++
      } else {
        len = 0
      }
      if (len > best) {
        best = len
        bestEnd = i + 1
      }
    }

    return other.slice(bestEnd - best, bestEnd)
  }

  distinctSubstringCount(): number {
    let count = 0
    for (let i = 1; i < this.size_; i++) {
      count += this.states[i]!.length - this.states[this.states[i]!.link]!.length
    }
    return count
  }

  totalSubstrings(): number {
    return this.distinctSubstringCount()
  }

  longestSubstring(): number {
    return this.inputLength
  }

  private topologicalOrder(): number[] {
    const order: number[] = []
    const visited = new Uint8Array(this.size_)
    const stack: number[] = [0]

    while (stack.length > 0) {
      const v = stack.pop()!
      if (visited[v]) continue
      visited[v] = 1
      order.push(v)
      for (const [, next] of this.states[v]!.next) {
        if (!visited[next]) {
          stack.push(next)
        }
      }
    }

    return order
  }

  get size(): number {
    return this.size_
  }

  get length(): number {
    return this.inputLength
  }

  getState(index: number): { length: number; link: number; transitions: number } | undefined {
    if (index < 0 || index >= this.size_) return undefined
    const s = this.states[index]!
    return { length: s.length, link: s.link, transitions: s.next.size }
  }

  static fromString(input: string): SuffixAutomaton {
    return new SuffixAutomaton(input)
  }
}
