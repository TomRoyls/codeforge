import type { Point2D, Rect2D, QuadTree2Options } from './types.js'
import { DEFAULT_QUADTREE2_OPTIONS } from './types.js'

interface StoredPoint<T> {
  x: number
  y: number
  data: T | undefined
}

interface QuadTreeNode<T> {
  bounds: Rect2D
  points: Array<StoredPoint<T>>
  children: [QuadTreeNode<T>, QuadTreeNode<T>, QuadTreeNode<T>, QuadTreeNode<T>] | null
}

export class QuadTree2<T = undefined> {
  private _root: QuadTreeNode<T>
  private _size: number = 0
  private _capacity: number
  private _maxDepth: number
  private _depth: number = 0

  constructor(
    options?: {
      bounds?: { x: number; y: number; width: number; height: number }
      capacity?: number
      maxDepth?: number
    },
  ) {
    const merged: QuadTree2Options = {
      bounds: { ...DEFAULT_QUADTREE2_OPTIONS.bounds, ...(options?.bounds ?? {}) },
      capacity: options?.capacity ?? DEFAULT_QUADTREE2_OPTIONS.capacity,
      maxDepth: options?.maxDepth ?? DEFAULT_QUADTREE2_OPTIONS.maxDepth,
    }
    this._capacity = merged.capacity
    this._maxDepth = merged.maxDepth
    this._root = {
      bounds: { ...merged.bounds },
      points: [],
      children: null,
    }
  }

  insert(point: { x: number; y: number; data?: T }): void {
    const stored: StoredPoint<T> = { x: point.x, y: point.y, data: (point as { data?: T }).data }
    this._insertPoint(this._root, stored, 0)
    this._size++
  }

  private _insertPoint(node: QuadTreeNode<T>, point: StoredPoint<T>, depth: number): void {
    if (node.children !== null) {
      const idx = this._quadrantIndex(node.bounds, point.x, point.y)
      this._insertPoint(node.children[idx]!, point, depth + 1)
      return
    }

    node.points.push(point)

    if (node.points.length > this._capacity && depth < this._maxDepth) {
      this._subdivide(node, depth)
    }
  }

  private _subdivide(node: QuadTreeNode<T>, depth: number): void {
    const { x, y, width, height } = node.bounds
    const hw = width / 2
    const hh = height / 2

    const nw: QuadTreeNode<T> = { bounds: { x, y, width: hw, height: hh }, points: [], children: null }
    const ne: QuadTreeNode<T> = { bounds: { x: x + hw, y, width: hw, height: hh }, points: [], children: null }
    const sw: QuadTreeNode<T> = { bounds: { x, y: y + hh, width: hw, height: hh }, points: [], children: null }
    const se: QuadTreeNode<T> = { bounds: { x: x + hw, y: y + hh, width: hw, height: hh }, points: [], children: null }

    node.children = [nw, ne, sw, se]

    const newDepth = depth + 1
    if (newDepth > this._depth) {
      this._depth = newDepth
    }

    const pts = node.points
    node.points = []

    for (const p of pts) {
      const idx = this._quadrantIndex(node.bounds, p.x, p.y)
      this._insertPoint(node.children[idx]!, p, newDepth)
    }
  }

  private _quadrantIndex(bounds: Rect2D, px: number, py: number): number {
    const midX = bounds.x + bounds.width / 2
    const midY = bounds.y + bounds.height / 2
    if (px < midX) {
      return py < midY ? 0 : 2
    }
    return py < midY ? 1 : 3
  }

  remove(point: { x: number; y: number }): boolean {
    const result = this._removePoint(this._root, point.x, point.y)
    if (result) this._size--
    return result
  }

  private _removePoint(node: QuadTreeNode<T>, px: number, py: number): boolean {
    if (node.children !== null) {
      const idx = this._quadrantIndex(node.bounds, px, py)
      return this._removePoint(node.children[idx]!, px, py)
    }

    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i]!
      if (p.x === px && p.y === py) {
        node.points.splice(i, 1)
        return true
      }
    }
    return false
  }

  contains(point: { x: number; y: number }): boolean {
    return this._containsPoint(this._root, point.x, point.y)
  }

  private _containsPoint(node: QuadTreeNode<T>, px: number, py: number): boolean {
    if (node.children !== null) {
      const idx = this._quadrantIndex(node.bounds, px, py)
      return this._containsPoint(node.children[idx]!, px, py)
    }

    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i]!
      if (p.x === px && p.y === py) return true
    }
    return false
  }

  query(region: { x: number; y: number; width: number; height: number }): Array<{ x: number; y: number; data?: T }> {
    const results: Array<{ x: number; y: number; data?: T }> = []
    this._queryRect(this._root, region, results)
    return results
  }

  private _queryRect(
    node: QuadTreeNode<T>,
    region: { x: number; y: number; width: number; height: number },
    results: Array<{ x: number; y: number; data?: T }>,
  ): void {
    if (!this._rectsOverlap(node.bounds, region)) return

    if (node.children !== null) {
      for (const child of node.children) {
        this._queryRect(child, region, results)
      }
      return
    }

    const rx = region.x
    const ry = region.y
    const rx2 = region.x + region.width
    const ry2 = region.y + region.height

    for (const p of node.points) {
      if (p.x >= rx && p.x <= rx2 && p.y >= ry && p.y <= ry2) {
        results.push({ x: p.x, y: p.y, data: p.data })
      }
    }
  }

  private _rectsOverlap(a: Rect2D, b: { x: number; y: number; width: number; height: number }): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  queryRadius(cx: number, cy: number, r: number): Array<{ x: number; y: number; data?: T }> {
    const results: Array<{ x: number; y: number; data?: T }> = []
    const r2 = r * r
    this._queryRadiusNode(this._root, cx, cy, r, r2, results)
    return results
  }

  private _queryRadiusNode(
    node: QuadTreeNode<T>,
    cx: number,
    cy: number,
    r: number,
    r2: number,
    results: Array<{ x: number; y: number; data?: T }>,
  ): void {
    const boundingRect = { x: cx - r, y: cy - r, width: r * 2, height: r * 2 }
    if (!this._rectsOverlap(node.bounds, boundingRect)) return

    if (node.children !== null) {
      for (const child of node.children) {
        this._queryRadiusNode(child, cx, cy, r, r2, results)
      }
      return
    }

    for (const p of node.points) {
      const dx = p.x - cx
      const dy = p.y - cy
      if (dx * dx + dy * dy <= r2) {
        results.push({ x: p.x, y: p.y, data: p.data })
      }
    }
  }

  queryNearest(point: { x: number; y: number }, k: number): Array<{ x: number; y: number; data?: T }> {
    if (k <= 0) return []

    const candidates: Array<{ point: StoredPoint<T>; dist2: number }> = []
    const maxDist2: [number] = [Infinity]
    this._collectNearest(this._root, point.x, point.y, k, candidates, maxDist2)
    candidates.sort((a, b) => a.dist2 - b.dist2)

    return candidates.slice(0, k).map((c) => ({ x: c.point.x, y: c.point.y, data: c.point.data }))
  }

  private _collectNearest(
    node: QuadTreeNode<T>,
    px: number,
    py: number,
    k: number,
    candidates: Array<{ point: StoredPoint<T>; dist2: number }>,
    maxDist2: [number],
  ): void {
    const nearestCornerDist2 = this._nearestCornerDist2(node.bounds, px, py)
    if (nearestCornerDist2 > maxDist2[0]) return

    if (node.children !== null) {
      const sorted = node.children.slice().sort((a, b) => {
        const da = this._nearestCornerDist2(a.bounds, px, py)
        const db = this._nearestCornerDist2(b.bounds, px, py)
        return da - db
      })
      for (const child of sorted) {
        this._collectNearest(child, px, py, k, candidates, maxDist2)
      }
      return
    }

    for (const p of node.points) {
      const dx = p.x - px
      const dy = p.y - py
      const d2 = dx * dx + dy * dy
      if (candidates.length < k) {
        candidates.push({ point: p, dist2: d2 })
        if (candidates.length === k) {
          candidates.sort((a, b) => a.dist2 - b.dist2)
          maxDist2[0] = candidates[candidates.length - 1]!.dist2
        }
      } else if (d2 < maxDist2[0]) {
        candidates[candidates.length - 1] = { point: p, dist2: d2 }
        let i = candidates.length - 1
        while (i > 0 && candidates[i]!.dist2 < candidates[i - 1]!.dist2) {
          const tmp = candidates[i]!
          candidates[i] = candidates[i - 1]!
          candidates[i - 1] = tmp
          i--
        }
        maxDist2[0] = candidates[candidates.length - 1]!.dist2
      }
    }
  }

  private _nearestCornerDist2(bounds: Rect2D, px: number, py: number): number {
    const cx = px < bounds.x ? bounds.x : px > bounds.x + bounds.width ? bounds.x + bounds.width : px
    const cy = py < bounds.y ? bounds.y : py > bounds.y + bounds.height ? bounds.y + bounds.height : py
    const dx = px - cx
    const dy = py - cy
    return dx * dx + dy * dy
  }

  nearest(point: { x: number; y: number }): { x: number; y: number; data?: T } | undefined {
    const results = this.queryNearest(point, 1)
    return results[0]
  }

  within(point: { x: number; y: number }, distance: number): Array<{ x: number; y: number; data?: T }> {
    return this.queryRadius(point.x, point.y, distance)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  count(): number {
    return this._size
  }

  clear(): void {
    this._root = {
      bounds: { ...this._root.bounds },
      points: [],
      children: null,
    }
    this._size = 0
    this._depth = 0
  }

  toArray(): Array<{ x: number; y: number; data?: T }> {
    const results: Array<{ x: number; y: number; data?: T }> = []
    this._collectAll(this._root, results)
    return results
  }

  all(): Array<{ x: number; y: number; data?: T }> {
    return this.toArray()
  }

  private _collectAll(node: QuadTreeNode<T>, results: Array<{ x: number; y: number; data?: T }>): void {
    if (node.children !== null) {
      for (const child of node.children) {
        this._collectAll(child, results)
      }
      return
    }
    for (const p of node.points) {
      results.push({ x: p.x, y: p.y, data: p.data })
    }
  }

  forEach(callback: (point: { x: number; y: number; data?: T }, index: number) => void): void {
    let index = 0
    this._forEachNode(this._root, callback, () => index)
    index = 0
    this._forEachNodeExecute(this._root, callback, { value: 0 })
  }

  private _forEachNodeExecute(
    node: QuadTreeNode<T>,
    callback: (point: { x: number; y: number; data?: T }, index: number) => void,
    counter: { value: number },
  ): void {
    if (node.children !== null) {
      for (const child of node.children) {
        this._forEachNodeExecute(child, callback, counter)
      }
      return
    }
    for (const p of node.points) {
      callback({ x: p.x, y: p.y, data: p.data }, counter.value++)
    }
  }

  private _forEachNode(
    _node: QuadTreeNode<T>,
    _callback: (point: { x: number; y: number; data?: T }, index: number) => void,
    _getIndex: () => number,
  ): void {
  }

  *[Symbol.iterator](): Iterator<{ x: number; y: number; data?: T }> {
    const stack: QuadTreeNode<T>[] = [this._root]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (node.children !== null) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]!)
        }
      } else {
        for (const p of node.points) {
          yield { x: p.x, y: p.y, data: p.data }
        }
      }
    }
  }

  clone(): QuadTree2<T> {
    const cloned = new QuadTree2<T>({
      bounds: { ...this._root.bounds },
      capacity: this._capacity,
      maxDepth: this._maxDepth,
    })
    cloned._size = this._size
    cloned._depth = this._depth
    cloned._root = this._cloneNode(this._root)
    return cloned
  }

  private _cloneNode(node: QuadTreeNode<T>): QuadTreeNode<T> {
    const cloned: QuadTreeNode<T> = {
      bounds: { ...node.bounds },
      points: node.points.map((p) => ({ ...p })),
      children: null,
    }
    if (node.children !== null) {
      cloned.children = [
        this._cloneNode(node.children[0]),
        this._cloneNode(node.children[1]),
        this._cloneNode(node.children[2]),
        this._cloneNode(node.children[3]),
      ]
    }
    return cloned
  }

  static fromArray<T>(
    points: Array<{ x: number; y: number; data?: T }>,
    options?: {
      bounds?: { x: number; y: number; width: number; height: number }
      capacity?: number
      maxDepth?: number
    },
  ): QuadTree2<T> {
    const tree = new QuadTree2<T>(options)
    for (const p of points) {
      tree.insert(p)
    }
    return tree
  }

  get bounds(): Rect2D {
    return { ...this._root.bounds }
  }

  get depth(): number {
    return this._depth
  }

  has(point: { x: number; y: number }): boolean {
    return this.contains(point)
  }

  toString(): string {
    return `QuadTree2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'QuadTree2', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'QuadTree2'
  }

  includes(point: { x: number; y: number }): boolean {
    return this.contains(point)
  }

  nonEmpty(): boolean {
    return !this.isEmpty
  }
}

export type { Point2D, Rect2D, QuadTree2Options }
