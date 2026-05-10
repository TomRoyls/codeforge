import type { RopeQueueOptions, RopeQueueStats } from './types.js'
import { DEFAULT_ROPE_QUEUE_OPTIONS } from './types.js'

type RopeNode<T> = LeafNode<T> | InternalNode

interface LeafNode<T> {
  kind: 'leaf'
  items: T[]
}

interface InternalNode {
  kind: 'internal'
  left: RopeNode<unknown>
  right: RopeNode<unknown>
  leftSize: number
  totalSize: number
}

function leafSize<T>(node: RopeNode<T>): number {
  if (node.kind === 'leaf') return node.items.length
  return node.totalSize
}

function calcDepth(node: RopeNode<unknown>): number {
  if (node.kind === 'leaf') return 0
  return 1 + Math.max(calcDepth(node.left), calcDepth(node.right))
}

function countLeaves(node: RopeNode<unknown>): number {
  if (node.kind === 'leaf') return 1
  return countLeaves(node.left) + countLeaves(node.right)
}

function flattenLeaves<T>(node: RopeNode<T>, out: LeafNode<T>[]): void {
  if (node.kind === 'leaf') {
    out.push(node)
    return
  }
  flattenLeaves(node.left, out)
  flattenLeaves(node.right, out)
}

export class RopeQueue<T = unknown> {
  private _size: number = 0
  private _leafSize: number
  private _totalEnqueued: number = 0
  private _totalDequeued: number = 0
  private _totalBulkEnqueued: number = 0
  private _totalBulkDequeued: number = 0

  private headLeaf: LeafNode<T> | null = null
  private tailLeaf: LeafNode<T> | null = null
  private headOffset: number = 0
  private root: RopeNode<T> | null = null

  constructor(options?: Partial<RopeQueueOptions>) {
    const resolved = { ...DEFAULT_ROPE_QUEUE_OPTIONS, ...options }
    this._leafSize = Math.max(1, resolved.leafSize)
  }

  enqueue(item: T): void {
    if (this.tailLeaf === null) {
      const leaf: LeafNode<T> = { kind: 'leaf', items: [item] }
      this.tailLeaf = leaf
      this.headLeaf = leaf
      this.root = leaf
      this._size++
      this._totalEnqueued++
      return
    }

    if (this.tailLeaf.items.length < this._leafSize) {
      this.tailLeaf.items.push(item)
    } else {
      const newLeaf: LeafNode<T> = { kind: 'leaf', items: [item] }
      this.root = this.concatNodes(this.root!, newLeaf)
      this.tailLeaf = newLeaf
    }
    this._size++
    this._totalEnqueued++
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined

    const leaf = this.headLeaf!
    const item = leaf.items[this.headOffset]!
    this.headOffset++
    this._size--
    this._totalDequeued++

    if (this.headOffset >= leaf.items.length) {
      if (leaf === this.tailLeaf) {
        this.root = null
        this.headLeaf = null
        this.tailLeaf = null
        this.headOffset = 0
      } else {
        this.root = this.removeFirstLeaf(this.root!)
        const leaves: LeafNode<T>[] = []
        if (this.root !== null) {
          flattenLeaves(this.root, leaves)
        }
        if (leaves.length > 0) {
          this.headLeaf = leaves[0]!
          this.headOffset = 0
        }
      }
    }

    return item
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.headLeaf!.items[this.headOffset]!
  }

  enqueueAll(items: Iterable<T>): void {
    const arr = Array.from(items)
    if (arr.length === 0) return

    this._totalBulkEnqueued++
    if (this.root === null) {
      const leaf: LeafNode<T> = { kind: 'leaf', items: [...arr] }
      this.root = leaf
      this.headLeaf = leaf
      this.tailLeaf = leaf
      this.headOffset = 0
      this._size += arr.length
      this._totalEnqueued += arr.length
      this._rebalanceIfNeeded()
      return
    }

    const newLeaf: LeafNode<T> = { kind: 'leaf', items: [...arr] }
    this.root = this.concatNodes(this.root!, newLeaf)
    this.tailLeaf = newLeaf
    this._size += arr.length
    this._totalEnqueued += arr.length
    this._rebalanceIfNeeded()
  }

  dequeueN(n: number): T[] {
    const count = Math.min(Math.max(0, n), this._size)
    if (count === 0) return []

    this._totalBulkDequeued++
    const result: T[] = []

    for (let i = 0; i < count; i++) {
      const item = this.dequeue()
      if (item !== undefined) {
        result.push(item)
      }
    }

    return result
  }

  split(n: number): [RopeQueue<T>, RopeQueue<T>] {
    const left = new RopeQueue<T>({ leafSize: this._leafSize })
    const right = new RopeQueue<T>({ leafSize: this._leafSize })

    if (this._size === 0) return [left, right]

    const count = Math.min(Math.max(0, n), this._size)
    const all = this.toArray()

    if (count > 0) {
      left.enqueueAll(all.slice(0, count))
    }
    if (count < all.length) {
      right.enqueueAll(all.slice(count))
    }

    return [left, right]
  }

  get first(): T | undefined {
    if (this._size === 0) return undefined
    return this.headLeaf!.items[this.headOffset]!
  }

  get last(): T | undefined {
    if (this._size === 0 || this.tailLeaf === null) return undefined
    return this.tailLeaf.items[this.tailLeaf.items.length - 1]!
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._size = 0
    this.root = null
    this.headLeaf = null
    this.tailLeaf = null
    this.headOffset = 0
  }

  clone(): RopeQueue<T> {
    const result = new RopeQueue<T>({ leafSize: this._leafSize })
    if (this._size === 0) return result
    result.enqueueAll(this.toArray())
    return result
  }

  toArray(): T[] {
    if (this._size === 0) return []

    const result: T[] = []
    const leaves: LeafNode<T>[] = []
    if (this.root !== null) {
      flattenLeaves(this.root, leaves)
    }

    let isFirst = true
    for (const leaf of leaves) {
      const start = isFirst ? this.headOffset : 0
      for (let i = start; i < leaf.items.length; i++) {
        result.push(leaf.items[i]!)
      }
      isFirst = false
    }

    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    if (this._size === 0) return
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  static from<T>(items: Iterable<T>, options?: Partial<RopeQueueOptions>): RopeQueue<T> {
    const queue = new RopeQueue<T>(options)
    queue.enqueueAll(items)
    return queue
  }

  stats(): RopeQueueStats {
    return {
      size: this._size,
      leafCount: this.root === null ? 0 : countLeaves(this.root),
      depth: this.root === null ? 0 : calcDepth(this.root),
      isEmpty: this._size === 0,
      totalEnqueued: this._totalEnqueued,
      totalDequeued: this._totalDequeued,
      totalBulkEnqueued: this._totalBulkEnqueued,
      totalBulkDequeued: this._totalBulkDequeued,
      leafSize: this._leafSize,
    }
  }

  private concatNodes(left: RopeNode<T>, right: RopeNode<T>): RopeNode<T> {
    const ls = leafSize(left)
    const ts = ls + leafSize(right)
    const internal: RopeNode<T> = {
      kind: 'internal',
      left: left as RopeNode<unknown>,
      right: right as RopeNode<unknown>,
      leftSize: ls,
      totalSize: ts,
    }
    return internal
  }

  private removeFirstLeaf(node: RopeNode<T>): RopeNode<T> | null {
    if (node.kind === 'leaf') return null
    const leftResult = this.removeFirstLeaf(node.left as RopeNode<T>)
    if (leftResult === null) {
      return node.right as RopeNode<T>
    }
    const ls = leafSize(leftResult)
    return {
      kind: 'internal',
      left: leftResult as RopeNode<unknown>,
      right: node.right,
      leftSize: ls,
      totalSize: ls + leafSize(node.right as RopeNode<T>),
    }
  }

  private _rebalanceIfNeeded(): void {
    if (this.root === null) return
    const depth = calcDepth(this.root)
    if (depth <= 10) return

    const leaves: LeafNode<T>[] = []
    flattenLeaves(this.root, leaves)

    this.root = this._buildBalanced(leaves, 0, leaves.length - 1)
    const flatLeaves: LeafNode<T>[] = []
    flattenLeaves(this.root, flatLeaves)
    if (flatLeaves.length > 0) {
      this.headLeaf = flatLeaves[0]!
      this.tailLeaf = flatLeaves[flatLeaves.length - 1]!
    }
  }

  private _buildBalanced(leaves: LeafNode<T>[], start: number, end: number): RopeNode<T> {
    if (start === end) {
      return leaves[start]!
    }
    if (end - start === 1) {
      const ls = leafSize(leaves[start]!)
      return {
        kind: 'internal',
        left: leaves[start]! as LeafNode<unknown>,
        right: leaves[end]! as LeafNode<unknown>,
        leftSize: ls,
        totalSize: ls + leafSize(leaves[end]!),
      }
    }
    const mid = start + Math.floor((end - start) / 2)
    const left = this._buildBalanced(leaves, start, mid)
    const right = this._buildBalanced(leaves, mid + 1, end)
    const ls = leafSize(left)
    return {
      kind: 'internal',
      left: left as RopeNode<unknown>,
      right: right as RopeNode<unknown>,
      leftSize: ls,
      totalSize: ls + leafSize(right),
    }
  }
}

export { DEFAULT_ROPE_QUEUE_OPTIONS } from './types.js'
export type { RopeQueueOptions, RopeQueueStats } from './types.js'
