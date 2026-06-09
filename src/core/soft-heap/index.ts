import type { SoftHeapOptions, SoftHeapNode } from './types.js'
import { DEFAULT_SOFT_HEAP_OPTIONS } from './types.js'

export class SoftHeap<T = unknown> {
  private header: SoftHeapNode<T> | null = null
  private _size = 0
  private readonly _errorRate: number
  private readonly _rankThreshold: number
  private readonly cmp: (a: T, b: T) => number

  constructor(options?: SoftHeapOptions<T>) {
    const opts = { ...DEFAULT_SOFT_HEAP_OPTIONS, ...options } as Required<
      SoftHeapOptions<T>
    >
    this._errorRate = opts.errorRate
    this._rankThreshold = Math.max(1, Math.ceil(-Math.log2(this._errorRate)) + 2)
    this.cmp = opts.comparator ?? SoftHeap.defaultCompare
  }

  private static defaultCompare(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b
    }
    return String(a).localeCompare(String(b))
  }

  insert(item: T): void {
    const node: SoftHeapNode<T> = {
      ckey: item,
      items: [item],
      rank: 0,
      child: null,
      next: null,
    }
    this.header = this.mergeRoots(this.header, node)
    this._size++
  }

  peek(): T | undefined {
    if (this.header === null) return undefined
    const minNode = this.findMinNode()
    const offset = minNode._itemOffset ?? 0
    if (offset >= minNode.items.length) return undefined
    return minNode.items[offset]
  }

  extractMin(): T | undefined {
    if (this.header === null) return undefined
    const { prev: minPrev, node: minNode } = this.findMinNodeWithPrev()

    const offset = minNode._itemOffset ?? 0
    if (offset >= minNode.items.length) {
      this.removeNode(minPrev, minNode)
      return this.extractMin()
    }

    const item = minNode.items[offset]!
    minNode._itemOffset = offset + 1
    this._size--

    if (offset + 1 >= minNode.items.length) {
      this.removeNode(minPrev, minNode)
    }
    return item
  }

  meld(other: SoftHeap<T>): void {
    if (other._size === 0) return
    this.header = this.mergeRoots(this.header, other.header)
    this._size += other._size
    other.clear()
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.header = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectItems(this.header, result)
    return result
  }

  clone(): SoftHeap<T> {
    const cloned = new SoftHeap<T>({
      errorRate: this._errorRate,
      comparator: this.cmp === SoftHeap.defaultCompare ? undefined : this.cmp,
    })
    cloned.header = this.cloneTree(this.header)
    cloned._size = this._size
    return cloned
  }

  get errorRate(): number {
    return this._errorRate
  }

  private removeNode(prev: SoftHeapNode<T> | null, node: SoftHeapNode<T>): void {
    if (prev !== null) {
      prev.next = node.next
    } else {
      this.header = node.next
    }
    const childList = node.child
    if (childList !== null) {
      const reversed = this.reverseList(childList)
      this.header = this.mergeRoots(this.header, reversed)
    }
  }

  private findMinNode(): SoftHeapNode<T> {
    let min: SoftHeapNode<T> = this.header!
    let current: SoftHeapNode<T> | null = this.header!.next
    while (current !== null) {
      if (this.cmp(current.ckey, min.ckey) < 0) {
        min = current
      }
      current = current.next
    }
    return min
  }

  private findMinNodeWithPrev(): { prev: SoftHeapNode<T> | null; node: SoftHeapNode<T> } {
    let minPrev: SoftHeapNode<T> | null = null
    let minNode: SoftHeapNode<T> = this.header!
    let prev: SoftHeapNode<T> | null = null
    let current: SoftHeapNode<T> | null = this.header!
    while (current !== null) {
      if (this.cmp(current.ckey, minNode.ckey) < 0) {
        minNode = current
        minPrev = prev
      }
      prev = current
      current = current.next
    }
    return { prev: minPrev, node: minNode }
  }

  private mergeRoots(
    h1: SoftHeapNode<T> | null,
    h2: SoftHeapNode<T> | null,
  ): SoftHeapNode<T> | null {
    if (h1 === null) return h2
    if (h2 === null) return h1
    const merged = this.mergeSortedByRank(h1, h2)
    return this.consolidate(merged)
  }

  private mergeSortedByRank(
    h1: SoftHeapNode<T>,
    h2: SoftHeapNode<T>,
  ): SoftHeapNode<T> {
    let head: SoftHeapNode<T>
    let tail: SoftHeapNode<T>
    let a: SoftHeapNode<T> | null = h1
    let b: SoftHeapNode<T> | null = h2

    if (a.rank <= b.rank) {
      head = a
      a = a.next
    } else {
      head = b
      b = b.next
    }
    tail = head
    tail.next = null

    while (a !== null && b !== null) {
      if (a.rank <= b.rank) {
        tail.next = a
        a = a.next
      } else {
        tail.next = b
        b = b.next
      }
      tail = tail.next!
      tail.next = null
    }

    tail.next = a !== null ? a : b
    return head
  }

  private consolidate(head: SoftHeapNode<T>): SoftHeapNode<T> {
    if (head.next === null) return head

    let prev: SoftHeapNode<T> | null = null
    let current: SoftHeapNode<T> = head
    let next: SoftHeapNode<T> | null = current.next

    while (next !== null) {
      if (current.rank === next.rank) {
        const afterNext = next.next
        const winner: SoftHeapNode<T> =
          this.cmp(current.ckey, next.ckey) <= 0 ? current : next
        const loser: SoftHeapNode<T> =
          this.cmp(current.ckey, next.ckey) <= 0 ? next : current

        if (loser.items.length - (loser._itemOffset ?? 0) > 0 && winner.rank >= this._rankThreshold) {
          this.corruptNode(loser, winner.ckey)
        }

        loser.next = winner.child
        winner.child = loser
        winner.rank++
        winner.next = afterNext

        if (winner !== current) {
          if (prev === null) {
            head = winner
          } else {
            prev.next = winner
          }
          current = winner
        }

        next = winner.next
      } else {
        prev = current
        current = next
        next = current.next
      }
    }

    return head
  }

  private corruptNode(node: SoftHeapNode<T>, newCkey: T): void {
    node.ckey = newCkey
    this.corruptChildren(node.child, newCkey)
  }

  private corruptChildren(child: SoftHeapNode<T> | null, ckey: T): void {
    let current = child
    while (current !== null) {
      if (this.cmp(current.ckey, ckey) < 0) {
        current.ckey = ckey
      }
      this.corruptChildren(current.child, ckey)
      current = current.next
    }
  }

  private reverseList(node: SoftHeapNode<T>): SoftHeapNode<T> | null {
    let prev: SoftHeapNode<T> | null = null
    let current: SoftHeapNode<T> | null = node
    while (current !== null) {
      const next: SoftHeapNode<T> | null = current.next
      current.next = prev
      prev = current
      current = next
    }
    return prev
  }

  private collectItems(root: SoftHeapNode<T> | null, result: T[]): void {
    let current = root
    while (current !== null) {
      const offset = current._itemOffset ?? 0
      for (let i = offset; i < current.items.length; i++) {
        result.push(current.items[i]!)
      }
      this.collectItems(current.child, result)
      current = current.next
    }
  }

  private cloneTree(root: SoftHeapNode<T> | null): SoftHeapNode<T> | null {
    if (root === null) return null
    return {
      ckey: root.ckey,
      items: root.items.slice(root._itemOffset ?? 0),
      rank: root.rank,
      child: this.cloneTree(root.child),
      next: this.cloneTree(root.next),
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `SoftHeap({ size: ${this._size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}

export { DEFAULT_SOFT_HEAP_OPTIONS } from './types.js'
export type { SoftHeapOptions, SoftHeapNode } from './types.js'
