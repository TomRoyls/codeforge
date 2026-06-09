import type { Point, Rect, QuadTreeOptions, QuadTreeNode } from './types.js'

export class QuadTree {
  private root: QuadTreeNode
  private _size = 0
  private capacity: number
  private maxDepth: number

  constructor(boundary: Rect, options?: QuadTreeOptions) {
    this.capacity = options?.capacity ?? 4
    this.maxDepth = options?.maxDepth ?? 8
    this.root = this.createNode(boundary.x, boundary.y, boundary.width, boundary.height, 0)
  }

  private createNode(x: number, y: number, width: number, height: number, depth: number): QuadTreeNode {
    return {
      x,
      y,
      width,
      height,
      depth,
      points: [],
      divided: false,
      northwest: null,
      northeast: null,
      southwest: null,
      southeast: null,
    }
  }

  private containsPoint(node: QuadTreeNode, point: Point): boolean {
    return (
      point.x >= node.x &&
      point.x < node.x + node.width &&
      point.y >= node.y &&
      point.y < node.y + node.height
    )
  }

  private rectIntersects(node: QuadTreeNode, rect: Rect): boolean {
    return !(
      rect.x >= node.x + node.width ||
      rect.x + rect.width <= node.x ||
      rect.y >= node.y + node.height ||
      rect.y + rect.height <= node.y
    )
  }

  private subdivide(node: QuadTreeNode): void {
    const hw = node.width / 2
    const hh = node.height / 2
    const d = node.depth + 1

    node.northwest = this.createNode(node.x, node.y, hw, hh, d)
    node.northeast = this.createNode(node.x + hw, node.y, hw, hh, d)
    node.southwest = this.createNode(node.x, node.y + hh, hw, hh, d)
    node.southeast = this.createNode(node.x + hw, node.y + hh, hw, hh, d)
    node.divided = true

    const existing = node.points
    node.points = []
    for (let i = 0; i < existing.length; i++) {
      this.insertIntoNode(node, existing[i]!)
    }
  }

  private insertIntoNode(node: QuadTreeNode, point: Point): boolean {
    if (!this.containsPoint(node, point)) return false

    if (!node.divided && node.points.length < this.capacity) {
      node.points.push(point)
      return true
    }

    if (!node.divided) {
      if (node.depth >= this.maxDepth) {
        node.points.push(point)
        return true
      }
      this.subdivide(node)
    }

    if (node.northwest && this.insertIntoNode(node.northwest, point)) return true
    if (node.northeast && this.insertIntoNode(node.northeast, point)) return true
    if (node.southwest && this.insertIntoNode(node.southwest, point)) return true
    if (node.southeast && this.insertIntoNode(node.southeast, point)) return true

    node.points.push(point)
    return true
  }

  insert(point: Point): boolean {
    const result = this.insertIntoNode(this.root, point)
    if (result) this._size++
    return result
  }

  private removeFromNode(node: QuadTreeNode, point: Point): boolean {
    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i]!
      if (p.x === point.x && p.y === point.y) {
        node.points.splice(i, 1)
        return true
      }
    }

    if (!node.divided) return false

    if (node.northwest && this.containsPoint(node.northwest, point) && this.removeFromNode(node.northwest, point)) return true
    if (node.northeast && this.containsPoint(node.northeast, point) && this.removeFromNode(node.northeast, point)) return true
    if (node.southwest && this.containsPoint(node.southwest, point) && this.removeFromNode(node.southwest, point)) return true
    if (node.southeast && this.containsPoint(node.southeast, point) && this.removeFromNode(node.southeast, point)) return true

    return false
  }

  remove(point: Point): boolean {
    const result = this.removeFromNode(this.root, point)
    if (result) this._size--
    return result
  }

  private queryRangeFromNode(node: QuadTreeNode, rect: Rect, result: Point[]): void {
    if (!this.rectIntersects(node, rect)) return

    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i]!
      if (
        p.x >= rect.x &&
        p.x < rect.x + rect.width &&
        p.y >= rect.y &&
        p.y < rect.y + rect.height
      ) {
        result.push(p)
      }
    }

    if (!node.divided) return

    if (node.northwest) this.queryRangeFromNode(node.northwest, rect, result)
    if (node.northeast) this.queryRangeFromNode(node.northeast, rect, result)
    if (node.southwest) this.queryRangeFromNode(node.southwest, rect, result)
    if (node.southeast) this.queryRangeFromNode(node.southeast, rect, result)
  }

  queryRange(rect: Rect): Point[] {
    const result: Point[] = []
    this.queryRangeFromNode(this.root, rect, result)
    return result
  }

  contains(point: Point): boolean {
    return this.containsInNode(this.root, point)
  }

  private containsInNode(node: QuadTreeNode, point: Point): boolean {
    if (!this.containsPoint(node, point)) return false

    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i]!
      if (p.x === point.x && p.y === point.y) return true
    }

    if (!node.divided) return false

    if (node.northwest && this.containsInNode(node.northwest, point)) return true
    if (node.northeast && this.containsInNode(node.northeast, point)) return true
    if (node.southwest && this.containsInNode(node.southwest, point)) return true
    if (node.southeast && this.containsInNode(node.southeast, point)) return true

    return false
  }

  nearest(point: Point): Point | undefined {
    if (this._size === 0) return undefined
    let best: Point | undefined
    let bestDist = Infinity
    this.nearestInNode(this.root, point, { best, bestDist }, (result) => {
      best = result.best
      bestDist = result.bestDist
    })
    return best
  }

  private nearestInNode(
    node: QuadTreeNode,
    point: Point,
    state: { best: Point | undefined; bestDist: number },
    update: (s: { best: Point | undefined; bestDist: number }) => void,
  ): void {
    if (!this.containsPoint(node, point)) {
      const cx = Math.max(node.x, Math.min(point.x, node.x + node.width))
      const cy = Math.max(node.y, Math.min(point.y, node.y + node.height))
      const dx = point.x - cx
      const dy = point.y - cy
      const dist = dx * dx + dy * dy
      if (dist >= state.bestDist) return
    }

    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i]!
      const dx = point.x - p.x
      const dy = point.y - p.y
      const dist = dx * dx + dy * dy
      if (dist < state.bestDist) {
        state.bestDist = dist
        state.best = p
        update(state)
      }
    }

    if (!node.divided) return

    const children: QuadTreeNode[] = []
    if (node.northwest) children.push(node.northwest)
    if (node.northeast) children.push(node.northeast)
    if (node.southwest) children.push(node.southwest)
    if (node.southeast) children.push(node.southeast)

    children.sort((a, b) => {
      const ca = Math.max(a.x, Math.min(point.x, a.x + a.width))
      const cb_a = Math.max(a.y, Math.min(point.y, a.y + a.height))
      const da = (point.x - ca) * (point.x - ca) + (point.y - cb_a) * (point.y - cb_a)

      const cb = Math.max(b.x, Math.min(point.x, b.x + b.width))
      const cb_b = Math.max(b.y, Math.min(point.y, b.y + b.height))
      const db = (point.x - cb) * (point.x - cb) + (point.y - cb_b) * (point.y - cb_b)

      return da - db
    })

    for (let i = 0; i < children.length; i++) {
      this.nearestInNode(children[i]!, point, state, update)
    }
  }

  kNearest(point: Point, k: number): Point[] {
    if (this._size === 0 || k <= 0) return []
    const results: { point: Point; dist: number }[] = []

    const collect = (node: QuadTreeNode): void => {
      for (let i = 0; i < node.points.length; i++) {
        const p = node.points[i]!
        const dx = point.x - p.x
        const dy = point.y - p.y
        const dist = dx * dx + dy * dy

        if (results.length < k) {
          results.push({ point: p, dist })
          results.sort((a, b) => a.dist - b.dist)
        } else if (dist < results[results.length - 1]!.dist) {
          results[results.length - 1] = { point: p, dist }
          results.sort((a, b) => a.dist - b.dist)
        }
      }

      if (!node.divided) return

      const children: QuadTreeNode[] = []
      if (node.northwest) children.push(node.northwest)
      if (node.northeast) children.push(node.northeast)
      if (node.southwest) children.push(node.southwest)
      if (node.southeast) children.push(node.southeast)

      children.sort((a, b) => {
        const ca = Math.max(a.x, Math.min(point.x, a.x + a.width))
        const cb_a = Math.max(a.y, Math.min(point.y, a.y + a.height))
        const da = (point.x - ca) * (point.x - ca) + (point.y - cb_a) * (point.y - cb_a)

        const cb = Math.max(b.x, Math.min(point.x, b.x + b.width))
        const cb_b = Math.max(b.y, Math.min(point.y, b.y + b.height))
        const db = (point.x - cb) * (point.x - cb) + (point.y - cb_b) * (point.y - cb_b)

        return da - db
      })

      for (let i = 0; i < children.length; i++) {
        const child = children[i]!
        const cx = Math.max(child.x, Math.min(point.x, child.x + child.width))
        const cy = Math.max(child.y, Math.min(point.y, child.y + child.height))
        const dx = point.x - cx
        const dy = point.y - cy
        const childDist = dx * dx + dy * dy

        if (results.length >= k && childDist >= results[results.length - 1]!.dist) continue
        collect(child)
      }
    }

    collect(this.root)
    return results.map((r) => r.point)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.createNode(this.root.x, this.root.y, this.root.width, this.root.height, 0)
    this._size = 0
  }

  toArray(): Point[] {
    const result: Point[] = []
    this.collectFromNode(this.root, result)
    return result
  }

  private collectFromNode(node: QuadTreeNode, result: Point[]): void {
    for (let i = 0; i < node.points.length; i++) {
      result.push(node.points[i]!)
    }
    if (!node.divided) return
    if (node.northwest) this.collectFromNode(node.northwest, result)
    if (node.northeast) this.collectFromNode(node.northeast, result)
    if (node.southwest) this.collectFromNode(node.southwest, result)
    if (node.southeast) this.collectFromNode(node.southeast, result)
  }

  forEach(callback: (point: Point, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  get allPoints(): Point[] {
    return this.toArray()
  }

  get boundary(): Rect {
    return {
      x: this.root.x,
      y: this.root.y,
      width: this.root.width,
      height: this.root.height,
    }
  }

  static from(points: Point[], boundary: Rect, options?: QuadTreeOptions): QuadTree {
    const qt = new QuadTree(boundary, options)
    for (let i = 0; i < points.length; i++) {
      qt.insert(points[i]!)
    }
    return qt
  }

  [Symbol.iterator](): Iterator<Point> {
    const nodeStack: QuadTreeNode[] = [this.root];
    let buffer: Point[] = [];
    let bi = 0;
    return {
      next: () => {
        if (bi < buffer.length) {
          return { value: buffer[bi++]!, done: false };
        }
        while (nodeStack.length > 0) {
          const node = nodeStack.pop()!;
          buffer = node.points;
          bi = 0;
          if (node.divided) {
            if (node.southeast) nodeStack.push(node.southeast);
            if (node.southwest) nodeStack.push(node.southwest);
            if (node.northeast) nodeStack.push(node.northeast);
            if (node.northwest) nodeStack.push(node.northwest);
          }
          if (buffer.length > 0) {
            return { value: buffer[bi++]!, done: false };
          }
        }
        return { value: undefined as unknown as Point, done: true };
      }
    };
  }

}
