export class HashMap2D<T> {
  private data: Map<string, T> = new Map()

  private key(x: number, y: number): string { return `${x},${y}` }

  set(x: number, y: number, value: T): void {
    this.data.set(this.key(x, y), value)
  }

  get(x: number, y: number): T | undefined {
    return this.data.get(this.key(x, y))
  }

  has(x: number, y: number): boolean {
    return this.data.has(this.key(x, y))
  }

  delete(x: number, y: number): boolean {
    return this.data.delete(this.key(x, y))
  }

  get size(): number { return this.data.size }
  get isEmpty(): boolean { return this.data.size === 0 }

  clear(): void { this.data.clear() }

  entries(): Array<[number, number, T]> {
    return Array.from(this.data.entries()).map(([k, v]) => {
      const [x, y] = k.split(',').map(Number)
      return [x!, y!, v]
    })
  }

  neighbors4(x: number, y: number): Array<[number, number, T]> {
    const result: Array<[number, number, T]> = []
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const v = this.get(x + dx!, y + dy!)
      if (v !== undefined) result.push([x + dx!, y + dy!, v])
    }
    return result
  }

  toArray(): Array<{ x: number; y: number; value: T }> {
    return this.entries().map(([x, y, value]) => ({ x, y, value }))
  }

  toString(): string { return JSON.stringify({ size: this.size }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): HashMap2D<T> {
    const c = new HashMap2D<T>()
    c.data = new Map(this.data)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HashMap2D)) return false
    return this.size === other.size
  }
}
