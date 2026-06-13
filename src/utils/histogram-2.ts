export class Histogram2 {
  private bins: Map<string, number> = new Map()
  private total = 0

  add(label: string, count = 1): void {
    this.bins.set(label, (this.bins.get(label) ?? 0) + count)
    this.total += count
  }

  get(label: string): number { return this.bins.get(label) ?? 0 }

  frequency(label: string): number { return this.total === 0 ? 0 : this.get(label) / this.total }

  mode(): string | undefined {
    let maxLabel: string | undefined
    let maxCount = 0
    for (const [label, count] of this.bins) {
      if (count > maxCount) { maxLabel = label; maxCount = count }
    }
    return maxLabel
  }

  get binCount(): number { return this.bins.size }
  get totalCount(): number { return this.total }
  get isEmpty(): boolean { return this.total === 0 }

  clear(): void { this.bins.clear(); this.total = 0 }

  toArray(): Array<{ label: string; count: number }> {
    return Array.from(this.bins.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }))
  }

  toString(): string { return JSON.stringify(this.toArray()) }
  toJSON(): Record<string, number> { return Object.fromEntries(this.bins) }

  clone(): Histogram2 {
    const c = new Histogram2()
    c.bins = new Map(this.bins)
    c.total = this.total
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Histogram2)) return false
    if (this.bins.size !== other.bins.size) return false
    for (const [k, v] of this.bins) {
      if (other.bins.get(k) !== v) return false
    }
    return true
  }
}
