import type { KDPoint, KDTreeOptions, DistanceFunction } from './types.js'
import { DEFAULT_KDTREE_OPTIONS } from './types.js'

interface KDTreeNode {
  point: KDPoint
  left: KDTreeNode | null
  right: KDTreeNode | null
  axis: number
}

export class KDTree {
  private root: KDTreeNode | null = null
  private _size: number = 0
  private _dimensions: number
  private _distance: DistanceFunction

  constructor(points?: KDPoint[], dimensions?: number, options?: Partial<KDTreeOptions>) {
    const merged = { ...DEFAULT_KDTREE_OPTIONS, ...options }
    this._dimensions = dimensions ?? merged.dimensions
    this._distance = merged.distance
    if (points && points.length > 0) {
      const first = points[0]!
      if (first.length > this._dimensions) {
        this._dimensions = first.length
      }
      const copied = points.map((p) => [...p])
      this._size = copied.length
      this.root = this._buildBalanced(copied, 0)
    }
  }

  private _buildBalanced(points: KDPoint[], depth: number): KDTreeNode | null {
    if (points.length === 0) return null
    const axis = depth % this._dimensions
    points.sort((a, b) => a[axis]! - b[axis]!)
    const mid = Math.floor(points.length / 2)
    return {
      point: points[mid]!,
      axis,
      left: this._buildBalanced(points.slice(0, mid), depth + 1),
      right: this._buildBalanced(points.slice(mid + 1), depth + 1),
    }
  }

  insert(point: KDPoint): void {
    if (this._size > 0 && point.length !== this._dimensions) {
      throw new Error(`Point must have ${this._dimensions} dimensions`)
    }
    if (this._size === 0 && point.length > this._dimensions) {
      this._dimensions = point.length
    }
    this.root = this._insertNode(this.root, [...point], 0)
    this._size++
  }

  private _insertNode(node: KDTreeNode | null, point: KDPoint, depth: number): KDTreeNode {
    if (node === null) {
      return { point, left: null, right: null, axis: depth % this._dimensions }
    }
    const axis = node.axis
    if (point[axis]! < node.point[axis]!) {
      node.left = this._insertNode(node.left, point, depth + 1)
    } else {
      node.right = this._insertNode(node.right, point, depth + 1)
    }
    return node
  }

  remove(point: KDPoint): boolean {
    const result = { removed: false }
    this.root = this._removeNode(this.root, point, result)
    if (result.removed) this._size--
    return result.removed
  }

  private _removeNode(
    node: KDTreeNode | null,
    point: KDPoint,
    result: { removed: boolean },
  ): KDTreeNode | null {
    if (node === null) return null
    if (this._pointsEqual(node.point, point)) {
      result.removed = true
      if (node.right !== null) {
        const min = this._findMin(node.right, node.axis)
        node.point = min.point
        node.right = this._removeNode(node.right, min.point, { removed: false })
      } else if (node.left !== null) {
        const min = this._findMin(node.left, node.axis)
        node.point = min.point
        node.right = this._removeNode(node.left, min.point, { removed: false })
        node.left = null
      } else {
        return null
      }
      return node
    }
    const axis = node.axis
    if (point[axis]! < node.point[axis]!) {
      node.left = this._removeNode(node.left, point, result)
    } else {
      node.right = this._removeNode(node.right, point, result)
    }
    return node
  }

  private _findMin(node: KDTreeNode, axis: number): KDTreeNode {
    if (node.axis === axis) {
      if (node.left === null) return node
      return this._findMin(node.left, axis)
    }
    let min = node
    if (node.left !== null) {
      const leftMin = this._findMin(node.left, axis)
      if (leftMin.point[axis]! < min.point[axis]!) min = leftMin
    }
    if (node.right !== null) {
      const rightMin = this._findMin(node.right, axis)
      if (rightMin.point[axis]! < min.point[axis]!) min = rightMin
    }
    return min
  }

  search(point: KDPoint): KDPoint | undefined {
    const node = this._searchNode(this.root, point)
    if (node === null) return undefined
    return [...node.point]
  }

  private _searchNode(node: KDTreeNode | null, point: KDPoint): KDTreeNode | null {
    if (node === null) return null
    if (this._pointsEqual(node.point, point)) return node
    const axis = node.axis
    if (point[axis]! < node.point[axis]!) {
      return this._searchNode(node.left, point)
    }
    return this._searchNode(node.right, point)
  }

  nearestNeighbor(query: KDPoint): KDPoint | undefined {
    if (this.root === null) return undefined
    const state: { best: KDTreeNode; bestDist: number } = {
      best: this.root,
      bestDist: this._distance(this.root.point, query),
    }
    this._nnSearch(this.root, query, state)
    return [...state.best.point]
  }

  private _nnSearch(
    node: KDTreeNode,
    target: KDPoint,
    state: { best: KDTreeNode; bestDist: number },
  ): void {
    const dist = this._distance(node.point, target)
    if (dist < state.bestDist) {
      state.bestDist = dist
      state.best = node
    }
    const axis = node.axis
    const diff = target[axis]! - node.point[axis]!
    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left
    if (first !== null) {
      this._nnSearch(first, target, state)
    }
    if (second !== null) {
      const planeDist = this._axisDistance(target, node.point, axis)
      if (planeDist < state.bestDist) {
        this._nnSearch(second, target, state)
      }
    }
  }

  private _axisDistance(a: KDPoint, b: KDPoint, axis: number): number {
    const pa: KDPoint = []
    const pb: KDPoint = []
    for (let i = 0; i < this._dimensions; i++) {
      pa.push(i === axis ? a[i]! : 0)
      pb.push(i === axis ? b[i]! : 0)
    }
    return this._distance(pa, pb)
  }

  kNearestNeighbors(query: KDPoint, k: number): KDPoint[] {
    if (this.root === null || k <= 0) return []
    const results: Array<{ node: KDTreeNode; dist: number }> = []
    this._knnSearch(this.root, query, k, results)
    return results.map((r) => [...r.node.point])
  }

  private _knnSearch(
    node: KDTreeNode,
    target: KDPoint,
    k: number,
    results: Array<{ node: KDTreeNode; dist: number }>,
  ): void {
    const dist = this._distance(node.point, target)
    this._insertSorted(results, { node, dist }, k)
    const axis = node.axis
    const diff = target[axis]! - node.point[axis]!
    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left
    if (first !== null) {
      this._knnSearch(first, target, k, results)
    }
    if (second !== null) {
      const maxDist = results.length < k ? Infinity : results[results.length - 1]!.dist
      const planeDist = this._axisDistance(target, node.point, axis)
      if (planeDist < maxDist) {
        this._knnSearch(second, target, k, results)
      }
    }
  }

  private _insertSorted(
    results: Array<{ node: KDTreeNode; dist: number }>,
    entry: { node: KDTreeNode; dist: number },
    k: number,
  ): void {
    let i = results.length
    results.push(entry)
    while (i > 0 && results[i]!.dist < results[i - 1]!.dist) {
      const tmp = results[i]!
      results[i] = results[i - 1]!
      results[i - 1] = tmp
      i--
    }
    if (results.length > k) {
      results.pop()
    }
  }

  rangeSearch(min: KDPoint, max: KDPoint): KDPoint[] {
    const results: KDPoint[] = []
    this._rangeSearchNode(this.root, min, max, results)
    return results
  }

  private _rangeSearchNode(
    node: KDTreeNode | null,
    min: KDPoint,
    max: KDPoint,
    results: KDPoint[],
  ): void {
    if (node === null) return
    let inRange = true
    for (let i = 0; i < this._dimensions; i++) {
      if (node.point[i]! < min[i]! || node.point[i]! > max[i]!) {
        inRange = false
        break
      }
    }
    if (inRange) {
      results.push([...node.point])
    }
    const axis = node.axis
    if (min[axis]! <= node.point[axis]!) {
      this._rangeSearchNode(node.left, min, max, results)
    }
    if (max[axis]! >= node.point[axis]!) {
      this._rangeSearchNode(node.right, min, max, results)
    }
  }

  pointsWithin(query: KDPoint, radius: number): KDPoint[] {
    const results: KDPoint[] = []
    this._pointsWithinNode(this.root, query, radius, results)
    return results
  }

  private _pointsWithinNode(
    node: KDTreeNode | null,
    query: KDPoint,
    radius: number,
    results: KDPoint[],
  ): void {
    if (node === null) return
    const dist = this._distance(node.point, query)
    if (dist <= radius) {
      results.push([...node.point])
    }
    const axis = node.axis
    const diff = query[axis]! - node.point[axis]!
    const planeDist = this._axisDistance(query, node.point, axis)
    if (diff < 0 || planeDist <= radius) {
      this._pointsWithinNode(node.left, query, radius, results)
    }
    if (diff >= 0 || planeDist <= radius) {
      this._pointsWithinNode(node.right, query, radius, results)
    }
  }

  get size(): number {
    return this._size
  }

  get dimensions(): number {
    return this._dimensions
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): KDPoint[] {
    const result: KDPoint[] = []
    this._inOrderTraversal(this.root, result)
    return result
  }

  private _inOrderTraversal(node: KDTreeNode | null, result: KDPoint[]): void {
    if (node === null) return
    this._inOrderTraversal(node.left, result)
    result.push([...node.point])
    this._inOrderTraversal(node.right, result)
  }

  clone(): KDTree {
    const cloned = new KDTree(undefined, this._dimensions, { distance: this._distance })
    cloned._size = this._size
    cloned.root = this._cloneNode(this.root)
    return cloned
  }

  private _cloneNode(node: KDTreeNode | null): KDTreeNode | null {
    if (node === null) return null
    return {
      point: [...node.point],
      axis: node.axis,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
    }
  }

  forEach(callback: (point: KDPoint, index: number) => void): void {
    let index = 0
    this._forEachNode(this.root, callback, index)
    void index
  }

  private _forEachNode(
    node: KDTreeNode | null,
    callback: (point: KDPoint, index: number) => void,
    startIndex: number,
  ): number {
    if (node === null) return startIndex
    let idx = this._forEachNode(node.left, callback, startIndex)
    callback([...node.point], idx)
    idx++
    return this._forEachNode(node.right, callback, idx)
  }

  *[Symbol.iterator](): Iterator<KDPoint> {
    const stack: KDTreeNode[] = []
    let current: KDTreeNode | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield [...current.point]
      current = current.right
    }
  }

  static fromPoints(points: KDPoint[], dimensions?: number, options?: Partial<KDTreeOptions>): KDTree {
    return new KDTree(points, dimensions, options)
  }

  balance(): void {
    if (this._size <= 1) return
    const points = this.toArray()
    this.root = this._buildBalanced(points.map((p) => [...p]), 0)
  }

  private _pointsEqual(a: KDPoint, b: KDPoint): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i]! !== b[i]!) return false
    }
    return true
  }

  toString(): string {
    return `${KDTree}({ size: ${this.size} })`
  }
}

export { euclideanSquared } from './types.js'
export type { KDPoint, KDTreeOptions, DistanceFunction } from './types.js'
