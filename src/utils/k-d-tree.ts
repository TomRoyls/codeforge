/** KD-Tree - a space-partitioning tree for k-dimensional point data */

type Point = number[]

class KDNode {
  point: Point
  left: KDNode | null
  right: KDNode | null
  axis: number

  constructor(point: Point, axis: number) {
    this.point = point
    this.left = null
    this.right = null
    this.axis = axis
  }
}

export class KDTree {
  private root: KDNode | null = null
  private _size = 0
  private _k: number

  constructor(points: Point[] = [], k?: number) {
    if (points.length > 0) {
      this._k = k ?? points[0]!.length
      this.root = this.buildBalanced(points.slice(), 0)
      this._size = points.length
    } else {
      this._k = k ?? 2
    }
  }

  static fromPoints(points: Point[], k?: number): KDTree {
    return new KDTree(points, k)
  }

  insert(point: Point): void {
    if (this._size === 0) {
      this._k = point.length
    }
    this.root = this.insertNode(this.root, point, 0)
    this._size++
  }

  remove(point: Point): boolean {
    const prevSize = this._size
    const result = this.removeNodeInternal(this.root, point)
    if (result.removed) this._size--
    this.root = result.node
    return this._size < prevSize
  }

  contains(point: Point): boolean {
    return this.containsNode(this.root, point, 0)
  }

  nearestNeighbor(target: Point): Point | null {
    if (this.root === null) return null
    let best: KDNode | null = null
    let bestDist = Infinity
    this.nnSearch(this.root, target, 0, () => [best, bestDist], (node, dist) => {
      best = node
      bestDist = dist
    })
    return (best as KDNode | null)?.point ?? null
  }

  kNearestNeighbors(target: Point, k: number): Point[] {
    if (this.root === null || k <= 0) return []
    type Entry = { node: KDNode; dist: number }
    const heap: Entry[] = []
    const capacity = Math.min(k, this._size)

    this.knnSearch(this.root, target, 0, capacity, heap)

    heap.sort((a, b) => a.dist - b.dist)
    return heap.map((e) => e.node.point)
  }

  rangeSearch(min: Point, max: Point): Point[] {
    const result: Point[] = []
    this.rangeSearchNode(this.root, min, max, result)
    return result
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
    const result: Point[] = []
    this.collectPoints(this.root, result)
    return result
  }

  get dimensions(): number {
    return this._k
  }

  private buildBalanced(points: Point[], depth: number): KDNode | null {
    if (points.length === 0) return null

    const axis = depth % this._k
    points.sort((a, b) => a[axis]! - b[axis]!)
    const mid = points.length >> 1
    const node = new KDNode(points[mid]!, axis)

    node.left = this.buildBalanced(points.slice(0, mid), depth + 1)
    node.right = this.buildBalanced(points.slice(mid + 1), depth + 1)
    return node
  }

  private insertNode(node: KDNode | null, point: Point, depth: number): KDNode {
    if (node === null) {
      return new KDNode(point, depth % this._k)
    }

    const axis = depth % this._k
    if (point[axis]! < node.point[axis]!) {
      node.left = this.insertNode(node.left, point, depth + 1)
    } else {
      node.right = this.insertNode(node.right, point, depth + 1)
    }
    return node
  }

  private removeNodeInternal(
    node: KDNode | null,
    point: Point,
  ): { node: KDNode | null; removed: boolean } {
    if (node === null) return { node: null, removed: false }

    const axis = node.axis
    if (this.pointsEqual(node.point, point)) {
      if (node.right !== null) {
        const successor = this.findMin(node.right, axis)
        node.point = successor.point
        const result = this.removeNodeInternal(node.right, successor.point)
        node.right = result.node
      } else if (node.left !== null) {
        const successor = this.findMin(node.left, axis)
        node.point = successor.point
        const result = this.removeNodeInternal(node.left, successor.point)
        node.right = result.node
        node.left = null
      } else {
        return { node: null, removed: true }
      }
      return { node, removed: true }
    } else if (point[axis]! < node.point[axis]!) {
      const result = this.removeNodeInternal(node.left, point)
      node.left = result.node
      return { node, removed: result.removed }
    } else {
      const result = this.removeNodeInternal(node.right, point)
      node.right = result.node
      return { node, removed: result.removed }
    }
  }

  private findMin(node: KDNode, targetAxis: number): KDNode {
    let current = node
    const stack: KDNode[] = [node]

    while (stack.length > 0) {
      const n = stack.pop()!
      if (n.point[targetAxis]! < current.point[targetAxis]!) {
        current = n
      }
      if (n.axis === targetAxis) {
        if (n.left !== null) stack.push(n.left)
      } else {
        if (n.left !== null) stack.push(n.left)
        if (n.right !== null) stack.push(n.right)
      }
    }
    return current
  }

  private containsNode(node: KDNode | null, point: Point, depth: number): boolean {
    if (node === null) return false
    if (this.pointsEqual(node.point, point)) return true

    const axis = depth % this._k
    if (point[axis]! < node.point[axis]!) {
      return this.containsNode(node.left, point, depth + 1)
    }
    return this.containsNode(node.right, point, depth + 1)
  }

  private nnSearch(
    node: KDNode,
    target: Point,
    depth: number,
    getBest: () => [KDNode | null, number],
    setBest: (node: KDNode, dist: number) => void,
  ): void {
    if (node === null) return

    const dist = this.distanceSq(node.point, target)
    const [, bestDist] = getBest()
    if (dist < bestDist) {
      setBest(node, dist)
    }

    const axis = depth % this._k
    const diff = target[axis]! - node.point[axis]!
    const [first, second] = diff < 0 ? [node.left, node.right] : [node.right, node.left]

    this.nnSearch(first!, target, depth + 1, getBest, setBest)

    const [, updatedBestDist] = getBest()
    if (diff * diff < updatedBestDist) {
      this.nnSearch(second!, target, depth + 1, getBest, setBest)
    }
  }

  private knnSearch(
    node: KDNode | null,
    target: Point,
    depth: number,
    capacity: number,
    heap: { node: KDNode; dist: number }[],
  ): void {
    if (node === null) return

    const dist = this.distanceSq(node.point, target)
    const maxDist = heap.length >= capacity ? heap[0]!.dist : Infinity

    if (heap.length < capacity) {
      this.heapPush(heap, { node, dist }, capacity)
    } else if (dist < maxDist) {
      this.heapPop(heap)
      this.heapPush(heap, { node, dist }, capacity)
    }

    const axis = depth % this._k
    const diff = target[axis]! - node.point[axis]!
    const [first, second] = diff < 0 ? [node.left, node.right] : [node.right, node.left]

    this.knnSearch(first, target, depth + 1, capacity, heap)

    const currentMax = heap.length >= capacity ? heap[0]!.dist : Infinity
    if (diff * diff < currentMax) {
      this.knnSearch(second, target, depth + 1, capacity, heap)
    }
  }

  private heapPush(
    heap: { node: KDNode; dist: number }[],
    entry: { node: KDNode; dist: number },
    _capacity: number,
  ): void {
    heap.push(entry)
    let i = heap.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (heap[parent]!.dist < heap[i]!.dist) {
        ;[heap[parent]!, heap[i]!] = [heap[i]!, heap[parent]!]
        i = parent
      } else {
        break
      }
    }
  }

  private heapPop(heap: { node: KDNode; dist: number }[]): void {
    const last = heap.pop()!
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      while (true) {
        let target = i
        const left = (i << 1) + 1
        const right = (i << 1) + 2
        if (left < heap.length && heap[left]!.dist > heap[target]!.dist) target = left
        if (right < heap.length && heap[right]!.dist > heap[target]!.dist) target = right
        if (target === i) break
        ;[heap[i]!, heap[target]!] = [heap[target]!, heap[i]!]
        i = target
      }
    }
  }

  private rangeSearchNode(
    node: KDNode | null,
    min: Point,
    max: Point,
    result: Point[],
  ): void {
    if (node === null) return

    if (this.inBounds(node.point, min, max)) {
      result.push(node.point)
    }

    const axis = node.axis
    if (min[axis]! <= node.point[axis]!) {
      this.rangeSearchNode(node.left, min, max, result)
    }
    if (max[axis]! >= node.point[axis]!) {
      this.rangeSearchNode(node.right, min, max, result)
    }
  }

  private inBounds(point: Point, min: Point, max: Point): boolean {
    for (let i = 0; i < this._k; i++) {
      if (point[i]! < min[i]! || point[i]! > max[i]!) return false
    }
    return true
  }

  private collectPoints(node: KDNode | null, result: Point[]): void {
    if (node === null) return
    this.collectPoints(node.left, result)
    result.push(node.point)
    this.collectPoints(node.right, result)
  }

  private pointsEqual(a: Point, b: Point): boolean {
    for (let i = 0; i < this._k; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  private distanceSq(a: Point, b: Point): number {
    let sum = 0
    for (let i = 0; i < this._k; i++) {
      const diff = a[i]! - b[i]!
      sum += diff * diff
    }
    return sum
  }
}
