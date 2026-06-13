export class PNCounter {
  private pos: Map<string, number> = new Map()
  private neg: Map<string, number> = new Map()

  increment(nodeId: string, amount = 1): void {
    if (amount < 0) throw new Error('Amount must be non-negative')
    this.pos.set(nodeId, (this.pos.get(nodeId) ?? 0) + amount)
  }

  decrement(nodeId: string, amount = 1): void {
    if (amount < 0) throw new Error('Amount must be non-negative')
    this.neg.set(nodeId, (this.neg.get(nodeId) ?? 0) + amount)
  }

  merge(other: PNCounter): void {
    for (const [k, v] of other.pos) this.pos.set(k, Math.max(this.pos.get(k) ?? 0, v))
    for (const [k, v] of other.neg) this.neg.set(k, Math.max(this.neg.get(k) ?? 0, v))
  }

  get value(): number {
    let p = 0, n = 0
    for (const v of this.pos.values()) p += v
    for (const v of this.neg.values()) n += v
    return p - n
  }

  get nodeCount(): number { return new Set([...this.pos.keys(), ...this.neg.keys()]).size }
  get isEmpty(): boolean { return this.nodeCount === 0 }

  clear(): void { this.pos.clear(); this.neg.clear() }

  toArray(): Array<{ node: string; pos: number; neg: number }> {
    const allNodes = new Set([...this.pos.keys(), ...this.neg.keys()])
    return Array.from(allNodes).map((n) => ({ node: n, pos: this.pos.get(n) ?? 0, neg: this.neg.get(n) ?? 0 }))
  }

  toString(): string { return JSON.stringify({ value: this.value }) }
  toJSON(): Record<string, number> { return { value: this.value } }

  clone(): PNCounter {
    const c = new PNCounter()
    c.pos = new Map(this.pos)
    c.neg = new Map(this.neg)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PNCounter)) return false
    return this.value === other.value
  }
}
