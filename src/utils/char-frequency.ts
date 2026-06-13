export class CharFrequency {
  private counts = new Map<string, number>()

  constructor(initial?: string) {
    if (initial) this.add(initial)
  }

  add(text: string): void {
    for (const ch of text) {
      this.counts.set(ch, (this.counts.get(ch) ?? 0) + 1)
    }
  }

  count(ch: string): number {
    return this.counts.get(ch) ?? 0
  }

  get uniqueChars(): number {
    return this.counts.size
  }

  get totalChars(): number {
    let sum = 0
    for (const c of this.counts.values()) sum += c
    return sum
  }

  get isEmpty(): boolean {
    return this.counts.size === 0
  }

  mostFrequent(n = 1): Array<[string, number]> {
    return Array.from(this.counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
  }

  leastFrequent(n = 1): Array<[string, number]> {
    return Array.from(this.counts.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, n)
  }

  merge(other: CharFrequency): void {
    for (const [ch, count] of other.counts) {
      this.counts.set(ch, (this.counts.get(ch) ?? 0) + count)
    }
  }

  normalize(): Map<string, number> {
    const total = this.totalChars
    const result = new Map<string, number>()
    for (const [ch, count] of this.counts) {
      result.set(ch, total > 0 ? count / total : 0)
    }
    return result
  }

  clear(): void {
    this.counts.clear()
  }

  toArray(): Array<[string, number]> {
    return Array.from(this.counts.entries())
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(this.counts))
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts)
  }

  clone(): CharFrequency {
    const copy = new CharFrequency()
    copy.counts = new Map(this.counts)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CharFrequency)) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [key, val] of this.counts) {
      if (other.counts.get(key) !== val) return false
    }
    return true
  }
}
