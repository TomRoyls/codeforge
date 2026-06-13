export class SparseGrid<T> {
  private data = new Map<string, T>()

  private key(row: number, col: number): string {
    return `${row},${col}`
  }

  set(row: number, col: number, value: T): void {
    this.data.set(this.key(row, col), value)
  }

  get(row: number, col: number): T | undefined {
    return this.data.get(this.key(row, col))
  }

  has(row: number, col: number): boolean {
    return this.data.has(this.key(row, col))
  }

  delete(row: number, col: number): boolean {
    return this.data.delete(this.key(row, col))
  }

  get size(): number {
    return this.data.size
  }

  get isEmpty(): boolean {
    return this.data.size === 0
  }

  neighbors4(row: number, col: number): Array<[number, number, T | undefined]> {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    return dirs.map(([dr, dc]) => [row + dr!, col + dc!, this.get(row + dr!, col + dc!)] as [number, number, T | undefined])
  }

  occupiedNeighbors(row: number, col: number): number {
    return this.neighbors4(row, col).filter(([, , v]) => v !== undefined).length
  }

  bounds(): { minRow: number; maxRow: number; minCol: number; maxCol: number } | undefined {
    if (this.data.size === 0) return undefined
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity
    for (const k of this.data.keys()) {
      const [r, c] = k.split(',').map(Number)
      minRow = Math.min(minRow, r)
      maxRow = Math.max(maxRow, r)
      minCol = Math.min(minCol, c)
      maxCol = Math.max(maxCol, c)
    }
    return { minRow, maxRow, minCol, maxCol }
  }

  clear(): void {
    this.data.clear()
  }

  toArray(): Array<[number, number, T]> {
    return Array.from(this.data.entries()).map(([k, v]) => {
      const [r, c] = k.split(',').map(Number)
      return [r, c, v]
    })
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[number, number, T]> {
    return this.toArray()
  }

  clone(): SparseGrid<T> {
    const copy = new SparseGrid<T>()
    copy.data = new Map(this.data)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SparseGrid)) return false
    if (this.size !== other.size) return false
    for (const [k, v] of this.data) {
      if (other.data.get(k) !== v) return false
    }
    return true
  }
}
