export interface KdPoint {
  coords: number[]
}

export class KdTree<T extends KdPoint> {
  private root: KdNode<T> | null = null
  private readonly dims: number
  private _size: number = 0

  constructor(points: T[] = [], dims: number = 2) {
    this.dims = dims
    if (points.length > 0) {
      this.root = this.build(points, 0)
      this._size = points.length
    }
  }

  insert(point: T): void {
    this.root = this.insertNode(this.root, point, 0)
    this._size++
  }

  nearest(target: number[], k: number = 1): T[] {
    const best: Array<{ point: T; dist: number }> = []
    this.searchNearest(this.root, target, 0, best, k)
    return best.map(b => b.point)
  }

  rangeSearch(min: number[], max: number[]): T[] {
    const results: T[] = []
    this.rangeSearchNode(this.root, min, max, 0, results)
    return results
  }

  get size(): number {
    return this._size
  }

  private build(points: T[], depth: number): KdNode<T> | null {
    if (points.length === 0) return null
    const axis = depth % this.dims
    points.sort((a, b) => a.coords[axis]! - b.coords[axis]!)
    const mid = points.length >> 1
    return {
      point: points[mid]!,
      left: this.build(points.slice(0, mid), depth + 1),
      right: this.build(points.slice(mid + 1), depth + 1),
    }
  }

  private insertNode(node: KdNode<T> | null, point: T, depth: number): KdNode<T> {
    if (!node) return { point, left: null, right: null }
    const axis = depth % this.dims
    if (point.coords[axis]! < node.point.coords[axis]!) {
      node.left = this.insertNode(node.left, point, depth + 1)
    } else {
      node.right = this.insertNode(node.right, point, depth + 1)
    }
    return node
  }

  private searchNearest(
    node: KdNode<T> | null,
    target: number[],
    depth: number,
    best: Array<{ point: T; dist: number }>,
    k: number,
  ): void {
    if (!node) return
    const dist = this.squaredDist(node.point.coords, target)
    if (best.length < k || dist < best[best.length - 1]!.dist) {
      this.insertSorted(best, { point: node.point, dist }, k)
    }
    const axis = depth % this.dims
    const diff = target[axis]! - node.point.coords[axis]!
    const first = diff < 0 ? node.left : node.right
    const second = diff < 0 ? node.right : node.left
    this.searchNearest(first, target, depth + 1, best, k)
    if (best.length < k || diff * diff < best[best.length - 1]!.dist) {
      this.searchNearest(second, target, depth + 1, best, k)
    }
  }

  private rangeSearchNode(
    node: KdNode<T> | null,
    min: number[],
    max: number[],
    depth: number,
    results: T[],
  ): void {
    if (!node) return
    const axis = depth % this.dims
    if (this.inRange(node.point.coords, min, max)) {
      results.push(node.point)
    }
    if (node.point.coords[axis]! >= min[axis]!) {
      this.rangeSearchNode(node.left, min, max, depth + 1, results)
    }
    if (node.point.coords[axis]! <= max[axis]!) {
      this.rangeSearchNode(node.right, min, max, depth + 1, results)
    }
  }

  private inRange(coords: number[], min: number[], max: number[]): boolean {
    for (let i = 0; i < this.dims; i++) {
      if (coords[i]! < min[i]! || coords[i]! > max[i]!) return false
    }
    return true
  }

  private squaredDist(a: number[], b: number[]): number {
    let sum = 0
    for (let i = 0; i < this.dims; i++) {
      const d = a[i]! - b[i]!
      sum += d * d
    }
    return sum
  }

  private insertSorted(
    arr: Array<{ point: T; dist: number }>,
    item: { point: T; dist: number },
    maxLen: number,
  ): void {
    let i = arr.length
    arr.push(item)
    while (i > 0 && arr[i]!.dist < arr[i - 1]!.dist) {
      const tmp = arr[i]!
      arr[i] = arr[i - 1]!
      arr[i - 1] = tmp
      i--
    }
    if (arr.length > maxLen) arr.pop()
  }

  private collectPoints(node: KdNode<T> | null, out: T[]): void {
    if (!node) return
    this.collectPoints(node.left, out)
    out.push(node.point)
    this.collectPoints(node.right, out)
  }

  private pointsEqual(a: T, b: T): boolean {
    for (let i = 0; i < this.dims; i++) {
      if (a.coords[i] !== b.coords[i]) return false
    }
    return true
  }

  toString(): string {
    return `KdTree(${this._size}, dims=${this.dims})`
  }

  toJSON(): unknown {
    const out: T[] = []
    this.collectPoints(this.root, out)
    return out
  }

  clone(): KdTree<T> {
    const points: T[] = []
    this.collectPoints(this.root, points)
    return new KdTree<T>(points, this.dims)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof KdTree)) return false
    if (this._size !== other._size) return false
    if (this.dims !== other.dims) return false
    const a: T[] = []
    const b: T[] = []
    this.collectPoints(this.root, a)
    other.collectPoints(other.root, b)
    if (a.length !== b.length) return false
    for (const p of a) {
      if (!b.some(q => this.pointsEqual(p, q))) return false
    }
    return true
  }
}

interface KdNode<T> {
  point: T
  left: KdNode<T> | null
  right: KdNode<T> | null
}
