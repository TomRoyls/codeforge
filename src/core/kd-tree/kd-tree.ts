import type { KDTreeOptions, KDNode } from './types.js'
import { DEFAULT_KD_TREE_OPTIONS } from './types.js'

export class KDTree<T> {
  private root: KDNode<T> | null = null
  private _size: number = 0
  private dimensions: number

  constructor(options?: Partial<KDTreeOptions>) {
    const opts: KDTreeOptions = { ...DEFAULT_KD_TREE_OPTIONS, ...options }
    this.dimensions = opts.dimensions
  }

  insert(point: number[], value: T): void {
    this.root = this._insertNode(this.root, point, value, 0)
    this._size++
  }

  private _insertNode(node: KDNode<T> | null, point: number[], value: T, depth: number): KDNode<T> {
    if (node === null) {
      return { point, value, left: null, right: null, axis: depth % this.dimensions }
    }
    const axis = node.axis
    if (point[axis]! < node.point[axis]!) {
      node.left = this._insertNode(node.left, point, value, depth + 1)
    } else {
      node.right = this._insertNode(node.right, point, value, depth + 1)
    }
    return node
  }

  search(point: number[]): T | undefined {
    const node = this._searchNode(this.root, point)
    return node?.value
  }

  private _searchNode(node: KDNode<T> | null, point: number[]): KDNode<T> | null {
    if (node === null) return null
    if (this._pointsEqual(node.point, point)) return node
    const axis = node.axis
    if (point[axis]! < node.point[axis]!) {
      return this._searchNode(node.left, point)
    }
    return this._searchNode(node.right, point)
  }

  private _pointsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i]! !== b[i]!) return false
    }
    return true
  }

  nearestNeighbor(point: number[]): { point: number[]; value: T } | undefined {
    if (this.root === null) return undefined
    const state = { best: this.root as KDNode<T>, bestDist: this._squaredDistance(this.root.point, point) }
    this._nnSearch(this.root, point, state)
    return { point: state.best.point, value: state.best.value }
  }

  private _nnSearch(
    node: KDNode<T>,
    point: number[],
    state: { best: KDNode<T>; bestDist: number },
  ): void {
    const dist = this._squaredDistance(node.point, point)
    if (dist < state.bestDist) {
      state.best = node
      state.bestDist = dist
    }
    const axis = node.axis
    const diff = point[axis]! - node.point[axis]!
    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left
    if (first !== null) {
      this._nnSearch(first, point, state)
    }
    if (second !== null && diff * diff < state.bestDist) {
      this._nnSearch(second, point, state)
    }
  }

  kNearestNeighbors(point: number[], k: number): Array<{ point: number[]; value: T; distance: number }> {
    if (this.root === null || k <= 0) return []
    const results: Array<{ node: KDNode<T>; dist: number }> = []
    this._knnSearch(this.root, point, k, results)
    return results.map((r) => ({
      point: r.node.point,
      value: r.node.value,
      distance: Math.sqrt(r.dist),
    }))
  }

  private _knnSearch(
    node: KDNode<T>,
    target: number[],
    k: number,
    results: Array<{ node: KDNode<T>; dist: number }>,
  ): void {
    const dist = this._squaredDistance(node.point, target)
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
      if (diff * diff < maxDist) {
        this._knnSearch(second, target, k, results)
      }
    }
  }

  private _insertSorted(
    results: Array<{ node: KDNode<T>; dist: number }>,
    entry: { node: KDNode<T>; dist: number },
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

  rangeSearch(min: number[], max: number[]): Array<{ point: number[]; value: T }> {
    const results: Array<{ point: number[]; value: T }> = []
    this._rangeSearchNode(this.root, min, max, results)
    return results
  }

  private _rangeSearchNode(
    node: KDNode<T> | null,
    min: number[],
    max: number[],
    results: Array<{ point: number[]; value: T }>,
  ): void {
    if (node === null) return
    let inRange = true
    for (let i = 0; i < this.dimensions; i++) {
      if (node.point[i]! < min[i]! || node.point[i]! > max[i]!) {
        inRange = false
        break
      }
    }
    if (inRange) {
      results.push({ point: node.point, value: node.value })
    }
    const axis = node.axis
    if (min[axis]! <= node.point[axis]!) {
      this._rangeSearchNode(node.left, min, max, results)
    }
    if (max[axis]! >= node.point[axis]!) {
      this._rangeSearchNode(node.right, min, max, results)
    }
  }

  remove(point: number[]): boolean {
    const result = { removed: false }
    this.root = this._removeNode(this.root, point, result)
    if (result.removed) this._size--
    return result.removed
  }

  private _removeNode(node: KDNode<T> | null, point: number[], result: { removed: boolean }): KDNode<T> | null {
    if (node === null) return null
    if (this._pointsEqual(node.point, point)) {
      result.removed = true
      if (node.right !== null) {
        const min = this._findMin(node.right, node.axis)
        node.point = min.point
        node.value = min.value
        node.right = this._removeNode(node.right, min.point, { removed: false })
      } else if (node.left !== null) {
        const min = this._findMin(node.left, node.axis)
        node.point = min.point
        node.value = min.value
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

  private _findMin(node: KDNode<T>, axis: number): KDNode<T> {
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

  has(point: number[]): boolean {
    return this._searchNode(this.root, point) !== null
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  forEach(callback: (point: number[], value: T) => void): void {
    this._forEachNode(this.root, callback)
  }

  private _forEachNode(node: KDNode<T> | null, callback: (point: number[], value: T) => void): void {
    if (node === null) return
    this._forEachNode(node.left, callback)
    callback(node.point, node.value)
    this._forEachNode(node.right, callback)
  }

  private _squaredDistance(a: number[], b: number[]): number {
    let sum = 0
    for (let i = 0; i < this.dimensions; i++) {
      const diff = a[i]! - b[i]!
      sum += diff * diff
    }
    return sum
  }
}

export { DEFAULT_KD_TREE_OPTIONS } from './types.js'
export type { KDTreeOptions, KDNode, KDPoint } from './types.js'
