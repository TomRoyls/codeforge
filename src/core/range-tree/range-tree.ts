import type { Point2D, RangeTreeNode } from './types.js'

export class RangeTree {
  private root: RangeTreeNode | null = null
  private _points: Point2D[] = []
  private _size: number = 0

  constructor(points: Point2D[]) {
    this._points = points.map((p) => [p[0], p[1]] as Point2D)
    this._size = this._points.length
    this.build()
  }

  build(): void {
    if (this._points.length === 0) {
      this.root = null
      return
    }
    const sorted = [...this._points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
    this.root = this._buildNode(sorted)
  }

  private _buildNode(points: Point2D[]): RangeTreeNode {
    const sortedByY = [...points].sort((a, b) => a[1] - b[1] || a[0] - b[0])

    if (points.length <= 3) {
      return {
        x: points[0]![0],
        points: [...points],
        left: null,
        right: null,
        sortedY: sortedByY.map((p) => p[1]),
        sortedYPoints: sortedByY,
      }
    }

    const mid = Math.floor(points.length / 2)
    const leftPoints = points.slice(0, mid)
    const rightPoints = points.slice(mid)

    return {
      x: points[mid]![0],
      points: [...points],
      left: this._buildNode(leftPoints),
      right: this._buildNode(rightPoints),
      sortedY: sortedByY.map((p) => p[1]),
      sortedYPoints: sortedByY,
    }
  }

  rangeQuery(xMin: number, xMax: number, yMin: number, yMax: number): Point2D[] {
    if (this.root === null) return []
    if (xMin > xMax || yMin > yMax) return []
    const result: Point2D[] = []
    this._query(this.root, xMin, xMax, yMin, yMax, result)
    return result
  }

  private _query(
    node: RangeTreeNode,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    result: Point2D[],
  ): void {
    if (node.points.length === 0) return

    const realMin = this._nodeXMin(node)
    const realMax = this._nodeXMax(node)

    if (xMin > realMax || xMax < realMin) return

    if (xMin <= realMin && xMax >= realMax) {
      this._collectY(node.sortedYPoints, yMin, yMax, result)
      return
    }

    if (node.left === null && node.right === null) {
      for (const p of node.points) {
        if (p[0] >= xMin && p[0] <= xMax && p[1] >= yMin && p[1] <= yMax) {
          result.push(p)
        }
      }
      return
    }

    if (node.left !== null) this._query(node.left, xMin, xMax, yMin, yMax, result)
    if (node.right !== null) this._query(node.right, xMin, xMax, yMin, yMax, result)
  }

  private _collectY(sortedYPoints: Point2D[], yMin: number, yMax: number, result: Point2D[]): void {
    let lo = 0
    let hi = sortedYPoints.length - 1
    let start = sortedYPoints.length
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (sortedYPoints[mid]![1] >= yMin) {
        start = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    for (let i = start; i < sortedYPoints.length; i++) {
      if (sortedYPoints[i]![1] > yMax) break
      result.push(sortedYPoints[i]!)
    }
  }

  private _nodeXMin(node: RangeTreeNode): number {
    let cur: RangeTreeNode = node
    while (cur.left !== null) cur = cur.left
    let minX = cur.points[0]![0]
    for (let i = 1; i < cur.points.length; i++) {
      if (cur.points[i]![0] < minX) minX = cur.points[i]![0]
    }
    return minX
  }

  private _nodeXMax(node: RangeTreeNode): number {
    let cur: RangeTreeNode = node
    while (cur.right !== null) cur = cur.right
    let maxX = cur.points[0]![0]
    for (let i = 1; i < cur.points.length; i++) {
      if (cur.points[i]![0] > maxX) maxX = cur.points[i]![0]
    }
    return maxX
  }

  rangeCount(xMin: number, xMax: number, yMin: number, yMax: number): number {
    return this.rangeQuery(xMin, xMax, yMin, yMax).length
  }

  reportInRange(xMin: number, xMax: number, yMin: number, yMax: number): number {
    return this.rangeCount(xMin, xMax, yMin, yMax)
  }

  contains(point: Point2D): boolean {
    return this._points.some((p) => p[0] === point[0] && p[1] === point[1])
  }

  nearestNeighbor(point: Point2D): Point2D | null {
    if (this._points.length === 0) return null
    let best: Point2D = this._points[0]!
    let bestDist = this._sqDist(this._points[0]!, point)
    for (let i = 1; i < this._points.length; i++) {
      const d = this._sqDist(this._points[i]!, point)
      if (d < bestDist) {
        bestDist = d
        best = this._points[i]!
      }
    }
    return [best[0], best[1]]
  }

  kNearest(point: Point2D, k: number): Point2D[] {
    if (this._points.length === 0 || k <= 0) return []
    const actualK = Math.min(k, this._points.length)
    const indexed = this._points.map((p, i) => ({ point: p, dist: this._sqDist(p, point), idx: i }))
    indexed.sort((a, b) => a.dist - b.dist || a.idx - b.idx)
    return indexed.slice(0, actualK).map((e) => [e.point[0], e.point[1]] as Point2D)
  }

  allPoints(): Point2D[] {
    return this._points.map((p) => [p[0], p[1]] as Point2D)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private _sqDist(a: Point2D, b: Point2D): number {
    const dx = a[0] - b[0]
    const dy = a[1] - b[1]
    return dx * dx + dy * dy
  }
}

export type { RangeTreeOptions, RangeTreeNode, Point2D } from './types.js'
export { DEFAULT_RANGE_TREE_OPTIONS } from './types.js'
