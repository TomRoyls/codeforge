import type { KDPoint, KDRect, KDTreeOptions, KDTreeNode } from './types.js'

export class KDTree {
  private root: KDTreeNode | null
  private _size = 0
  private _dimensions: number

  constructor(options?: KDTreeOptions) {
    this._dimensions = options?.dimensions ?? 2
    this.root = null
  }

  private pointsEqual(a: KDPoint, b: KDPoint): boolean {
    for (let i = 0; i < this._dimensions; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  private distanceSq(a: KDPoint, b: KDPoint): number {
    let d = 0
    for (let i = 0; i < this._dimensions; i++) {
      const diff = a[i]! - b[i]!
      d += diff * diff
    }
    return d
  }

  insert(point: KDPoint): boolean {
    if (point.length !== this._dimensions) return false
    this.root = this.insertNode(this.root, point, 0)
    this._size++
    return true
  }

  private insertNode(node: KDTreeNode | null, point: KDPoint, depth: number): KDTreeNode {
    if (node === null) {
      return { point, left: null, right: null }
    }
    const axis = depth % this._dimensions
    if (point[axis]! < node.point[axis]!) {
      node.left = this.insertNode(node.left, point, depth + 1)
    } else {
      node.right = this.insertNode(node.right, point, depth + 1)
    }
    return node
  }

  remove(point: KDPoint): boolean {
    if (point.length !== this._dimensions) return false
    const result = { removed: false }
    this.root = this.removeNode(this.root, point, 0, result)
    if (result.removed) {
      this._size--
      return true
    }
    return false
  }

  private removeNode(
    node: KDTreeNode | null,
    point: KDPoint,
    depth: number,
    result: { removed: boolean },
  ): KDTreeNode | null {
    if (node === null) return null

    const axis = depth % this._dimensions

    if (this.pointsEqual(point, node.point)) {
      result.removed = true
      if (node.right !== null) {
        const minNode = this.findMin(node.right, axis, depth + 1)
        node.point = minNode.point
        node.right = this.removeNode(node.right, minNode.point, depth + 1, { removed: false })
      } else if (node.left !== null) {
        const minNode = this.findMin(node.left, axis, depth + 1)
        node.point = minNode.point
        node.right = this.removeNode(node.left, minNode.point, depth + 1, { removed: false })
        node.left = null
      } else {
        return null
      }
    } else if (point[axis]! < node.point[axis]!) {
      node.left = this.removeNode(node.left, point, depth + 1, result)
    } else {
      node.right = this.removeNode(node.right, point, depth + 1, result)
    }
    return node
  }

  private findMin(node: KDTreeNode, axis: number, depth: number): KDTreeNode {
    const currentAxis = depth % this._dimensions

    if (currentAxis === axis) {
      if (node.left === null) return node
      return this.findMin(node.left, axis, depth + 1)
    }

    let min = node
    if (node.left !== null) {
      const leftMin = this.findMin(node.left, axis, depth + 1)
      if (leftMin.point[axis]! < min.point[axis]!) {
        min = leftMin
      }
    }
    if (node.right !== null) {
      const rightMin = this.findMin(node.right, axis, depth + 1)
      if (rightMin.point[axis]! < min.point[axis]!) {
        min = rightMin
      }
    }
    return min
  }

  contains(point: KDPoint): boolean {
    if (point.length !== this._dimensions) return false
    return this.containsNode(this.root, point, 0)
  }

  private containsNode(node: KDTreeNode | null, point: KDPoint, depth: number): boolean {
    if (node === null) return false
    if (this.pointsEqual(point, node.point)) return true
    const axis = depth % this._dimensions
    if (point[axis]! < node.point[axis]!) {
      return this.containsNode(node.left, point, depth + 1)
    }
    return this.containsNode(node.right, point, depth + 1)
  }

  nearest(point: KDPoint): KDPoint | undefined {
    if (this.root === null || point.length !== this._dimensions) return undefined
    let best: KDTreeNode = this.root
    let bestDist = this.distanceSq(point, this.root.point)
    this.nearestNode(this.root, point, 0, (node, dist) => {
      best = node
      bestDist = dist
    }, bestDist)
    return best.point
  }

  private nearestNode(
    node: KDTreeNode,
    point: KDPoint,
    depth: number,
    update: (node: KDTreeNode, dist: number) => void,
    currentBest: number,
  ): void {
    const axis = depth % this._dimensions
    const diff = point[axis]! - node.point[axis]!
    const dist = this.distanceSq(point, node.point)

    let bestDist = currentBest

    if (dist < bestDist) {
      update(node, dist)
      bestDist = dist
    }

    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left

    if (first !== null) {
      this.nearestNode(first, point, depth + 1, update, bestDist)
      bestDist = Math.min(bestDist, this.distanceSq(point, node.point))
      const fn = (n: KDTreeNode, d: number) => { update(n, d); bestDist = d }
      if (second !== null && diff * diff < bestDist) {
        this.nearestNode(second, point, depth + 1, fn, bestDist)
      }
    } else if (second !== null) {
      this.nearestNode(second, point, depth + 1, update, bestDist)
    }
  }

  kNearest(point: KDPoint, k: number): KDPoint[] {
    if (this.root === null || k <= 0 || point.length !== this._dimensions) return []
    const results: { node: KDTreeNode; dist: number }[] = []

    const collect = (node: KDTreeNode, depth: number): void => {
      const axis = depth % this._dimensions
      const diff = point[axis]! - node.point[axis]!
      const dist = this.distanceSq(point, node.point)

      if (results.length < k) {
        results.push({ node, dist })
        results.sort((a, b) => a.dist - b.dist)
      } else if (dist < results[results.length - 1]!.dist) {
        results[results.length - 1] = { node, dist }
        results.sort((a, b) => a.dist - b.dist)
      }

      const first = diff < 0 ? node.left : node.right
      const second = diff < 0 ? node.right : node.left

      if (first !== null) {
        collect(first, depth + 1)
      }

      const currentWorst = results.length < k ? Infinity : results[results.length - 1]!.dist
      if (second !== null && diff * diff < currentWorst) {
        collect(second, depth + 1)
      }
    }

    collect(this.root, 0)
    return results.map((r) => r.node.point)
  }

  rangeSearch(rect: KDRect): KDPoint[] {
    const result: KDPoint[] = []
    this.rangeSearchNode(this.root, rect, 0, result)
    return result
  }

  private rangeSearchNode(
    node: KDTreeNode | null,
    rect: KDRect,
    depth: number,
    result: KDPoint[],
  ): void {
    if (node === null) return

    const axis = depth % this._dimensions
    const minVal = rect.min[axis]!
    const maxVal = rect.max[axis]!

    if (node.point[axis]! >= minVal) {
      this.rangeSearchNode(node.left, rect, depth + 1, result)
    }

    let inRange = true
    for (let i = 0; i < this._dimensions; i++) {
      const v = node.point[i]!
      const lo = rect.min[i]!
      const hi = rect.max[i]!
      if (v < lo || v > hi) {
        inRange = false
        break
      }
    }
    if (inRange) {
      result.push(node.point)
    }

    if (node.point[axis]! <= maxVal) {
      this.rangeSearchNode(node.right, rect, depth + 1, result)
    }
  }

  findAll(predicate: (point: KDPoint) => boolean): KDPoint[] {
    const result: KDPoint[] = []
    this.findAllNode(this.root, predicate, result)
    return result
  }

  private findAllNode(
    node: KDTreeNode | null,
    predicate: (point: KDPoint) => boolean,
    result: KDPoint[],
  ): void {
    if (node === null) return
    if (predicate(node.point)) result.push(node.point)
    this.findAllNode(node.left, predicate, result)
    this.findAllNode(node.right, predicate, result)
  }

  get size(): number {
    return this._size
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
    this.collectNode(this.root, result)
    return result
  }

  private collectNode(node: KDTreeNode | null, result: KDPoint[]): void {
    if (node === null) return
    this.collectNode(node.left, result)
    result.push(node.point)
    this.collectNode(node.right, result)
  }

  forEach(callback: (point: KDPoint, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  get dimensions(): number {
    return this._dimensions
  }

  balance(): void {
    const points = this.toArray()
    this.root = this.buildBalanced(points, 0)
  }

  private buildBalanced(points: KDPoint[], depth: number): KDTreeNode | null {
    if (points.length === 0) return null

    const axis = depth % this._dimensions
    points.sort((a, b) => a[axis]! - b[axis]!)

    const mid = Math.floor(points.length / 2)
    const midPoint = points[mid]!

    const leftPoints: KDPoint[] = []
    const rightPoints: KDPoint[] = []
    for (let i = 0; i < points.length; i++) {
      if (i < mid) {
        leftPoints.push(points[i]!)
      } else if (i > mid) {
        rightPoints.push(points[i]!)
      }
    }

    return {
      point: midPoint,
      left: this.buildBalanced(leftPoints, depth + 1),
      right: this.buildBalanced(rightPoints, depth + 1),
    }
  }

  min(dim: number): KDPoint | undefined {
    if (this.root === null || dim < 0 || dim >= this._dimensions) return undefined
    const minNode = this.findMin(this.root, dim, 0)
    return minNode.point
  }

  max(dim: number): KDPoint | undefined {
    if (this.root === null || dim < 0 || dim >= this._dimensions) return undefined
    return this.maxNode(this.root, dim, 0).point
  }

  private maxNode(node: KDTreeNode, axis: number, depth: number): KDTreeNode {
    const currentAxis = depth % this._dimensions

    if (currentAxis === axis) {
      if (node.right === null) return node
      return this.maxNode(node.right, axis, depth + 1)
    }

    let max = node
    if (node.left !== null) {
      const leftMax = this.maxNode(node.left, axis, depth + 1)
      if (leftMax.point[axis]! > max.point[axis]!) {
        max = leftMax
      }
    }
    if (node.right !== null) {
      const rightMax = this.maxNode(node.right, axis, depth + 1)
      if (rightMax.point[axis]! > max.point[axis]!) {
        max = rightMax
      }
    }
    return max
  }

  static from(points: KDPoint[], options?: KDTreeOptions): KDTree {
    const tree = new KDTree(options)
    for (let i = 0; i < points.length; i++) {
      tree.insert(points[i]!)
    }
    return tree
  }

  [Symbol.iterator](): Iterator<KDPoint> {
    const stack: KDTreeNode[] = [];
    let current: KDTreeNode | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          if (current !== null) {
            stack.push(current);
            current = current.left;
            continue;
          }
          current = stack.pop()!;
          const value = current.point;
          current = current.right;
          return { value, done: false };
        }
        return { value: undefined as unknown as KDPoint, done: true };
      }
    };
  }
}
