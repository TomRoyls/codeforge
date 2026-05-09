import type { Point, Rectangle } from './types.js'

const DEFAULT_CAPACITY = 4
const DEFAULT_MAX_DEPTH = 8

export class QuadTree {
  private _bounds: Rectangle
  private points: Point[] = []
  private _children: [QuadTree, QuadTree, QuadTree, QuadTree] | null = null
  private _depth: number
  private _capacity: number
  private _maxDepth: number
  private _size: number = 0

  constructor(boundary: Rectangle, capacity?: number, maxDepth?: number, depth?: number) {
    this._bounds = { ...boundary }
    this._capacity = capacity ?? DEFAULT_CAPACITY
    this._maxDepth = maxDepth ?? DEFAULT_MAX_DEPTH
    this._depth = depth ?? 0
  }

  insert(point: Point): boolean {
    if (!this.containsPoint(point)) return false
    this._insertInternal(point)
    this._size++
    return true
  }

  private _insertInternal(point: Point): void {
    if (this._children !== null) {
      for (const child of this._children) {
        if (child.containsPoint(point)) {
          child._insertInternal(point)
          return
        }
      }
    } else {
      this.points.push(point)
      if (this.points.length > this._capacity && this._depth < this._maxDepth) {
        this._subdivide()
      }
    }
  }

  remove(point: Point): boolean {
    if (!this.containsPoint(point)) return false
    const removed = this._removeInternal(point)
    if (removed) this._size--
    return removed
  }

  private _removeInternal(point: Point): boolean {
    if (this._children !== null) {
      for (const child of this._children) {
        if (child.containsPoint(point)) {
          return child._removeInternal(point)
        }
      }
      return false
    }
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i]!
      if (p.x === point.x && p.y === point.y) {
        this.points.splice(i, 1)
        return true
      }
    }
    return false
  }

  contains(point: Point): boolean {
    if (!this.containsPoint(point)) return false
    return this._containsInternal(point)
  }

  private _containsInternal(point: Point): boolean {
    if (this._children !== null) {
      for (const child of this._children) {
        if (child.containsPoint(point)) {
          return child._containsInternal(point)
        }
      }
      return false
    }
    for (const p of this.points) {
      if (p.x === point.x && p.y === point.y) return true
    }
    return false
  }

  queryRange(range: Rectangle): Point[] {
    if (!this.intersects(range)) return []
    const results: Point[] = []
    this._queryRangeInternal(range, results)
    return results
  }

  private _queryRangeInternal(range: Rectangle, results: Point[]): void {
    if (!this.intersects(range)) return
    if (this._children !== null) {
      for (const child of this._children) {
        child._queryRangeInternal(range, results)
      }
    } else {
      for (const p of this.points) {
        if (pointInRect(p, range)) {
          results.push(p)
        }
      }
    }
  }

  queryRadius(center: Point, radius: number): Point[] {
    const range: Rectangle = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    }
    if (!this.intersects(range)) return []
    const results: Point[] = []
    this._queryRadiusInternal(range, center, radius, results)
    return results
  }

  private _queryRadiusInternal(range: Rectangle, center: Point, radius: number, results: Point[]): void {
    if (!this.intersects(range)) return
    if (this._children !== null) {
      for (const child of this._children) {
        child._queryRadiusInternal(range, center, radius, results)
      }
    } else {
      for (const p of this.points) {
        const dx = p.x - center.x
        const dy = p.y - center.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= radius) {
          results.push(p)
        }
      }
    }
  }

  nearestNeighbor(point: Point): Point | undefined {
    if (this._size === 0) return undefined
    let best: Point | undefined
    let bestDist = Infinity
    this._nearestInternal(point, { best, bestDist }, (result) => {
      best = result.best
      bestDist = result.bestDist
    })
    return best
  }

  private _nearestInternal(
    point: Point,
    result: { best: Point | undefined; bestDist: number },
    update: (r: { best: Point | undefined; bestDist: number }) => void,
  ): void {
    if (this._children !== null) {
      const candidates: { child: QuadTree; dist: number }[] = []
      for (const child of this._children) {
        if (child._size === 0) continue
        const dist = child._minDist(point)
        candidates.push({ child, dist })
      }
      candidates.sort((a, b) => a.dist - b.dist)
      for (const { child, dist } of candidates) {
        if (dist >= result.bestDist) break
        child._nearestInternal(point, result, update)
        update(result)
      }
    } else {
      for (const p of this.points) {
        const dx = p.x - point.x
        const dy = p.y - point.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < result.bestDist) {
          result.bestDist = dist
          result.best = p
        }
      }
    }
  }

  private _minDist(point: Point): number {
    const cx = point.x
    const cy = point.y
    const bx = this._bounds.x
    const by = this._bounds.y
    const bx2 = bx + this._bounds.width
    const by2 = by + this._bounds.height
    const dx = cx < bx ? bx - cx : cx > bx2 ? cx - bx2 : 0
    const dy = cy < by ? by - cy : cy > by2 ? cy - by2 : 0
    return Math.sqrt(dx * dx + dy * dy)
  }

  clear(): void {
    this.points = []
    this._children = null
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  get depth(): number {
    if (this._children === null) return this._depth
    let maxD = this._depth
    for (const child of this._children) {
      const childDepth = child.depth
      if (childDepth > maxD) maxD = childDepth
    }
    return maxD
  }

  get bounds(): Rectangle {
    return { ...this._bounds }
  }

  forEach(callback: (point: Point) => void): void {
    if (this._children !== null) {
      for (const child of this._children) {
        child.forEach(callback)
      }
    } else {
      for (const p of this.points) {
        callback(p)
      }
    }
  }

  toArray(): Point[] {
    const result: Point[] = []
    this.forEach((p) => result.push(p))
    return result
  }

  clone(): QuadTree {
    const cloned = new QuadTree(this._bounds, this._capacity, this._maxDepth, this._depth)
    if (this._children !== null) {
      cloned._children = [
        this._children[0]!.clone(),
        this._children[1]!.clone(),
        this._children[2]!.clone(),
        this._children[3]!.clone(),
      ]
      cloned._size = this._size
    } else {
      cloned.points = this.points.map((p) => ({ ...p }))
      cloned._size = this._size
    }
    return cloned
  }

  private _subdivide(): void {
    const halfW = this._bounds.width / 2
    const halfH = this._bounds.height / 2
    const x = this._bounds.x
    const y = this._bounds.y
    const childDepth = this._depth + 1

    this._children = [
      new QuadTree({ x, y, width: halfW, height: halfH }, this._capacity, this._maxDepth, childDepth),
      new QuadTree({ x: x + halfW, y, width: halfW, height: halfH }, this._capacity, this._maxDepth, childDepth),
      new QuadTree({ x, y: y + halfH, width: halfW, height: halfH }, this._capacity, this._maxDepth, childDepth),
      new QuadTree({ x: x + halfW, y: y + halfH, width: halfW, height: halfH }, this._capacity, this._maxDepth, childDepth),
    ]

    const oldPoints = this.points
    this.points = []
    for (const p of oldPoints) {
      for (const child of this._children) {
        if (child.containsPoint(p)) {
          child._insertInternal(p)
          break
        }
      }
    }
  }

  private containsPoint(point: Point): boolean {
    return (
      point.x >= this._bounds.x &&
      point.x < this._bounds.x + this._bounds.width &&
      point.y >= this._bounds.y &&
      point.y < this._bounds.y + this._bounds.height
    )
  }

  private intersects(range: Rectangle): boolean {
    return (
      range.x < this._bounds.x + this._bounds.width &&
      range.x + range.width > this._bounds.x &&
      range.y < this._bounds.y + this._bounds.height &&
      range.y + range.height > this._bounds.y
    )
  }
}

function pointInRect(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  )
}

export type { Point, Rectangle } from './types.js'
