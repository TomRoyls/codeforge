import type { IntervalEntry, IntervalNode, IntervalTreeStats } from './types.js'

export class IntervalTree<T> {
  private root: IntervalNode<T> | null = null
  private count: number = 0

  insert(start: number, end: number, value: T): void {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    this.root = this.insertNode(this.root, start, end, value)
    this.count++
  }

  private insertNode(node: IntervalNode<T> | null, start: number, end: number, value: T): IntervalNode<T> {
    if (node === null) {
      return { interval: { start, end }, value, max: end, left: null, right: null }
    }
    if (start < node.interval.start) {
      node.left = this.insertNode(node.left, start, end, value)
    } else {
      node.right = this.insertNode(node.right, start, end, value)
    }
    if (node.max < end) {
      node.max = end
    }
    return node
  }

  delete(start: number, end: number): boolean {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    const initialCount = this.count
    this.root = this.deleteNode(this.root, start, end)
    return this.count < initialCount
  }

  private deleteNode(node: IntervalNode<T> | null, start: number, end: number): IntervalNode<T> | null {
    if (node === null) return null
    if (start < node.interval.start) {
      node.left = this.deleteNode(node.left, start, end)
    } else if (start > node.interval.start) {
      node.right = this.deleteNode(node.right, start, end)
    } else {
      if (node.interval.end === end) {
        this.count--
        if (node.left === null) return node.right
        if (node.right === null) return node.left
        const minNode = this.findMin(node.right)
        node.interval = minNode.interval
        node.value = minNode.value
        this.count++
        node.right = this.deleteNode(node.right, minNode.interval.start, minNode.interval.end)
      } else {
        node.right = this.deleteNode(node.right, start, end)
      }
    }
    this.updateMax(node)
    return node
  }

  private findMin(node: IntervalNode<T>): IntervalNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private updateMax(node: IntervalNode<T>): void {
    node.max = node.interval.end
    if (node.left !== null && node.left.max > node.max) {
      node.max = node.left.max
    }
    if (node.right !== null && node.right.max > node.max) {
      node.max = node.right.max
    }
  }

  search(point: number): IntervalEntry<T>[] {
    const results: IntervalEntry<T>[] = []
    this.searchPoint(this.root, point, results)
    return results
  }

  private searchPoint(node: IntervalNode<T> | null, point: number, results: IntervalEntry<T>[]): void {
    if (node === null) return
    if (point >= node.interval.start && point <= node.interval.end) {
      results.push({ interval: node.interval, value: node.value })
    }
    if (node.left !== null && point <= node.left.max) {
      this.searchPoint(node.left, point, results)
    }
    if (node.right !== null && point <= node.right.max) {
      this.searchPoint(node.right, point, results)
    }
  }

  searchInterval(start: number, end: number): IntervalEntry<T>[] {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    const results: IntervalEntry<T>[] = []
    this.searchOverlap(this.root, start, end, results)
    return results
  }

  private searchOverlap(node: IntervalNode<T> | null, start: number, end: number, results: IntervalEntry<T>[]): void {
    if (node === null) return
    if (start <= node.interval.end && end >= node.interval.start) {
      results.push({ interval: node.interval, value: node.value })
    }
    if (node.left !== null && start <= node.left.max) {
      this.searchOverlap(node.left, start, end, results)
    }
    if (node.right !== null && start <= node.right.max) {
      this.searchOverlap(node.right, start, end, results)
    }
  }

  overlaps(start: number, end: number): boolean {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    return this.hasOverlap(this.root, start, end)
  }

  private hasOverlap(node: IntervalNode<T> | null, start: number, end: number): boolean {
    if (node === null) return false
    if (start <= node.interval.end && end >= node.interval.start) return true
    if (node.left !== null && start <= node.left.max) {
      return this.hasOverlap(node.left, start, end)
    }
    if (node.right !== null && start <= node.right.max) {
      return this.hasOverlap(node.right, start, end)
    }
    return false
  }

  has(start: number, end: number): boolean {
    return this.hasExact(this.root, start, end)
  }

  private hasExact(node: IntervalNode<T> | null, start: number, end: number): boolean {
    if (node === null) return false
    if (node.interval.start === start && node.interval.end === end) return true
    if (start < node.interval.start) return this.hasExact(node.left, start, end)
    if (start > node.interval.start) return this.hasExact(node.right, start, end)
    return this.hasExact(node.right, start, end)
  }

  getAll(): IntervalEntry<T>[] {
    const results: IntervalEntry<T>[] = []
    this.inOrder(this.root, results)
    return results
  }

  private inOrder(node: IntervalNode<T> | null, results: IntervalEntry<T>[]): void {
    if (node === null) return
    this.inOrder(node.left, results)
    results.push({ interval: node.interval, value: node.value })
    this.inOrder(node.right, results)
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.root = null
    this.count = 0
  }

  getStats(): IntervalTreeStats {
    const height = this.getHeight(this.root)
    const maxRange = this.getMaxRange()
    return {
      nodeCount: this.count,
      height,
      maxRange,
    }
  }

  private getHeight(node: IntervalNode<T> | null): number {
    if (node === null) return 0
    const leftHeight = this.getHeight(node.left)
    const rightHeight = this.getHeight(node.right)
    return 1 + Math.max(leftHeight, rightHeight)
  }

  private getMaxRange(): number {
    if (this.root === null) return 0
    return this.root.max
  }
}

export type { Interval, IntervalEntry, IntervalNode, IntervalTreeStats } from './types.js'
