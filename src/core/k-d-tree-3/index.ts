type Point = {x: number, y: number}

interface KDNode {
  point: Point
  left: KDNode | null
  right: KDNode | null
}

export class KDTree3 {
  private root: KDNode | null = null
  private _size: number = 0
  private points: Point[] = []

  constructor(points: Point[]) {
    this.points = [...points]
    if (points.length > 0) {
      this._size = points.length
      this.root = this.buildTree(points, 0)
    }
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

  toArray(): Point[] {
    return [...this.points]
  }

  nearestNeighbor(target: Point): Point | undefined {
    if (!this.root) {
      return undefined
    }

    let nearest: Point = this.root.point
    let minDist = this.squaredDistance(target, nearest)

    const search = (node: KDNode | null, depth: number): void => {
      if (!node) {
        return
      }

      const dist = this.squaredDistance(target, node.point)
      if (dist < minDist) {
        minDist = dist
        nearest = node.point
      }

      const axis = depth % 2
      const axisVal = axis === 0 ? node.point.x : node.point.y
      const targetVal = axis === 0 ? target.x : target.y

      const near = targetVal < axisVal ? node.left : node.right
      const far = targetVal < axisVal ? node.right : node.left

      search(near, depth + 1)

      const axisDist = targetVal - axisVal
      if (axisDist * axisDist < minDist) {
        search(far, depth + 1)
      }
    }

    search(this.root, 0)
    return nearest
  }

  kNearestNeighbors(target: Point, k: number): Point[] {
    const result: Point[] = []

    if (k <= 0 || !this.root) {
      return result
    }

    const search = (node: KDNode | null, depth: number): void => {
      if (!node) {
        return
      }

      const dist = this.squaredDistance(target, node.point)
      if (result.length < k) {
        result.push(node.point)
      } else {
        let maxDist = this.squaredDistance(target, result[0]!)
        let maxIdx = 0
        for (let i = 1; i < result.length; i++) {
          const d = this.squaredDistance(target, result[i]!)
          if (d > maxDist) {
            maxDist = d
            maxIdx = i
          }
        }
        if (dist < maxDist) {
          result[maxIdx] = node.point
        }
      }

      const axis = depth % 2
      const axisVal = axis === 0 ? node.point.x : node.point.y
      const targetVal = axis === 0 ? target.x : target.y

      const near = targetVal < axisVal ? node.left : node.right
      const far = targetVal < axisVal ? node.right : node.left

      search(near, depth + 1)

      let currentMax = 0
      for (let i = 0; i < result.length; i++) {
        const d = this.squaredDistance(target, result[i]!)
        if (d > currentMax) {
          currentMax = d
        }
      }
      const axisDist = targetVal - axisVal
      if (axisDist * axisDist < currentMax || result.length < k) {
        search(far, depth + 1)
      }
    }

    search(this.root, 0)
    return result
  }

  rangeSearch(min: Point, max: Point): Point[] {
    const result: Point[] = []
    this.searchRange(this.root, min, max, result, 0)
    return result
  }

  contains(point: Point): boolean {
    return this.searchPoint(this.root, point, 0)
  }

  private buildTree(points: Point[], depth: number): KDNode {
    const axis = depth % 2
    points.sort((a, b) => {
      const aVal = axis === 0 ? a.x : a.y
      const bVal = axis === 0 ? b.x : b.y
      return aVal - bVal
    })

    const mid = Math.floor(points.length / 2)
    const node: KDNode = {
      point: points[mid]!,
      left: null,
      right: null
    }

    if (mid > 0) {
      node.left = this.buildTree(points.slice(0, mid), depth + 1)
    }

    if (mid + 1 < points.length) {
      node.right = this.buildTree(points.slice(mid + 1), depth + 1)
    }

    return node
  }

  private squaredDistance(a: Point, b: Point): number {
    return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)
  }

  private searchRange(node: KDNode | null, min: Point, max: Point, result: Point[], depth: number): void {
    if (!node) {
      return
    }

    const point = node.point
    if (point.x >= min.x && point.x <= max.x && point.y >= min.y && point.y <= max.y) {
      result.push(point)
    }

    const axis = depth % 2
    const axisVal = axis === 0 ? point.x : point.y
    const minVal = axis === 0 ? min.x : min.y
    const maxVal = axis === 0 ? max.x : max.y

    if (minVal < axisVal) {
      this.searchRange(node.left, min, max, result, depth + 1)
    }

    if (maxVal >= axisVal) {
      this.searchRange(node.right, min, max, result, depth + 1)
    }
  }

  private searchPoint(node: KDNode | null, point: Point, depth: number): boolean {
    if (!node) {
      return false
    }

    if (node.point.x === point.x && node.point.y === point.y) {
      return true
    }

    const axis = depth % 2
    const axisVal = axis === 0 ? node.point.x : node.point.y
    const targetVal = axis === 0 ? point.x : point.y

    if (targetVal < axisVal) {
      return this.searchPoint(node.left, point, depth + 1)
    } else {
      return this.searchPoint(node.right, point, depth + 1)
    }
  }

  [Symbol.iterator](): Iterator<Point> {
    const stack: KDNode[] = [];
    let current: KDNode | null = this.root;
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
        return { value: undefined as unknown as Point, done: true };
      }
    };
  }

  static from(items: any[]): KDTree3 {
    return new KDTree3(items)
  }

  clone(): KDTree3 {
    return KDTree3.from(this.toArray())
  }

  toString(): string {
    return `${KDTree3}({ size: ${this.size} })`
  }

  has(point: Point): boolean {
    return this.contains(point)
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'KDTree3', size: this.size, items: this.toArray() }
  }
}
