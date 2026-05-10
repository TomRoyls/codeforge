import type {
  SpatialHashOptions,
  SpatialHashEntry,
  SpatialHashStatistics,
  SpatialHashBounds,
  SpatialHashJSON,
} from './types.js'
import { DEFAULT_SPATIAL_HASH_OPTIONS } from './types.js'

export class SpatialHash<T = unknown> {
  private _cellSize: number
  private cells: Map<string, SpatialHashEntry<T>[]>
  private entries: Map<string | number, SpatialHashEntry<T>>
  private _stats: SpatialHashStatistics

  constructor(options?: SpatialHashOptions) {
    const opts: Required<SpatialHashOptions> = {
      ...DEFAULT_SPATIAL_HASH_OPTIONS,
      ...options,
    }
    if (opts.cellSize <= 0) {
      throw new Error('cellSize must be positive')
    }
    this._cellSize = opts.cellSize
    this.cells = new Map()
    this.entries = new Map()
    this._stats = {
      inserts: 0,
      removes: 0,
      updates: 0,
      queries: 0,
      cellCount: 0,
      maxEntriesPerCell: 0,
    }
  }

  insert(id: string | number, x: number, y: number, data?: T): void {
    if (this.entries.has(id)) {
      this.remove(id)
    }
    const entry: SpatialHashEntry<T> = { id, x, y, data }
    const key = this.cellKey(x, y)
    let cell = this.cells.get(key)
    if (!cell) {
      cell = []
      this.cells.set(key, cell)
    }
    cell.push(entry)
    this.entries.set(id, entry)
    this._stats.inserts++
    this._stats.cellCount = this.cells.size
    if (cell.length > this._stats.maxEntriesPerCell) {
      this._stats.maxEntriesPerCell = cell.length
    }
  }

  remove(id: string | number): boolean {
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
      if (cell.length === 0) {
        this.cells.delete(key)
      }
    }
    this.entries.delete(id)
    this._stats.removes++
    this._stats.cellCount = this.cells.size
    return true
  }

  update(id: string | number, x: number, y: number): boolean {
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
        if (oldCell.length === 0) {
          this.cells.delete(oldKey)
        }
      }
      let newCell = this.cells.get(newKey)
      if (!newCell) {
        newCell = []
        this.cells.set(newKey, newCell)
      }
      newCell.push(entry)
      this._stats.cellCount = this.cells.size
      if (newCell.length > this._stats.maxEntriesPerCell) {
        this._stats.maxEntriesPerCell = newCell.length
      }
    }
    this._stats.updates++
    return true
  }

  get(id: string | number): { x: number; y: number; data?: T } | undefined {
    const entry = this.entries.get(id)
    if (!entry) {
      return undefined
    }
    return { x: entry.x, y: entry.y, data: entry.data }
  }

  query(x: number, y: number, width: number, height: number): SpatialHashEntry<T>[] {
    this._stats.queries++
    const result: SpatialHashEntry<T>[] = []
    const cellX1 = Math.floor(x / this._cellSize)
    const cellY1 = Math.floor(y / this._cellSize)
    const cellX2 = Math.floor((x + width) / this._cellSize)
    const cellY2 = Math.floor((y + height) / this._cellSize)
    for (let cx = cellX1; cx <= cellX2; cx++) {
      for (let cy = cellY1; cy <= cellY2; cy++) {
        const key = `${cx},${cy}`
        const cell = this.cells.get(key)
        if (cell) {
          for (const entry of cell) {
            if (
              entry.x >= x &&
              entry.x < x + width &&
              entry.y >= y &&
              entry.y < y + height
            ) {
              result.push(entry)
            }
          }
        }
      }
    }
    return result
  }

  queryPoint(x: number, y: number): SpatialHashEntry<T>[] {
    this._stats.queries++
    const key = this.cellKey(x, y)
    const cell = this.cells.get(key)
    if (!cell) {
      return []
    }
    return [...cell]
  }

  queryRadius(x: number, y: number, radius: number): SpatialHashEntry<T>[] {
    this._stats.queries++
    const result: SpatialHashEntry<T>[] = []
    const cellX1 = Math.floor((x - radius) / this._cellSize)
    const cellY1 = Math.floor((y - radius) / this._cellSize)
    const cellX2 = Math.floor((x + radius) / this._cellSize)
    const cellY2 = Math.floor((y + radius) / this._cellSize)
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

  has(id: string | number): boolean {
    return this.entries.has(id)
  }

  get size(): number {
    return this.entries.size
  }

  get isEmpty(): boolean {
    return this.entries.size === 0
  }

  clear(): void {
    this.cells.clear()
    this.entries.clear()
    this._stats = {
      inserts: 0,
      removes: 0,
      updates: 0,
      queries: 0,
      cellCount: 0,
      maxEntriesPerCell: 0,
    }
  }

  get cellSize(): number {
    return this._cellSize
  }

  get bounds(): SpatialHashBounds {
    if (this.entries.size === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const entry of this.entries.values()) {
      if (entry.x < minX) minX = entry.x
      if (entry.y < minY) minY = entry.y
      if (entry.x > maxX) maxX = entry.x
      if (entry.y > maxY) maxY = entry.y
    }
    return { minX, minY, maxX, maxY }
  }

  toArray(): SpatialHashEntry<T>[] {
    return Array.from(this.entries.values())
  }

  forEach(callback: (entry: SpatialHashEntry<T>) => void): void {
    for (const entry of this.entries.values()) {
      callback(entry)
    }
  }

  getStatistics(): SpatialHashStatistics {
    return {
      ...this._stats,
      cellCount: this.cells.size,
    }
  }

  toJSON(): SpatialHashJSON<T> {
    return {
      cellSize: this._cellSize,
      entries: Array.from(this.entries.values()),
      statistics: this.getStatistics(),
    }
  }

  static fromJSON<T = unknown>(data: SpatialHashJSON<T>): SpatialHash<T> {
    const hash = new SpatialHash<T>({ cellSize: data.cellSize })
    for (const entry of data.entries) {
      hash.insert(entry.id, entry.x, entry.y, entry.data)
    }
    return hash
  }

  private cellKey(x: number, y: number): string {
    const cx = Math.floor(x / this._cellSize)
    const cy = Math.floor(y / this._cellSize)
    return `${cx},${cy}`
  }
}

export { DEFAULT_SPATIAL_HASH_OPTIONS } from './types.js'
export type {
  SpatialHashOptions,
  SpatialHashEntry,
  SpatialHashStatistics,
  SpatialHashBounds,
  SpatialHashJSON,
} from './types.js'
