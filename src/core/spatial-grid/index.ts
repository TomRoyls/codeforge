import type { SpatialGridOptions } from './types.js'

export type { SpatialGridOptions } from './types.js'

interface ItemEntry<T> {
  item: T
  x: number
  y: number
}

export class SpatialGrid<T> {
  private _cellSize: number
  private _cols: number
  private _rows: number
  private _width: number
  private _height: number
  private grid: Map<string, ItemEntry<T>[]>
  private items: Map<T, ItemEntry<T>>
  private _size: number

  constructor(options: SpatialGridOptions) {
    this._cellSize = options.cellSize
    this._width = options.width
    this._height = options.height
    this._cols = Math.ceil(options.width / options.cellSize)
    this._rows = Math.ceil(options.height / options.cellSize)
    this.grid = new Map()
    this.items = new Map()
    this._size = 0
  }

  private cellKey(cellX: number, cellY: number): string {
    return `${cellX},${cellY}`
  }

  getCell(x: number, y: number): [number, number] {
    const cellX = Math.floor(x / this._cellSize)
    const cellY = Math.floor(y / this._cellSize)
    return [cellX, cellY]
  }

  insert(item: T, x: number, y: number): void {
    if (this.items.has(item)) {
      this.remove(item)
    }
    const [cellX, cellY] = this.getCell(x, y)
    const key = this.cellKey(cellX, cellY)
    const entry: ItemEntry<T> = { item, x, y }
    let cell = this.grid.get(key)
    if (!cell) {
      cell = []
      this.grid.set(key, cell)
    }
    cell.push(entry)
    this.items.set(item, entry)
    this._size++
  }

  remove(item: T): boolean {
    const entry = this.items.get(item)
    if (!entry) return false
    const [cellX, cellY] = this.getCell(entry.x, entry.y)
    const key = this.cellKey(cellX, cellY)
    const cell = this.grid.get(key)
    if (cell) {
      const idx = cell.indexOf(entry)
      if (idx !== -1) {
        cell.splice(idx, 1)
      }
      if (cell.length === 0) {
        this.grid.delete(key)
      }
    }
    this.items.delete(item)
    this._size--
    return true
  }

  update(item: T, x: number, y: number): boolean {
    if (!this.items.has(item)) return false
    this.insert(item, x, y)
    return true
  }

  query(x: number, y: number, width: number, height: number): T[] {
    const result: T[] = []
    const startCellX = Math.floor(x / this._cellSize)
    const startCellY = Math.floor(y / this._cellSize)
    const endCellX = Math.floor((x + width) / this._cellSize)
    const endCellY = Math.floor((y + height) / this._cellSize)
    for (let cx = startCellX; cx <= endCellX; cx++) {
      for (let cy = startCellY; cy <= endCellY; cy++) {
        const cell = this.grid.get(this.cellKey(cx, cy))
        if (cell) {
          for (const entry of cell) {
            if (entry.x >= x && entry.x < x + width && entry.y >= y && entry.y < y + height) {
              result.push(entry.item)
            }
          }
        }
      }
    }
    return result
  }

  queryRadius(x: number, y: number, radius: number): T[] {
    const result: T[] = []
    const startCellX = Math.floor((x - radius) / this._cellSize)
    const startCellY = Math.floor((y - radius) / this._cellSize)
    const endCellX = Math.floor((x + radius) / this._cellSize)
    const endCellY = Math.floor((y + radius) / this._cellSize)
    const r2 = radius * radius
    for (let cx = startCellX; cx <= endCellX; cx++) {
      for (let cy = startCellY; cy <= endCellY; cy++) {
        const cell = this.grid.get(this.cellKey(cx, cy))
        if (cell) {
          for (const entry of cell) {
            const dx = entry.x - x
            const dy = entry.y - y
            if (dx * dx + dy * dy <= r2) {
              result.push(entry.item)
            }
          }
        }
      }
    }
    return result
  }

  queryCell(cellX: number, cellY: number): T[] {
    const cell = this.grid.get(this.cellKey(cellX, cellY))
    if (!cell) return []
    return cell.map((entry) => entry.item)
  }

  get(item: T): { x: number; y: number } | undefined {
    const entry = this.items.get(item)
    if (!entry) return undefined
    return { x: entry.x, y: entry.y }
  }

  has(item: T): boolean {
    return this.items.has(item)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.grid.clear()
    this.items.clear()
    this._size = 0
  }

  toArray(): Array<{ item: T; x: number; y: number }> {
    const result: Array<{ item: T; x: number; y: number }> = []
    for (const entry of this.items.values()) {
      result.push({ item: entry.item, x: entry.x, y: entry.y })
    }
    return result
  }

  cells(): number {
    return this._cols * this._rows
  }

  cellSize(): number {
    return this._cellSize
  }

  forEach(callback: (item: T, x: number, y: number) => void): void {
    for (const entry of this.items.values()) {
      callback(entry.item, entry.x, entry.y)
    }
  }

  clone(): SpatialGrid<T> {
    const cloned = new SpatialGrid<T>({
      width: this._width,
      height: this._height,
      cellSize: this._cellSize,
    })
    for (const entry of this.items.values()) {
      cloned.insert(entry.item, entry.x, entry.y)
    }
    return cloned
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }
}
