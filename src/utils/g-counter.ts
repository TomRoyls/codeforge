export class GCounter {
  private counts: Map<string, number> = new Map()

  increment(nodeId: string, amount = 1): void {
    if (amount < 0) throw new Error('Amount must be non-negative')
    this.counts.set(nodeId, (this.counts.get(nodeId) ?? 0) + amount)
  }

  merge(other: GCounter): void {
    for (const [node, count] of other.counts) {
      this.counts.set(node, Math.max(this.counts.get(node) ?? 0, count))
    }
  }

  get value(): number {
    let total = 0
    for (const count of this.counts.values()) total += count
    return total
  }

  get(nodeId: string): number {
    return this.counts.get(nodeId) ?? 0
  }

  get nodeCount(): number { return this.counts.size }
  get isEmpty(): boolean { return this.counts.size === 0 }

  clear(): void { this.counts.clear() }

  toArray(): Array<[string, number]> { return Array.from(this.counts.entries()) }
  toString(): string { return JSON.stringify({ value: this.value, nodes: this.nodeCount }) }
  toJSON(): Record<string, number> { return Object.fromEntries(this.counts) }

  clone(): GCounter {
    const c = new GCounter()
    c.counts = new Map(this.counts)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof GCounter)) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [k, v] of this.counts) {
      if (other.counts.get(k) !== v) return false
    }
    return true
  }
}
