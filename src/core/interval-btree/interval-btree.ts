import {
  type Interval,
  type IntervalBTreeOptions,
  type IntervalBTreeStatistics,
  DEFAULT_INTERVAL_BTREE_OPTIONS,
} from "./types.js"

interface IntervalNode {
  intervals: Interval[]
  children: IntervalNode[]
  maxEnd: number
  isLeaf: boolean
}

export class IntervalBTree {
  private root: IntervalNode
  private readonly degree: number
  private readonly minKeys: number
  private readonly maxKeys: number
  private _size: number
  private stats: IntervalBTreeStatistics

  constructor(options?: IntervalBTreeOptions) {
    const opts = { ...DEFAULT_INTERVAL_BTREE_OPTIONS, ...options }
    this.degree = opts.degree ?? 32
    this.minKeys = this.degree - 1
    this.maxKeys = 2 * this.degree - 1
    this.root = this.createLeaf()
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, queries: 0, overlapChecks: 0 }
  }

  private createLeaf(): IntervalNode {
    return { intervals: [], children: [], maxEnd: -Infinity, isLeaf: true }
  }

  private createInternal(): IntervalNode {
    return { intervals: [], children: [], maxEnd: -Infinity, isLeaf: false }
  }

  private updateMaxEnd(node: IntervalNode): void {
    let max = -Infinity
    for (const iv of node.intervals) {
      if (iv.end > max) max = iv.end
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child.maxEnd > max) max = child.maxEnd
      }
    }
    node.maxEnd = max
  }

  private intervalsOverlap(a: Interval, b: Interval): boolean {
    this.stats.overlapChecks++
    return a.start <= b.end && b.start <= a.end
  }

  private findKeyIndex(intervals: Interval[], start: number): number {
    let lo = 0
    let hi = intervals.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (intervals[mid]!.start < start) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private findChildIndex(intervals: Interval[], start: number): number {
    let idx = 0
    while (
      idx < intervals.length &&
      intervals[idx]!.start <= start
    ) {
      idx++
    }
    return idx
  }

  insert(interval: Interval): void {
    this.stats.inserts++
    if (interval.start > interval.end) {
      throw new Error("Invalid interval: start must be <= end")
    }
    const root = this.root
    if (root.intervals.length === this.maxKeys) {
      const newRoot = this.createInternal()
      newRoot.children.push(root)
      this.splitChild(newRoot, 0)
      this.insertNonFull(newRoot, interval)
      this.root = newRoot
    } else {
      this.insertNonFull(root, interval)
    }
    this._size++
  }

  private insertNonFull(node: IntervalNode, interval: Interval): void {
    let current = node
    while (true) {
      const idx = this.findKeyIndex(current.intervals, interval.start)
      if (current.isLeaf) {
        current.intervals.splice(idx, 0, interval)
        this.updateMaxEnd(current)
        return
      }
      const childIdx = this.findChildIndex(current.intervals, interval.start)
      const child = current.children[childIdx]!
      if (child.intervals.length === this.maxKeys) {
        this.splitChild(current, childIdx)
        if (
          interval.start > current.intervals[childIdx]!.start
        ) {
          current = current.children[childIdx + 1]!
        } else {
          current = current.children[childIdx]!
        }
      } else {
        current = child
      }
    }
  }

  private splitChild(parent: IntervalNode, index: number): void {
    const child = parent.children[index]!
    const newNode: IntervalNode = {
      intervals: [],
      children: [],
      maxEnd: -Infinity,
      isLeaf: child.isLeaf,
    }
    const mid = this.degree - 1
    const promoted = child.intervals[mid]!

    newNode.intervals = child.intervals.splice(mid + 1)
    child.intervals.splice(mid)

    if (!child.isLeaf) {
      newNode.children = child.children.splice(mid + 1)
    }

    parent.intervals.splice(index, 0, promoted)
    parent.children.splice(index + 1, 0, newNode)
    parent.isLeaf = false

    this.updateMaxEnd(child)
    this.updateMaxEnd(newNode)
    this.updateMaxEnd(parent)
  }

  delete(interval: Interval): boolean {
    this.stats.deletes++
    const found = this.deleteFromNode(this.root, interval)
    if (found) {
      this._size--
      if (
        this.root.intervals.length === 0 &&
        !this.root.isLeaf
      ) {
        this.root = this.root.children[0]!
      }
      return true
    }
    return false
  }

  private deleteFromNode(node: IntervalNode, interval: Interval): boolean {
    const idx = this.findKeyIndex(node.intervals, interval.start)
    for (let i = idx; i < node.intervals.length && node.intervals[i]!.start === interval.start; i++) {
      if (node.intervals[i]!.end === interval.end) {
        if (node.isLeaf) {
          node.intervals.splice(i, 1)
          this.updateMaxEnd(node)
          return true
        }
        return this.deleteFromInternal(node, i)
      }
    }
    if (node.isLeaf) {
      return false
    }
    const childIdx = this.findChildIndex(node.intervals, interval.start)
    const child = node.children[childIdx]!
    if (child.intervals.length === this.minKeys) {
      this.fillChild(node, childIdx)
    }
    const adjustedIdx = this.findChildIndex(
      node.intervals,
      interval.start,
    )
    return this.deleteFromNode(
      node.children[adjustedIdx]!,
      interval,
    )
  }

  private deleteFromInternal(node: IntervalNode, idx: number): boolean {
    const predChild = node.children[idx]!
    const succChild = node.children[idx + 1]!
    if (predChild.intervals.length >= this.degree) {
      const pred = this.getPredecessor(predChild)
      node.intervals[idx] = pred
      this.updateMaxEnd(node)
      return this.deleteFromNode(predChild, pred)
    }
    if (succChild.intervals.length >= this.degree) {
      const succ = this.getSuccessor(succChild)
      node.intervals[idx] = succ
      this.updateMaxEnd(node)
      return this.deleteFromNode(succChild, succ)
    }
    const interval = node.intervals[idx]!
    this.mergeChildren(node, idx)
    return this.deleteFromNode(
      node.children[idx]!,
      interval,
    )
  }

  private getPredecessor(node: IntervalNode): Interval {
    let current = node
    while (!current.isLeaf) {
      current = current.children[current.children.length - 1]!
    }
    return current.intervals[current.intervals.length - 1]!
  }

  private getSuccessor(node: IntervalNode): Interval {
    let current = node
    while (!current.isLeaf) {
      current = current.children[0]!
    }
    return current.intervals[0]!
  }

  private fillChild(parent: IntervalNode, idx: number): void {
    if (
      idx > 0 &&
      parent.children[idx - 1]!.intervals.length >= this.degree
    ) {
      this.borrowFromPrev(parent, idx)
    } else if (
      idx < parent.children.length - 1 &&
      parent.children[idx + 1]!.intervals.length >= this.degree
    ) {
      this.borrowFromNext(parent, idx)
    } else {
      if (idx < parent.children.length - 1) {
        this.mergeChildren(parent, idx)
      } else {
        this.mergeChildren(parent, idx - 1)
      }
    }
  }

  private borrowFromPrev(parent: IntervalNode, idx: number): void {
    const child = parent.children[idx]!
    const sibling = parent.children[idx - 1]!
    child.intervals.unshift(parent.intervals[idx - 1]!)
    parent.intervals[idx - 1] = sibling.intervals.pop()!
    if (!child.isLeaf) {
      child.children.unshift(sibling.children.pop()!)
    }
    this.updateMaxEnd(sibling)
    this.updateMaxEnd(child)
    this.updateMaxEnd(parent)
  }

  private borrowFromNext(parent: IntervalNode, idx: number): void {
    const child = parent.children[idx]!
    const sibling = parent.children[idx + 1]!
    child.intervals.push(parent.intervals[idx]!)
    parent.intervals[idx] = sibling.intervals.shift()!
    if (!child.isLeaf) {
      child.children.push(sibling.children.shift()!)
    }
    this.updateMaxEnd(sibling)
    this.updateMaxEnd(child)
    this.updateMaxEnd(parent)
  }

  private mergeChildren(parent: IntervalNode, idx: number): void {
    const left = parent.children[idx]!
    const right = parent.children[idx + 1]!
    left.intervals.push(parent.intervals[idx]!)
    left.intervals.push(...right.intervals)
    if (!left.isLeaf) {
      left.children.push(...right.children)
    }
    parent.intervals.splice(idx, 1)
    parent.children.splice(idx + 1, 1)
    this.updateMaxEnd(left)
    this.updateMaxEnd(parent)
    if (parent.intervals.length === 0 && parent === this.root) {
      this.root = left
    }
  }

  has(interval: Interval): boolean {
    this.stats.queries++
    return this.searchNode(this.root, interval)
  }

  private searchNode(node: IntervalNode, interval: Interval): boolean {
    const idx = this.findKeyIndex(node.intervals, interval.start)
    for (let i = idx; i < node.intervals.length && node.intervals[i]!.start === interval.start; i++) {
      if (node.intervals[i]!.end === interval.end) {
        return true
      }
    }
    if (node.isLeaf) {
      return false
    }
    const childIdx = this.findChildIndex(node.intervals, interval.start)
    return this.searchNode(node.children[childIdx]!, interval)
  }

  queryPoint(point: number): Interval[] {
    this.stats.queries++
    const results: Interval[] = []
    this.queryPointNode(this.root, point, results)
    return results
  }

  private queryPointNode(
    node: IntervalNode,
    point: number,
    results: Interval[],
  ): void {
    for (const iv of node.intervals) {
      if (iv.start <= point && point <= iv.end) {
        results.push(iv)
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child.maxEnd >= point) {
          this.queryPointNode(child, point, results)
        }
      }
    }
  }

  queryRange(start: number, end: number): Interval[] {
    this.stats.queries++
    const results: Interval[] = []
    const query: Interval = { start, end }
    this.queryRangeNode(this.root, query, results)
    return results
  }

  private queryRangeNode(
    node: IntervalNode,
    query: Interval,
    results: Interval[],
  ): void {
    for (const iv of node.intervals) {
      if (this.intervalsOverlap(iv, query)) {
        results.push(iv)
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child.maxEnd >= query.start) {
          this.queryRangeNode(child, query, results)
        }
      }
    }
  }

  queryExact(start: number, end: number): Interval | undefined {
    this.stats.queries++
    return this.queryExactNode(this.root, start, end)
  }

  private queryExactNode(
    node: IntervalNode,
    start: number,
    end: number,
  ): Interval | undefined {
    const idx = this.findKeyIndex(node.intervals, start)
    for (let i = idx; i < node.intervals.length && node.intervals[i]!.start === start; i++) {
      if (node.intervals[i]!.end === end) {
        return node.intervals[i]
      }
    }
    if (node.isLeaf) {
      return undefined
    }
    const childIdx = this.findChildIndex(node.intervals, start)
    return this.queryExactNode(node.children[childIdx]!, start, end)
  }

  findOverlapping(interval: Interval): Interval[] {
    this.stats.queries++
    const results: Interval[] = []
    this.findOverlappingNode(this.root, interval, results)
    return results
  }

  private findOverlappingNode(
    node: IntervalNode,
    interval: Interval,
    results: Interval[],
  ): void {
    for (const iv of node.intervals) {
      if (this.intervalsOverlap(iv, interval)) {
        results.push(iv)
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child.maxEnd >= interval.start) {
          this.findOverlappingNode(child, interval, results)
        }
      }
    }
  }

  findNonOverlapping(): Interval[] {
    this.stats.queries++
    const all = this.toArray()
    const result: Interval[] = []
    let lastEnd = -Infinity
    for (const iv of all) {
      if (iv.start > lastEnd) {
        result.push(iv)
        lastEnd = iv.end
      } else if (iv.end > lastEnd) {
        lastEnd = iv.end
      }
    }
    return result
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.createLeaf()
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, queries: 0, overlapChecks: 0 }
  }

  toArray(): Interval[] {
    const result: Interval[] = []
    this.inorderTraversal(this.root, result)
    return result
  }

  private inorderTraversal(node: IntervalNode, result: Interval[]): void {
    if (node.isLeaf) {
      result.push(...node.intervals)
      return
    }
    for (let i = 0; i < node.intervals.length; i++) {
      this.inorderTraversal(node.children[i]!, result)
      result.push(node.intervals[i]!)
    }
    this.inorderTraversal(
      node.children[node.intervals.length]!,
      result,
    )
  }

  forEach(cb: (interval: Interval, index: number) => void): void {
    const all = this.toArray()
    for (let i = 0; i < all.length; i++) {
      cb(all[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<Interval> {
    const all = this.toArray()
    let index = 0
    return {
      next: (): IteratorResult<Interval> => {
        if (index < all.length) {
          return { value: all[index++]!, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }

  getHeight(): number {
    let height = 1
    let node = this.root
    while (!node.isLeaf) {
      height++
      node = node.children[0]!
    }
    return height
  }

  getStatistics(): IntervalBTreeStatistics {
    return { ...this.stats }
  }
}
