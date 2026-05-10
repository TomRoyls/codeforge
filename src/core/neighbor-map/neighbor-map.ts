import type { NeighborMapOptions, NeighborMapStatistics } from './types.js'
import { DEFAULT_NEIGHBOR_MAP_OPTIONS } from './types.js'

interface Entry<K, V> {
  key: K
  value: V
  x: number
  y: number
}

export class NeighborMap<K, V> {
  private grid = new Map<string, Entry<K, V>[]>()
  private entries = new Map<K, Entry<K, V>>()
  private _options: Required<NeighborMapOptions>
  private _stats = {
    inserts: 0,
    removes: 0,
    nearestQueries: 0,
    radiusQueries: 0,
    totalQuerySize: 0,
    queryCount: 0,
  }

  constructor(options?: NeighborMapOptions) {
    this._options = { ...DEFAULT_NEIGHBOR_MAP_OPTIONS, ...options }
  }

  insert(x: number, y: number, key: K, value: V): boolean {
    if (this.entries.has(key)) return false
    const entry: Entry<K, V> = { key, value, x, y }
    this.entries.set(key, entry)
    const cellKey = this._cellKey(x, y)
    let cell = this.grid.get(cellKey)
    if (!cell) {
      cell = []
      this.grid.set(cellKey, cell)
    }
    cell.push(entry)
    this._stats.inserts++
    return true
  }

  remove(key: K): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    this.entries.delete(key)
    const cellKey = this._cellKey(entry.x, entry.y)
    const cell = this.grid.get(cellKey)
    if (cell) {
      const idx = cell.indexOf(entry)
      if (idx !== -1) {
        cell.splice(idx, 1)
      }
      if (cell.length === 0) {
        this.grid.delete(cellKey)
      }
    }
    this._stats.removes++
    return true
  }

  get(key: K): V | undefined {
    const entry = this.entries.get(key)
    return entry ? entry.value : undefined
  }

  getAt(x: number, y: number): Array<{ key: K; value: V }> {
    const cellKey = this._cellKey(x, y)
    const cell = this.grid.get(cellKey)
    if (!cell) return []
    return cell.map((e) => ({ key: e.key, value: e.value }))
  }

  nearest(x: number, y: number, k: number = 1): Array<{ key: K; value: V; x: number; y: number; distance: number }> {
    this._stats.nearestQueries++
    if (k <= 0 || this.entries.size === 0) {
      this._recordQuerySize(0)
      return []
    }

    const results: Array<{ key: K; value: V; x: number; y: number; distance: number }> = []
    let maxDist = Infinity

    const cx = this._toGridCoord(x)
    const cy = this._toGridCoord(y)
    let ring = 0

    while (results.length < k && (ring === 0 || this._hasCellsInRing(cx, cy, ring))) {
      this._collectFromRing(cx, cy, ring, x, y, results, k, maxDist)
      if (results.length >= k) {
        results.sort((a, b) => a.distance - b.distance)
        results.length = k
        maxDist = results[results.length - 1]!.distance
      }
      ring++
      if (ring > this.entries.size) break
    }

    results.sort((a, b) => a.distance - b.distance)
    if (results.length > k) {
      results.length = k
    }
    this._recordQuerySize(results.length)
    return results
  }

  inRadius(x: number, y: number, radius: number): Array<{ key: K; value: V; x: number; y: number; distance: number }> {
    this._stats.radiusQueries++
    if (radius < 0 || this.entries.size === 0) {
      this._recordQuerySize(0)
      return []
    }

    const results: Array<{ key: K; value: V; x: number; y: number; distance: number }> = []
    const cx = this._toGridCoord(x)
    const cy = this._toGridCoord(y)
    const gridRadius = Math.ceil(radius / this._options.gridSize)

    const minCX = cx - gridRadius
    const maxCX = cx + gridRadius
    const minCY = cy - gridRadius
    const maxCY = cy + gridRadius
    const radiusSq = radius * radius

    for (let gx = minCX; gx <= maxCX; gx++) {
      for (let gy = minCY; gy <= maxCY; gy++) {
        const cellKey = `${gx},${gy}`
        const cell = this.grid.get(cellKey)
        if (!cell) continue
        for (let i = 0; i < cell.length; i++) {
          const entry = cell[i]!
          const dx = entry.x - x
          const dy = entry.y - y
          const distSq = dx * dx + dy * dy
          if (distSq <= radiusSq) {
            results.push({
              key: entry.key,
              value: entry.value,
              x: entry.x,
              y: entry.y,
              distance: Math.sqrt(distSq),
            })
          }
        }
      }
    }

    results.sort((a, b) => a.distance - b.distance)
    this._recordQuerySize(results.length)
    return results
  }

  updatePosition(key: K, newX: number, newY: number): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false

    const oldCellKey = this._cellKey(entry.x, entry.y)
    const newCellKey = this._cellKey(newX, newY)

    if (oldCellKey !== newCellKey) {
      const oldCell = this.grid.get(oldCellKey)
      if (oldCell) {
        const idx = oldCell.indexOf(entry)
        if (idx !== -1) {
          oldCell.splice(idx, 1)
        }
        if (oldCell.length === 0) {
          this.grid.delete(oldCellKey)
        }
      }

      let newCell = this.grid.get(newCellKey)
      if (!newCell) {
        newCell = []
        this.grid.set(newCellKey, newCell)
      }
      newCell.push(entry)
    }

    entry.x = newX
    entry.y = newY
    return true
  }

  bounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (this.entries.size === 0) return null
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

  getStatistics(): NeighborMapStatistics {
    return {
      inserts: this._stats.inserts,
      removes: this._stats.removes,
      nearestQueries: this._stats.nearestQueries,
      radiusQueries: this._stats.radiusQueries,
      avgQuerySize: this._stats.queryCount === 0 ? 0 : this._stats.totalQuerySize / this._stats.queryCount,
    }
  }

  get size(): number {
    return this.entries.size
  }

  get isEmpty(): boolean {
    return this.entries.size === 0
  }

  clear(): void {
    this.grid.clear()
    this.entries.clear()
  }

  toArray(): Array<{ key: K; value: V; x: number; y: number }> {
    const result: Array<{ key: K; value: V; x: number; y: number }> = []
    for (const entry of this.entries.values()) {
      result.push({ key: entry.key, value: entry.value, x: entry.x, y: entry.y })
    }
    return result
  }

  forEach(callback: (value: V, key: K, x: number, y: number) => void): void {
    for (const entry of this.entries.values()) {
      callback(entry.value, entry.key, entry.x, entry.y)
    }
  }

  [Symbol.iterator](): Iterator<{ key: K; value: V; x: number; y: number }> {
    const iter = this.entries.values()
    return {
      next: () => {
        const result = iter.next()
        if (result.done) return { value: undefined, done: true }
        const entry = result.value
        return { value: { key: entry.key, value: entry.value, x: entry.x, y: entry.y }, done: false }
      },
    }
  }

  private _toGridCoord(val: number): number {
    return Math.floor(val / this._options.gridSize)
  }

  private _cellKey(x: number, y: number): string {
    return `${this._toGridCoord(x)},${this._toGridCoord(y)}`
  }

  private _recordQuerySize(size: number): void {
    this._stats.totalQuerySize += size
    this._stats.queryCount++
  }

  private _hasCellsInRing(cx: number, cy: number, ring: number): boolean {
    for (let dx = -ring; dx <= ring; dx++) {
      const dyMax = ring - Math.abs(dx)
      const topKey = `${cx + dx},${cy + dyMax}`
      const botKey = `${cx + dx},${cy - dyMax}`
      if (this.grid.has(topKey) || this.grid.has(botKey)) return true
    }
    return false
  }

  private _collectFromRing(
    cx: number,
    cy: number,
    ring: number,
    ox: number,
    oy: number,
    results: Array<{ key: K; value: V; x: number; y: number; distance: number }>,
    k: number,
    maxDist: number,
  ): void {
    for (let dx = -ring; dx <= ring; dx++) {
      const dyMax = ring - Math.abs(dx)
      for (let dy = -dyMax; dy <= dyMax; dy++) {
        if (ring > 0 && Math.abs(dx) < ring && Math.abs(dy) < ring) continue
        const cellKey = `${cx + dx},${cy + dy}`
        const cell = this.grid.get(cellKey)
        if (!cell) continue
        for (let i = 0; i < cell.length; i++) {
          const entry = cell[i]!
          const ddx = entry.x - ox
          const ddy = entry.y - oy
          const dist = Math.sqrt(ddx * ddx + ddy * ddy)
          if (dist < maxDist || results.length < k) {
            results.push({
              key: entry.key,
              value: entry.value,
              x: entry.x,
              y: entry.y,
              distance: dist,
            })
          }
        }
      }
    }
  }
}

export type { NeighborMapOptions, NeighborMapStatistics } from './types.js'
export { DEFAULT_NEIGHBOR_MAP_OPTIONS } from './types.js'
