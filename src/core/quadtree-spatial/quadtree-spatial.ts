import type { Point, BoundingBox, QuadTreeSpatialOptions } from './types.js'
import { DEFAULT_QUADTREE_SPATIAL_OPTIONS } from './types.js'

export class QuadTreeSpatial<T> {
  private bounds: BoundingBox
  private entries: Array<{ point: Point; value: T }> = []
  private children: [QuadTreeSpatial<T>, QuadTreeSpatial<T>, QuadTreeSpatial<T>, QuadTreeSpatial<T>] | null = null
  private depth: number
  private capacity: number
  private maxDepth: number
  private _size: number = 0

  constructor(options?: Partial<QuadTreeSpatialOptions>, depth?: number) {
    const opts: QuadTreeSpatialOptions = { ...DEFAULT_QUADTREE_SPATIAL_OPTIONS, ...options }
    this.bounds = { ...opts.bounds }
    this.capacity = opts.capacity
    this.maxDepth = opts.maxDepth
    this.depth = depth ?? 0
  }

  insert(point: Point, value: T): boolean {
    if (!this._containsPoint(point)) return false
    this._insertInternal(point, value)
    this._size++
    return true
  }

  private _insertInternal(point: Point, value: T): void {
    if (this.children !== null) {
      for (const child of this.children) {
        if (child._containsPoint(point)) {
          child._insertInternal(point, value)
          return
        }
      }
    } else {
      this.entries.push({ point, value })
      if (this.entries.length > this.capacity && this.depth < this.maxDepth) {
        this._subdivide()
      }
    }
  }

  remove(point: Point): boolean {
    if (!this._containsPoint(point)) return false
    const removed = this._removeInternal(point)
    if (removed) this._size--
    return removed
  }

  private _removeInternal(point: Point): boolean {
    if (this.children !== null) {
      for (const child of this.children) {
        if (child._containsPoint(point)) {
          return child._removeInternal(point)
        }
      }
      return false
    }
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]!
      if (entry.point.x === point.x && entry.point.y === point.y) {
        this.entries.splice(i, 1)
        return true
      }
    }
    return false
  }

  queryRange(range: BoundingBox): Array<{ point: Point; value: T }> {
    if (!this._intersects(range)) return []
    const results: Array<{ point: Point; value: T }> = []
    this._queryRangeInternal(range, results)
    return results
  }

  private _queryRangeInternal(range: BoundingBox, results: Array<{ point: Point; value: T }>): void {
    if (!this._intersects(range)) return
    if (this.children !== null) {
      for (const child of this.children) {
        child._queryRangeInternal(range, results)
      }
    } else {
      for (const entry of this.entries) {
        if (this._pointInBox(entry.point, range)) {
          results.push({ point: entry.point, value: entry.value })
        }
      }
    }
  }

  queryPoint(point: Point): T | undefined {
    if (!this._containsPoint(point)) return undefined
    return this._queryPointInternal(point)
  }

  private _queryPointInternal(point: Point): T | undefined {
    if (this.children !== null) {
      for (const child of this.children) {
        if (child._containsPoint(point)) {
          return child._queryPointInternal(point)
        }
      }
      return undefined
    }
    for (const entry of this.entries) {
      if (entry.point.x === point.x && entry.point.y === point.y) {
        return entry.value
      }
    }
    return undefined
  }

  queryRadius(center: Point, radius: number): Array<{ point: Point; value: T }> {
    const results: Array<{ point: Point; value: T }> = []
    const range: BoundingBox = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    }
    this._queryRadiusInternal(range, center, radius, results)
    return results
  }

  private _queryRadiusInternal(range: BoundingBox, center: Point, radius: number, results: Array<{ point: Point; value: T }>): void {
    if (!this._intersects(range)) return
    if (this.children !== null) {
      for (const child of this.children) {
        child._queryRadiusInternal(range, center, radius, results)
      }
    } else {
      for (const entry of this.entries) {
        const dx = entry.point.x - center.x
        const dy = entry.point.y - center.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= radius) {
          results.push({ point: entry.point, value: entry.value })
        }
      }
    }
  }

  nearestNeighbor(point: Point): { point: Point; value: T; distance: number } | undefined {
    const all: Array<{ point: Point; value: T; distance: number }> = []
    this._collectWithDistance(point, all)
    if (all.length === 0) return undefined
    let best = all[0]!
    for (let i = 1; i < all.length; i++) {
      if (all[i]!.distance < best.distance) {
        best = all[i]!
      }
    }
    return best
  }

  kNearestNeighbors(point: Point, k: number): Array<{ point: Point; value: T; distance: number }> {
    if (k <= 0) return []
    const all: Array<{ point: Point; value: T; distance: number }> = []
    this._collectWithDistance(point, all)
    all.sort((a, b) => a.distance - b.distance)
    return all.slice(0, k)
  }

  private _collectWithDistance(point: Point, results: Array<{ point: Point; value: T; distance: number }>): void {
    if (this.children !== null) {
      for (const child of this.children) {
        child._collectWithDistance(point, results)
      }
    } else {
      for (const entry of this.entries) {
        const dx = entry.point.x - point.x
        const dy = entry.point.y - point.y
        results.push({ point: entry.point, value: entry.value, distance: Math.sqrt(dx * dx + dy * dy) })
      }
    }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.entries = []
    this.children = null
    this._size = 0
  }

  contains(point: Point): boolean {
    return this._containsPoint(point)
  }

  private _containsPoint(point: Point): boolean {
    return (
      point.x >= this.bounds.x &&
      point.x < this.bounds.x + this.bounds.width &&
      point.y >= this.bounds.y &&
      point.y < this.bounds.y + this.bounds.height
    )
  }

  forEach(callback: (point: Point, value: T) => void): void {
    if (this.children !== null) {
      for (const child of this.children) {
        child.forEach(callback)
      }
    } else {
      for (const entry of this.entries) {
        callback(entry.point, entry.value)
      }
    }
  }

  private _subdivide(): void {
    const halfW = this.bounds.width / 2
    const halfH = this.bounds.height / 2
    const x = this.bounds.x
    const y = this.bounds.y
    const childDepth = this.depth + 1
    const opts: Partial<QuadTreeSpatialOptions> = {
      capacity: this.capacity,
      maxDepth: this.maxDepth,
    }

    this.children = [
      new QuadTreeSpatial<T>({ ...opts, bounds: { x, y, width: halfW, height: halfH } }, childDepth),
      new QuadTreeSpatial<T>({ ...opts, bounds: { x: x + halfW, y, width: halfW, height: halfH } }, childDepth),
      new QuadTreeSpatial<T>({ ...opts, bounds: { x, y: y + halfH, width: halfW, height: halfH } }, childDepth),
      new QuadTreeSpatial<T>({ ...opts, bounds: { x: x + halfW, y: y + halfH, width: halfW, height: halfH } }, childDepth),
    ]

    const oldEntries = this.entries
    this.entries = []
    for (const entry of oldEntries) {
      for (const child of this.children) {
        if (child._containsPoint(entry.point)) {
          child._insertInternal(entry.point, entry.value)
          break
        }
      }
    }
  }

  private _intersects(range: BoundingBox): boolean {
    return (
      range.x < this.bounds.x + this.bounds.width &&
      range.x + range.width > this.bounds.x &&
      range.y < this.bounds.y + this.bounds.height &&
      range.y + range.height > this.bounds.y
    )
  }

  private _pointInBox(point: Point, box: BoundingBox): boolean {
    return (
      point.x >= box.x &&
      point.x < box.x + box.width &&
      point.y >= box.y &&
      point.y < box.y + box.height
    )
  }
}

export { DEFAULT_QUADTREE_SPATIAL_OPTIONS } from './types.js'
export type { QuadTreeSpatialOptions, Point, BoundingBox } from './types.js'
