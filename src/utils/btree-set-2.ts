export class BTreeSet2 {
  private data: number[] = []

  add(value: number): void {
    const idx = this.data.indexOf(value)
    if (idx === -1) {
      this.data.push(value)
      this.data.sort((a, b) => a - b)
    }
  }

  has(value: number): boolean { return this.data.includes(value) }

  delete(value: number): boolean {
    const idx = this.data.indexOf(value)
    if (idx === -1) return false
    this.data.splice(idx, 1)
    return true
  }

  first(): number | undefined { return this.data[0] }
  last(): number | undefined { return this.data[this.data.length - 1] }

  rangeQuery(lo: number, hi: number): number[] {
    return this.data.filter(v => v >= lo && v <= hi)
  }

  predecessor(value: number): number | undefined {
    let result: number | undefined
    for (const v of this.data) {
      if (v < value) result = v
      else break
    }
    return result
  }

  successor(value: number): number | undefined {
    for (const v of this.data) {
      if (v > value) return v
    }
    return undefined
  }

  get size(): number { return this.data.length }
  get isEmpty(): boolean { return this.data.length === 0 }

  clear(): void { this.data = [] }

  toArray(): number[] { return [...this.data] }
  toString(): string { return JSON.stringify({ size: this.data.length }) }
  toJSON(): Record<string, number> { return { size: this.data.length } }

  clone(): BTreeSet2 {
    const c = new BTreeSet2()
    c.data = [...this.data]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BTreeSet2)) return false
    return this.size === other.size
  }
}
