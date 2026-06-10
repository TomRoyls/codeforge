export class SpatialHash2<T = unknown> {
  private cellSize: number
  private cells: Map<string, { id: string; x: number; y: number; value?: T }[]>
  private entries: Map<string, { id: string; x: number; y: number; value?: T }>

  constructor(cellSize: number) {
    if (cellSize <= 0) {
      throw new Error('cellSize must be positive')
    }
    this.cellSize = cellSize
    this.cells = new Map()
    this.entries = new Map()
  }

  insert(id: string, x: number, y: number, value?: T): void {
    if (this.entries.has(id)) {
      this.remove(id)
    }
    const entry = { id, x, y, value }
    const key = this.cellKey(x, y)
    let cell = this.cells.get(key)
    if (!cell) {
      cell = []
      this.cells.set(key, cell)
    }
    cell.push(entry)
    this.entries.set(id, entry)
  }

  remove(id: string): boolean {
    const entry = this.entries.get(id)
    if (!entry) {
      return false
    }
    const key = this.cellKey(entry.x, entry.y)
    const cell = this.cells.get(key)
    if (cell) {
      const idx = cell.findIndex((e) => e.id === id)
      if (idx !== -1) {
        cell.splice(idx, 1)
      }
      if (cell!.length === 0) {
        this.cells.delete(key)
      }
    }
    this.entries.delete(id)
    return true
  }

  update(id: string, x: number, y: number): boolean {
    const entry = this.entries.get(id)
    if (!entry) {
      return false
    }
    const oldKey = this.cellKey(entry.x, entry.y)
    const newKey = this.cellKey(x, y)
    entry.x = x
    entry.y = y
    if (oldKey !== newKey) {
      const oldCell = this.cells.get(oldKey)
      if (oldCell) {
        const idx = oldCell.findIndex((e) => e.id === id)
        if (idx !== -1) {
          oldCell.splice(idx, 1)
        }
        if (oldCell!.length === 0) {
          this.cells.delete(oldKey)
        }
      }
      let newCell = this.cells.get(newKey)
      if (!newCell) {
        newCell = []
        this.cells.set(newKey, newCell)
      }
      newCell.push(entry)
    }
    return true
  }

  query(x: number, y: number, radius: number): { id: string; x: number; y: number; value?: T }[] {
    const result: { id: string; x: number; y: number; value?: T }[] = []
    const cellX1 = Math.floor((x - radius) / this.cellSize)
    const cellY1 = Math.floor((y - radius) / this.cellSize)
    const cellX2 = Math.floor((x + radius) / this.cellSize)
    const cellY2 = Math.floor((y + radius) / this.cellSize)
    const r2 = radius * radius
    for (let cx = cellX1; cx <= cellX2; cx++) {
      for (let cy = cellY1; cy <= cellY2; cy++) {
        const key = `${cx},${cy}`
        const cell = this.cells.get(key)
        if (cell) {
          for (const entry of cell) {
            const dx = entry.x - x
            const dy = entry.y - y
            if (dx * dx + dy * dy <= r2) {
              result.push(entry)
            }
          }
        }
      }
    }
    return result
  }

  queryCell(cx: number, cy: number): { id: string; x: number; y: number; value?: T }[] {
    const key = `${cx},${cy}`
    const cell = this.cells.get(key)
    if (!cell) {
      return []
    }
    return [...cell]
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }

  get size(): number {
    return this.entries.size
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.cells.clear()
    this.entries.clear()
  }

  private cellKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    return `${cx},${cy}`
  }

  toString(): string {
    return `SpatialHash2({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'SpatialHash2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
