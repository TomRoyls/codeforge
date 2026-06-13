export class NgramCounter {
  private counts = new Map<string, number>()
  private n: number

  constructor(n = 2) {
    this.n = n
  }

  add(text: string): void {
    for (let i = 0; i <= text.length - this.n; i++) {
      const gram = text.slice(i, i + this.n)
      this.counts.set(gram, (this.counts.get(gram) ?? 0) + 1)
    }
  }

  count(ngram: string): number {
    return this.counts.get(ngram) ?? 0
  }

  get totalNgrams(): number {
    let sum = 0
    for (const c of this.counts.values()) sum += c
    return sum
  }

  get uniqueNgrams(): number {
    return this.counts.size
  }

  get isEmpty(): boolean {
    return this.counts.size === 0
  }

  mostFrequent(n = 10): Array<[string, number]> {
    return Array.from(this.counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
  }

  merge(other: NgramCounter): void {
    for (const [gram, count] of other.counts) {
      this.counts.set(gram, (this.counts.get(gram) ?? 0) + count)
    }
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

  clone(): NgramCounter {
    const copy = new NgramCounter(this.n)
    copy.counts = new Map(this.counts)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof NgramCounter)) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [key, val] of this.counts) {
      if (other.counts.get(key) !== val) return false
    }
    return true
  }
}
