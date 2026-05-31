export class SuffixAutomatonLight {
  private transitions: Map<string, number>[] = []
  private link: number[] = []
  private length: number[] = []
  private last = 0
  private size = 1

  constructor() {
    this.transitions.push(new Map())
    this.link.push(-1)
    this.length.push(0)
  }

  extend(c: string): void {
    const p = this.last
    const curr = this.size++
    this.transitions.push(new Map())
    this.link.push(0)
    this.length.push(this.length[p]! + 1)

    let q: number | undefined
    let temp: number = p
    while (temp >= 0 && !this.transitions[temp]!.has(c)) {
      this.transitions[temp]!.set(c, curr)
      temp = this.link[temp]!
    }

    if (temp === -1) {
      this.link[curr] = 0
    } else {
      q = this.transitions[temp]!.get(c)!
      if (this.length[temp]! + 1 === this.length[q]!) {
        this.link[curr] = q
      } else {
        const clone = this.size++
        this.transitions.push(new Map(this.transitions[q]!))
        this.link.push(this.link[q]!)
        this.length.push(this.length[temp]! + 1)
        while (temp >= 0 && this.transitions[temp]!.get(c) === q) {
          this.transitions[temp]!.set(c, clone)
          temp = this.link[temp]!
        }
        this.link[q] = clone
        this.link[curr] = clone
      }
    }
    this.last = curr
  }

  build(s: string): void {
    for (const c of s) this.extend(c)
  }

  contains(sub: string): boolean {
    let state = 0
    for (const c of sub) {
      if (!this.transitions[state]!.has(c)) return false
      state = this.transitions[state]!.get(c)!
    }
    return true
  }

  longestCommonSubstring(other: string): number {
    let state = 0
    let l = 0
    let best = 0
    for (const c of other) {
      while (state > 0 && !this.transitions[state]!.has(c)) {
        state = this.link[state]!
        l = this.length[state]!
      }
      if (this.transitions[state]!.has(c)) {
        state = this.transitions[state]!.get(c)!
        l++
      } else {
        l = 0
      }
      best = Math.max(best, l)
    }
    return best
  }

  countDistinctSubstrings(): number {
    let count = 0
    for (let i = 1; i < this.size; i++) {
      count += this.length[i]! - this.length[this.link[i]!]!
    }
    return count
  }

  get stateCount(): number {
    return this.size
  }
}
