import type { QuadTreeOptions, Point, Rectangle } from './types.js'
import { DEFAULT_QUAD_TREE_OPTIONS } from './types.js'

export class QuadTree<T> {
  private bounds: Rectangle
  private entries: Array<{ point: Point; value: T }> = []
  private children: [QuadTree<T>, QuadTree<T>, QuadTree<T>, QuadTree<T>] | null = null
  private depth: number
  private maxPoints: number
  private maxDepth: number
  private _count: number = 0

  constructor(bounds: Rectangle, options?: Partial<QuadTreeOptions>, depth?: number) {
    this.bounds = { ...bounds }
    const opts: QuadTreeOptions = { ...DEFAULT_QUAD_TREE_OPTIONS, ...options }
    this.maxPoints = opts.maxPoints
    this.maxDepth = opts.maxDepth
    this.depth = depth ?? 0
  }

  insert(point: Point, value: T): boolean {
    if (!this._containsPoint(point)) return false
    this._insertInternal(point, value)
    this._count++
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
      if (this.entries.length > this.maxPoints && this.depth < this.maxDepth) {
        this._subdivide()
      }
    }
  }

  remove(point: Point): boolean {
    if (!this._containsPoint(point)) return false
    const removed = this._removeInternal(point)
    if (removed) this._count--
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

  queryRange(range: Rectangle): Array<{ point: Point; value: T }> {
    if (!this._intersects(range)) return []
    const results: Array<{ point: Point; value: T }> = []
    this._queryRangeInternal(range, results)
    return results
  }

  private _queryRangeInternal(range: Rectangle, results: Array<{ point: Point; value: T }>): void {
    if (!this._intersects(range)) return
    if (this.children !== null) {
      for (const child of this.children) {
        child._queryRangeInternal(range, results)
      }
    } else {
      for (const entry of this.entries) {
        if (this._pointInRect(entry.point, range)) {
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

  count(): number {
    return this._count
  }

  clear(): void {
    this.entries = []
    this.children = null
    this._count = 0
  }

  getBounds(): Rectangle {
    return { ...this.bounds }
  }

  getDepth(): number {
    if (this.children === null) return this.depth
    let maxD = this.depth
    for (const child of this.children) {
      const childDepth = child.getDepth()
      if (childDepth > maxD) maxD = childDepth
    }
    return maxD
  }

  getAllPoints(): Point[] {
    const points: Point[] = []
    this.forEach((point) => points.push(point))
    return points
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
    const opts: QuadTreeOptions = { maxPoints: this.maxPoints, maxDepth: this.maxDepth }

    this.children = [
      new QuadTree<T>({ x, y, width: halfW, height: halfH }, opts, childDepth),
      new QuadTree<T>({ x: x + halfW, y, width: halfW, height: halfH }, opts, childDepth),
      new QuadTree<T>({ x, y: y + halfH, width: halfW, height: halfH }, opts, childDepth),
      new QuadTree<T>({ x: x + halfW, y: y + halfH, width: halfW, height: halfH }, opts, childDepth),
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

  private _intersects(range: Rectangle): boolean {
    return (
      range.x < this.bounds.x + this.bounds.width &&
      range.x + range.width > this.bounds.x &&
      range.y < this.bounds.y + this.bounds.height &&
      range.y + range.height > this.bounds.y
    )
  }

  private _pointInRect(point: Point, rect: Rectangle): boolean {
    return (
      point.x >= rect.x &&
      point.x < rect.x + rect.width &&
      point.y >= rect.y &&
      point.y < rect.y + rect.height
    )
  }
}

export { DEFAULT_QUAD_TREE_OPTIONS } from './types.js'
export type { QuadTreeOptions, Point, Rectangle } from './types.js'
