export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface QuadPoint<T> {
  x: number
  y: number
  data: T
}

export class Quadtree<T> {
  private boundary: Rect
  private capacity: number
  private points: Array<QuadPoint<T>> = []
  private divided: boolean = false
  private northwest: Quadtree<T> | null = null
  private northeast: Quadtree<T> | null = null
  private southwest: Quadtree<T> | null = null
  private southeast: Quadtree<T> | null = null

  constructor(boundary: Rect, capacity: number = 4) {
    this.boundary = boundary
    this.capacity = capacity
  }

  insert(point: QuadPoint<T>): boolean {
    if (!this.contains(point)) return false
    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point)
      return true
    }
    if (!this.divided) this.subdivide()
    return (
      this.northwest!.insert(point)
      || this.northeast!.insert(point)
      || this.southwest!.insert(point)
      || this.southeast!.insert(point)
    )
  }

  query(range: Rect): Array<QuadPoint<T>> {
    const result: Array<QuadPoint<T>> = []
    this.queryRange(range, result)
    return result
  }

  findAll(): Array<QuadPoint<T>> {
    return this.query(this.boundary)
  }

  get size(): number {
    let count = this.points.length
    if (this.divided) {
      count += this.northwest!.size
      count += this.northeast!.size
      count += this.southwest!.size
      count += this.southeast!.size
    }
    return count
  }

  get depth(): number {
    if (!this.divided) return 1
    return 1 + Math.max(
      this.northwest!.depth,
      this.northeast!.depth,
      this.southwest!.depth,
      this.southeast!.depth,
    )
  }

  private subdivide(): void {
    const { x, y, w, h } = this.boundary
    const hw = w / 2
    const hh = h / 2
    this.northwest = new Quadtree({ x: x, y: y, w: hw, h: hh }, this.capacity)
    this.northeast = new Quadtree({ x: x + hw, y: y, w: hw, h: hh }, this.capacity)
    this.southwest = new Quadtree({ x: x, y: y + hh, w: hw, h: hh }, this.capacity)
    this.southeast = new Quadtree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity)
    this.divided = true
    for (const p of this.points) {
      this.insert(p)
    }
    this.points = []
  }

  private contains(point: QuadPoint<T>): boolean {
    const { x, y, w, h } = this.boundary
    return point.x >= x && point.x < x + w && point.y >= y && point.y < y + h
  }

  private intersects(range: Rect): boolean {
    const b = this.boundary
    return !(range.x > b.x + b.w || range.x + range.w < b.x || range.y > b.y + b.h || range.y + range.h < b.y)
  }

  private queryRange(range: Rect, result: Array<QuadPoint<T>>): void {
    if (!this.intersects(range)) return
    for (const p of this.points) {
      if (p.x >= range.x && p.x < range.x + range.w && p.y >= range.y && p.y < range.y + range.h) {
        result.push(p)
      }
    }
    if (this.divided) {
      this.northwest!.queryRange(range, result)
      this.northeast!.queryRange(range, result)
      this.southwest!.queryRange(range, result)
      this.southeast!.queryRange(range, result)
    }
  }
}
