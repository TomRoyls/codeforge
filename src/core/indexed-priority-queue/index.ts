import type { Comparator, IndexedPriorityQueueOptions, IndexedPriorityQueueEntry, IndexedPriorityQueueStats } from './types.js'

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class IndexedPriorityQueue<T = number> {
  private heap: IndexedPriorityQueueEntry<T>[] = []
  private position: Map<number, number> = new Map()
  private cmp: Comparator<T>

  constructor(options?: IndexedPriorityQueueOptions<T>) {
    this.cmp = options?.comparator ?? defaultComparator
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  insert(index: number, priority: T): void {
    if (this.position.has(index)) {
      throw new Error(`Index ${index} already exists in the queue`)
    }
    const entry: IndexedPriorityQueueEntry<T> = { index, priority }
    const pos = this.heap.length
    this.heap.push(entry)
    this.position.set(index, pos)
    this.bubbleUp(pos)
  }

  delete(index: number): T {
    const pos = this.position.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const priority = this.heap[pos]!.priority
    this.removeAt(pos)
    return priority
  }

  changePriority(index: number, newPriority: T): void {
    const pos = this.position.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const entry = this.heap[pos]!
    const oldPriority = entry.priority
    if (this.cmp(newPriority, oldPriority) === 0) return
    entry.priority = newPriority
    if (this.cmp(newPriority, oldPriority) < 0) {
      this.bubbleUp(pos)
    } else {
      this.sinkDown(pos)
    }
  }

  peekMinIndex(): number | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]!.index
  }

  peekMinPriority(): T | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]!.priority
  }

  popMin(): IndexedPriorityQueueEntry<T> | undefined {
    if (this.heap.length === 0) return undefined
    const entry = this.heap[0]!
    this.removeAt(0)
    return { index: entry.index, priority: entry.priority }
  }

  contains(index: number): boolean {
    return this.position.has(index)
  }

  priorityOf(index: number): T {
    const pos = this.position.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    return this.heap[pos]!.priority
  }

  clear(): void {
    this.heap.length = 0
    this.position.clear()
  }

  toArray(): IndexedPriorityQueueEntry<T>[] {
    return this.heap.map((entry) => ({ index: entry.index, priority: entry.priority }))
  }

  isValid(): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      const pos = this.position.get(this.heap[i]!.index)
      if (pos !== i) return false
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < this.heap.length && this.cmp(this.heap[left]!.priority, this.heap[i]!.priority) < 0) {
        return false
      }
      if (right < this.heap.length && this.cmp(this.heap[right]!.priority, this.heap[i]!.priority) < 0) {
        return false
      }
    }
    return true
  }

  stats(): IndexedPriorityQueueStats {
    const n = this.heap.length
    let height = 0
    if (n > 0) {
      height = Math.floor(Math.log2(n)) + 1
    }
    return { size: n, height }
  }

  indices(): number[] {
    return Array.from(this.position.keys())
  }

  decreaseKey(index: number, newPriority: T): void {
    const pos = this.position.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const entry = this.heap[pos]!
    if (this.cmp(newPriority, entry.priority) >= 0) {
      throw new Error(`New priority is not less than current priority`)
    }
    entry.priority = newPriority
    this.bubbleUp(pos)
  }

  increaseKey(index: number, newPriority: T): void {
    const pos = this.position.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const entry = this.heap[pos]!
    if (this.cmp(newPriority, entry.priority) <= 0) {
      throw new Error(`New priority is not greater than current priority`)
    }
    entry.priority = newPriority
    this.sinkDown(pos)
  }

  clone(): IndexedPriorityQueue<T> {
    const q = new IndexedPriorityQueue<T>({ comparator: this.cmp })
    for (let i = 0; i < this.heap.length; i++) {
      const entry = this.heap[i]!
      q.heap.push({ index: entry.index, priority: entry.priority })
      q.position.set(entry.index, i)
    }
    return q
  }

  *[Symbol.iterator](): Iterator<IndexedPriorityQueueEntry<T>> {
    const copy = this.clone()
    while (!copy.isEmpty()) {
      const entry = copy.popMin()
      if (entry !== undefined) yield entry
    }
  }

  static from<T>(entries: Array<{ index: number; priority: T }>, options?: IndexedPriorityQueueOptions<T>): IndexedPriorityQueue<T> {
    const q = new IndexedPriorityQueue<T>(options)
    for (const { index, priority } of entries) {
      q.insert(index, priority)
    }
    return q
  }

  private bubbleUp(pos: number): void {
    while (pos > 0) {
      const parent = (pos - 1) >> 1
      if (this.cmp(this.heap[pos]!.priority, this.heap[parent]!.priority) < 0) {
        this.swap(pos, parent)
        pos = parent
      } else {
        break
      }
    }
  }

  private sinkDown(pos: number): void {
    const length = this.heap.length
    while (true) {
      let target = pos
      const left = 2 * pos + 1
      const right = 2 * pos + 2
      if (left < length && this.cmp(this.heap[left]!.priority, this.heap[target]!.priority) < 0) {
        target = left
      }
      if (right < length && this.cmp(this.heap[right]!.priority, this.heap[target]!.priority) < 0) {
        target = right
      }
      if (target !== pos) {
        this.swap(pos, target)
        pos = target
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const entryI = this.heap[i]!
    const entryJ = this.heap[j]!
    this.heap[i] = entryJ
    this.heap[j] = entryI
    this.position.set(entryI.index, j)
    this.position.set(entryJ.index, i)
  }

  private removeAt(pos: number): void {
    const lastIndex = this.heap.length - 1
    const removedIndex = this.heap[pos]!.index
    if (pos === lastIndex) {
      this.heap.pop()
      this.position.delete(removedIndex)
      return
    }
    this.swap(pos, lastIndex)
    this.heap.pop()
    this.position.delete(removedIndex)
    if (pos < this.heap.length) {
      const parentPos = (pos - 1) >> 1
      if (pos > 0 && this.cmp(this.heap[pos]!.priority, this.heap[parentPos]!.priority) < 0) {
        this.bubbleUp(pos)
      } else {
        this.sinkDown(pos)
      }
    }
  }

  toString(): string {
    return `${IndexedPriorityQueue}({ size: ${this.size} })`
  }

  forEach(callback: (item: IndexedPriorityQueueEntry<T>, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}

export type { IndexedPriorityQueueOptions, IndexedPriorityQueueEntry, IndexedPriorityQueueStats }
