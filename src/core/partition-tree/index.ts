import type { PartitionPoint, Rectangle } from './types.js'

interface PTNode<T> {
  minX: number
  maxX: number
  ySorted: PartitionPoint<T>[]
  left: PTNode<T> | null
  right: PTNode<T> | null
}

export class PartitionTree<T = undefined> {
  private _points: PartitionPoint<T>[]
  private root: PTNode<T> | null
  private _dirty: boolean

  constructor(points: Array<{ x: number; y: number; data?: T }> = []) {
    this._points = points.map((p) => ({ ...p }))
    this._dirty = true
    this.root = null
    this.ensureBuilt()
  }

  private ensureBuilt(): void {
    if (this._dirty) {
      this.root = this._points.length > 0 ? this._build(this._points) : null
      this._dirty = false
    }
  }

  private _build(points: PartitionPoint<T>[]): PTNode<T> {
    const sortedByX = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
    return this._buildNode(sortedByX)
  }

  private _buildNode(sortedByX: PartitionPoint<T>[]): PTNode<T> {
    const ySorted = [...sortedByX].sort((a, b) => a.y - b.y || a.x - b.x)
    if (sortedByX.length <= 1) {
      const x = sortedByX.length === 1 ? sortedByX[0]!.x : 0
      return { minX: x, maxX: x, ySorted, left: null, right: null }
    }
    const mid = Math.floor(sortedByX.length / 2)
    const left = this._buildNode(sortedByX.slice(0, mid))
    const right = this._buildNode(sortedByX.slice(mid))
    return {
      minX: sortedByX[0]!.x,
      maxX: sortedByX[sortedByX.length - 1]!.x,
      ySorted,
      left,
      right,
    }
  }

  queryRange(rect: Rectangle): PartitionPoint<T>[] {
    this.ensureBuilt()
    if (!this.root) return []
    const results: PartitionPoint<T>[] = []
    this._queryRange(this.root, rect, results)
    return results
  }

  private _queryRange(node: PTNode<T> | null, rect: Rectangle, results: PartitionPoint<T>[]): void {
    if (!node) return
    if (rect.maxX < node.minX || rect.minX > node.maxX) return
    if (rect.minX <= node.minX && rect.maxX >= node.maxX) {
      this._collectY(node.ySorted, rect, results)
      return
    }
    this._queryRange(node.left, rect, results)
    this._queryRange(node.right, rect, results)
  }

  private _collectY(ySorted: PartitionPoint<T>[], rect: Rectangle, results: PartitionPoint<T>[]): void {
    const lo = this._lowerBound(ySorted, rect.minY)
    for (let i = lo; i < ySorted.length && ySorted[i]!.y <= rect.maxY; i++) {
      results.push({ ...ySorted[i]! })
    }
  }

  countRange(rect: Rectangle): number {
    this.ensureBuilt()
    if (!this.root) return 0
    return this._countRange(this.root, rect)
  }

  private _countRange(node: PTNode<T> | null, rect: Rectangle): number {
    if (!node) return 0
    if (rect.maxX < node.minX || rect.minX > node.maxX) return 0
    if (rect.minX <= node.minX && rect.maxX >= node.maxX) {
      return this._upperBound(node.ySorted, rect.maxY) - this._lowerBound(node.ySorted, rect.minY)
    }
    return this._countRange(node.left, rect) + this._countRange(node.right, rect)
  }

  private _lowerBound(arr: PartitionPoint<T>[], y: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (arr[mid]!.y < y) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private _upperBound(arr: PartitionPoint<T>[], y: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (arr[mid]!.y <= y) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  get size(): number {
    return this._points.length
  }

  get isEmpty(): boolean {
    return this._points.length === 0
  }

  toArray(): PartitionPoint<T>[] {
    return this._points.map((p) => ({ ...p }))
  }

  forEach(callback: (point: PartitionPoint<T>, index: number) => void): void {
    for (let i = 0; i < this._points.length; i++) {
      callback({ ...this._points[i]! }, i)
    }
  }

  *[Symbol.iterator](): Iterator<PartitionPoint<T>> {
    for (const p of this._points) {
      yield { ...p }
    }
  }

  clone(): PartitionTree<T> {
    return new PartitionTree(this._points.map((p) => ({ ...p })))
  }

  static fromArray<T = undefined>(points: Array<{ x: number; y: number; data?: T }>): PartitionTree<T> {
    return new PartitionTree(points)
  }

  contains(x: number, y: number): boolean {
    return this._points.some((p) => p.x === x && p.y === y)
  }

  nearest(x: number, y: number): PartitionPoint<T> | undefined {
    if (this._points.length === 0) return undefined
    let best = this._points[0]!
    let bestDist = this._distSq(best, x, y)
    for (let i = 1; i < this._points.length; i++) {
      const d = this._distSq(this._points[i]!, x, y)
      if (d < bestDist) {
        bestDist = d
        best = this._points[i]!
      }
    }
    return { ...best }
  }

  kNearest(x: number, y: number, k: number): PartitionPoint<T>[] {
    if (k <= 0 || this._points.length === 0) return []
    const sorted = [...this._points].sort((a, b) => this._distSq(a, x, y) - this._distSq(b, x, y))
    return sorted.slice(0, Math.min(k, sorted.length)).map((p) => ({ ...p }))
  }

  private _distSq(p: PartitionPoint<T>, x: number, y: number): number {
    const dx = p.x - x
    const dy = p.y - y
    return dx * dx + dy * dy
  }

  addPoint(point: { x: number; y: number; data?: T }): void {
    this._points.push({ ...point })
    this._dirty = true
  }

  removePoint(x: number, y: number): boolean {
    const idx = this._points.findIndex((p) => p.x === x && p.y === y)
    if (idx === -1) return false
    this._points.splice(idx, 1)
    this._dirty = true
    return true
  }

  clear(): void {
    this._points = []
    this.root = null
    this._dirty = false
  }

  bounds(): Rectangle | undefined {
    if (this._points.length === 0) return undefined
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const p of this._points) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    return { minX, maxX, minY, maxY }
  }

  has(x: number, y: number): boolean {
    return this.contains(x, y)
  }

  toString(): string {
    return `PartitionTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PartitionTree', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'PartitionTree'
  }

  includes(x: number, y: number): boolean {
    return this.contains(x, y)
  }
}

export type { PartitionPoint, Rectangle } from './types.js'
