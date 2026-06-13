export class SpatialHash<T> {
  private cells = new Map<string, T[]>()
  private cellSize: number

  constructor(cellSize = 64) {
    this.cellSize = cellSize
  }

  private key(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`
  }

  insert(x: number, y: number, item: T): void {
    const k = this.key(x, y)
    if (!this.cells.has(k)) this.cells.set(k, [])
    this.cells.get(k)!.push(item)
  }

  query(x: number, y: number): T[] {
    return this.cells.get(this.key(x, y))?.slice() ?? []
  }

  queryRadius(x: number, y: number, radius: number): T[] {
    const results: T[] = []
    const minCx = Math.floor((x - radius) / this.cellSize)
    const maxCx = Math.floor((x + radius) / this.cellSize)
    const minCy = Math.floor((y - radius) / this.cellSize)
    const maxCy = Math.floor((y + radius) / this.cellSize)
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const items = this.cells.get(`${cx},${cy}`)
        if (items) results.push(...items)
      }
    }
    return results
  }

  get cellCount(): number { return this.cells.size }

  get totalItems(): number {
    let count = 0
    for (const items of this.cells.values()) count += items.length
    return count
  }

  get isEmpty(): boolean { return this.cells.size === 0 }

  clear(): void { this.cells.clear() }

  toArray(): Array<[string, T[]]> {
    return Array.from(this.cells.entries()).map(([k, v]) => [k, [...v]])
  }

  toString(): string {
    return JSON.stringify({ cells: this.cellCount, items: this.totalItems })
  }

  toJSON(): Record<string, number> {
    return { cells: this.cellCount, items: this.totalItems, cellSize: this.cellSize }
  }

  clone(): SpatialHash<T> {
    const copy = new SpatialHash<T>(this.cellSize)
    for (const [k, items] of this.cells) {
      copy.cells.set(k, [...items])
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SpatialHash)) return false
    return this.totalItems === other.totalItems
  }
}
