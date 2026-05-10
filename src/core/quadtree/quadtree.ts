import type { Rect, QuadTreePoint, QuadTreeOptions, QuadTreeStats } from './types.js'
import { DEFAULT_CAPACITY } from './types.js'

export class QuadTree<T = undefined> {
  private bounds: Rect
  private capacity: number
  private points: QuadTreePoint<T>[] = []
  private divided = false
  private northeast: QuadTree<T> | null = null
  private northwest: QuadTree<T> | null = null
  private southeast: QuadTree<T> | null = null
  private southwest: QuadTree<T> | null = null

  constructor(options: QuadTreeOptions<T>) {
    this.bounds = { ...options.bounds }
    this.capacity = options.capacity ?? DEFAULT_CAPACITY
  }

  private contains(x: number, y: number): boolean {
    return (
      x >= this.bounds.x &&
      x < this.bounds.x + this.bounds.width &&
      y >= this.bounds.y &&
      y < this.bounds.y + this.bounds.height
    )
  }

  private rectIntersects(range: Rect): boolean {
    return !(
      range.x > this.bounds.x + this.bounds.width ||
      range.x + range.width < this.bounds.x ||
      range.y > this.bounds.y + this.bounds.height ||
      range.y + range.height < this.bounds.y
    )
  }

  private subdivide(): void {
    const hw = this.bounds.width / 2
    const hh = this.bounds.height / 2
    const bx = this.bounds.x
    const by = this.bounds.y

    this.northeast = new QuadTree<T>({
      bounds: { x: bx + hw, y: by, width: hw, height: hh },
      capacity: this.capacity,
    })
    this.northwest = new QuadTree<T>({
      bounds: { x: bx, y: by, width: hw, height: hh },
      capacity: this.capacity,
    })
    this.southeast = new QuadTree<T>({
      bounds: { x: bx + hw, y: by + hh, width: hw, height: hh },
      capacity: this.capacity,
    })
    this.southwest = new QuadTree<T>({
      bounds: { x: bx, y: by + hh, width: hw, height: hh },
      capacity: this.capacity,
    })

    for (const p of this.points) {
      this.northeast.insert(p.x, p.y, p.value)
      this.northwest.insert(p.x, p.y, p.value)
      this.southeast.insert(p.x, p.y, p.value)
      this.southwest.insert(p.x, p.y, p.value)
    }
    this.points = []
    this.divided = true
  }

  insert(x: number, y: number, value?: T): boolean {
    if (!this.contains(x, y)) return false

    if (!this.divided) {
      if (this.points.length < this.capacity) {
        this.points.push({ x, y, value })
        return true
      }
      this.subdivide()
    }

    return (
      this.northeast!.insert(x, y, value) ||
      this.northwest!.insert(x, y, value) ||
      this.southeast!.insert(x, y, value) ||
      this.southwest!.insert(x, y, value)
    )
  }

  remove(x: number, y: number): boolean {
    if (!this.contains(x, y)) return false

    if (!this.divided) {
      const idx = this.points.findIndex((p) => p.x === x && p.y === y)
      if (idx !== -1) {
        this.points.splice(idx, 1)
        return true
      }
      return false
    }

    return (
      this.northeast!.remove(x, y) ||
      this.northwest!.remove(x, y) ||
      this.southeast!.remove(x, y) ||
      this.southwest!.remove(x, y)
    )
  }

  containsPoint(x: number, y: number): boolean {
    if (!this.contains(x, y)) return false

    if (!this.divided) {
      return this.points.some((p) => p.x === x && p.y === y)
    }

    return (
      this.northeast!.containsPoint(x, y) ||
      this.northwest!.containsPoint(x, y) ||
      this.southeast!.containsPoint(x, y) ||
      this.southwest!.containsPoint(x, y)
    )
  }

  queryRange(range: Rect): QuadTreePoint<T>[] {
    const result: QuadTreePoint<T>[] = []
    this.queryRangeInto(range, result)
    return result
  }

  private queryRangeInto(range: Rect, result: QuadTreePoint<T>[]): void {
    if (!this.rectIntersects(range)) return

    if (!this.divided) {
      for (const p of this.points) {
        if (
          p.x >= range.x &&
          p.x < range.x + range.width &&
          p.y >= range.y &&
          p.y < range.y + range.height
        ) {
          result.push(p)
        }
      }
      return
    }

    this.northeast!.queryRangeInto(range, result)
    this.northwest!.queryRangeInto(range, result)
    this.southeast!.queryRangeInto(range, result)
    this.southwest!.queryRangeInto(range, result)
  }

  queryPoint(x: number, y: number): QuadTreePoint<T> | undefined {
    if (!this.contains(x, y)) return undefined

    if (!this.divided) {
      return this.points.find((p) => p.x === x && p.y === y)
    }

    return (
      this.northeast!.queryPoint(x, y) ??
      this.northwest!.queryPoint(x, y) ??
      this.southeast!.queryPoint(x, y) ??
      this.southwest!.queryPoint(x, y)
    )
  }

  queryRadius(cx: number, cy: number, radius: number): QuadTreePoint<T>[] {
    const range: Rect = {
      x: cx - radius - 1e-9,
      y: cy - radius - 1e-9,
      width: radius * 2 + 2e-9,
      height: radius * 2 + 2e-9,
    }
    const candidates = this.queryRange(range)
    const r2 = radius * radius
    return candidates.filter((p) => {
      const dx = p.x - cx
      const dy = p.y - cy
      return dx * dx + dy * dy <= r2
    })
  }

  nearest(x: number, y: number, k: number = 1): Array<QuadTreePoint<T> & { distance: number }> {
    const all = this.toArray()
    const withDist = all.map((p) => {
      const dx = p.x - x
      const dy = p.y - y
      return { ...p, distance: Math.sqrt(dx * dx + dy * dy) }
    })
    withDist.sort((a, b) => a.distance - b.distance)
    return withDist.slice(0, k)
  }

  get size(): number {
    if (!this.divided) return this.points.length
    return (
      this.northeast!.size +
      this.northwest!.size +
      this.southeast!.size +
      this.southwest!.size
    )
  }

  get depth(): number {
    if (!this.divided) return this.points.length > 0 ? 1 : 0
    return (
      1 +
      Math.max(
        this.northeast!.depth,
        this.northwest!.depth,
        this.southeast!.depth,
        this.southwest!.depth,
      )
    )
  }

  getBounds(): Rect {
    return { ...this.bounds }
  }

  clear(): void {
    this.points = []
    this.divided = false
    this.northeast = null
    this.northwest = null
    this.southeast = null
    this.southwest = null
  }

  forEach(callback: (point: QuadTreePoint<T>) => void): void {
    if (!this.divided) {
      for (const p of this.points) callback(p)
      return
    }
    this.northeast!.forEach(callback)
    this.northwest!.forEach(callback)
    this.southeast!.forEach(callback)
    this.southwest!.forEach(callback)
  }

  toArray(): QuadTreePoint<T>[] {
    const result: QuadTreePoint<T>[] = []
    this.forEach((p) => result.push(p))
    return result
  }

  private countNodes(): number {
    if (!this.divided) return 1
    return (
      1 +
      this.northeast!.countNodes() +
      this.northwest!.countNodes() +
      this.southeast!.countNodes() +
      this.southwest!.countNodes()
    )
  }

  getStats(): QuadTreeStats {
    return {
      size: this.size,
      depth: this.depth,
      nodeCount: this.countNodes(),
      bounds: this.getBounds(),
    }
  }

  static from<T = undefined>(
    points: Array<{ x: number; y: number; value?: T }>,
    options: QuadTreeOptions<T>,
  ): QuadTree<T> {
    const tree = new QuadTree<T>(options)
    for (const p of points) {
      tree.insert(p.x, p.y, p.value)
    }
    return tree
  }
}

export { DEFAULT_CAPACITY } from './types.js'
export type { Rect, QuadTreePoint, QuadTreeOptions, QuadTreeStats } from './types.js'
