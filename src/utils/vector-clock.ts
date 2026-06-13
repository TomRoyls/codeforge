export class VectorClock {
  private clock: Map<string, number> = new Map()

  increment(nodeId: string): void {
    this.clock.set(nodeId, (this.clock.get(nodeId) ?? 0) + 1)
  }

  get(nodeId: string): number {
    return this.clock.get(nodeId) ?? 0
  }

  merge(other: VectorClock): void {
    for (const [node, ts] of other.clock) {
      this.clock.set(node, Math.max(this.clock.get(node) ?? 0, ts))
    }
  }

  happensBefore(other: VectorClock): boolean {
    let allLeq = true
    let anyLt = false
    const allKeys = new Set([...this.clock.keys(), ...other.clock.keys()])
    for (const key of allKeys) {
      const a = this.clock.get(key) ?? 0
      const b = other.clock.get(key) ?? 0
      if (a > b) allLeq = false
      if (a < b) anyLt = true
    }
    return allLeq && anyLt
  }

  isConcurrent(other: VectorClock): boolean {
    return !this.happensBefore(other) && !other.happensBefore(this) && !this.equals(other)
  }

  equals(other: VectorClock): boolean {
    if (!(other instanceof VectorClock)) return false
    const allKeys = new Set([...this.clock.keys(), ...other.clock.keys()])
    for (const key of allKeys) {
      if ((this.clock.get(key) ?? 0) !== (other.clock.get(key) ?? 0)) return false
    }
    return true
  }

  get nodeCount(): number { return this.clock.size }
  get isEmpty(): boolean { return this.clock.size === 0 }

  clear(): void { this.clock.clear() }

  toArray(): Array<[string, number]> { return Array.from(this.clock.entries()) }
  toString(): string { return JSON.stringify(Object.fromEntries(this.clock)) }
  toJSON(): Record<string, number> { return Object.fromEntries(this.clock) }

  clone(): VectorClock {
    const vc = new VectorClock()
    vc.clock = new Map(this.clock)
    return vc
  }
}
