import type { IndexedPriorityQueueOptions, QueueEntry } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class IndexedPriorityQueue {
  private heap: QueueEntry[] = []
  private indexToPosition: Map<number, number> = new Map()
  private comparator: (a: number, b: number) => number
  private capacity: number

  constructor(options?: IndexedPriorityQueueOptions) {
    this.comparator = options?.comparator ?? DEFAULT_COMPARATOR
    this.capacity = options?.capacity ?? Infinity
  }

  insert(index: number, priority: number): void {
    if (this.indexToPosition.has(index)) {
      throw new Error(`Index ${index} already exists in the queue`)
    }
    if (this.heap.length >= this.capacity) {
      throw new Error(`Queue has reached capacity ${this.capacity}`)
    }
    const entry: QueueEntry = { index, priority }
    const pos = this.heap.length
    this.heap.push(entry)
    this.indexToPosition.set(index, pos)
    this.bubbleUp(pos)
  }

  delete(index: number): number {
    const pos = this.indexToPosition.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const priority = this.heap[pos]!.priority
    this.removeAtPosition(pos)
    return priority
  }

  changePriority(index: number, newPriority: number): void {
    const pos = this.indexToPosition.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const entry = this.heap[pos]!
    const oldPriority = entry.priority
    if (oldPriority === newPriority) return
    entry.priority = newPriority
    if (this.comparator(newPriority, oldPriority) < 0) {
      this.bubbleUp(pos)
    } else {
      this.sinkDown(pos)
    }
  }

  decreaseKey(index: number, newPriority: number): void {
    const pos = this.indexToPosition.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const entry = this.heap[pos]!
    const oldPriority = entry.priority
    if (this.comparator(newPriority, oldPriority) >= 0) {
      throw new Error(`New priority ${newPriority} is not less than current priority ${oldPriority}`)
    }
    entry.priority = newPriority
    this.bubbleUp(pos)
  }

  increaseKey(index: number, newPriority: number): void {
    const pos = this.indexToPosition.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    const entry = this.heap[pos]!
    const oldPriority = entry.priority
    if (this.comparator(newPriority, oldPriority) <= 0) {
      throw new Error(`New priority ${newPriority} is not greater than current priority ${oldPriority}`)
    }
    entry.priority = newPriority
    this.sinkDown(pos)
  }

  peek(): QueueEntry | undefined {
    if (this.heap.length === 0) return undefined
    const entry = this.heap[0]!
    return { index: entry.index, priority: entry.priority }
  }

  poll(): QueueEntry | undefined {
    if (this.heap.length === 0) return undefined
    const entry = this.heap[0]!
    this.removeAtPosition(0)
    return { index: entry.index, priority: entry.priority }
  }

  contains(index: number): boolean {
    return this.indexToPosition.has(index)
  }

  getPriority(index: number): number {
    const pos = this.indexToPosition.get(index)
    if (pos === undefined) {
      throw new Error(`Index ${index} not found in the queue`)
    }
    return this.heap[pos]!.priority
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
    this.indexToPosition.clear()
  }

  indices(): number[] {
    return Array.from(this.indexToPosition.keys())
  }

  toArray(): QueueEntry[] {
    const copy = new IndexedPriorityQueue({
      capacity: this.capacity,
      comparator: this.comparator,
    })
    for (const entry of this.heap) {
      copy.heap.push({ index: entry.index, priority: entry.priority })
      copy.indexToPosition.set(entry.index, copy.heap.length - 1)
    }
    copy.rebuildHeap()
    const result: QueueEntry[] = []
    while (!copy.isEmpty()) {
      const entry = copy.poll()
      if (entry !== undefined) {
        result.push(entry)
      }
    }
    return result
  }

  isValid(): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < this.heap.length) {
        if (this.comparator(this.heap[left]!.priority, this.heap[i]!.priority) < 0) {
          return false
        }
      }
      if (right < this.heap.length) {
        if (this.comparator(this.heap[right]!.priority, this.heap[i]!.priority) < 0) {
          return false
        }
      }
      const pos = this.indexToPosition.get(this.heap[i]!.index)
      if (pos !== i) return false
    }
    return true
  }

  private bubbleUp(pos: number): void {
    while (pos > 0) {
      const parent = Math.floor((pos - 1) / 2)
      if (this.comparator(this.heap[pos]!.priority, this.heap[parent]!.priority) < 0) {
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

      if (left < length && this.comparator(this.heap[left]!.priority, this.heap[target]!.priority) < 0) {
        target = left
      }
      if (right < length && this.comparator(this.heap[right]!.priority, this.heap[target]!.priority) < 0) {
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
    this.indexToPosition.set(entryI.index, j)
    this.indexToPosition.set(entryJ.index, i)
  }

  private removeAtPosition(pos: number): void {
    const lastIndex = this.heap.length - 1
    const removedIndex = this.heap[pos]!.index
    if (pos === lastIndex) {
      this.heap.pop()
      this.indexToPosition.delete(removedIndex)
      return
    }
    this.swap(pos, lastIndex)
    this.heap.pop()
    this.indexToPosition.delete(removedIndex)
    if (pos < this.heap.length) {
      const parentPos = Math.floor((pos - 1) / 2)
      if (pos > 0 && this.comparator(this.heap[pos]!.priority, this.heap[parentPos]!.priority) < 0) {
        this.bubbleUp(pos)
      } else {
        this.sinkDown(pos)
      }
    }
  }

  private rebuildHeap(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.sinkDownFromCopy(i)
    }
  }

  private sinkDownFromCopy(pos: number): void {
    const length = this.heap.length
    while (true) {
      let target = pos
      const left = 2 * pos + 1
      const right = 2 * pos + 2

      if (left < length && this.comparator(this.heap[left]!.priority, this.heap[target]!.priority) < 0) {
        target = left
      }
      if (right < length && this.comparator(this.heap[right]!.priority, this.heap[target]!.priority) < 0) {
        target = right
      }
      if (target !== pos) {
        const entryPos = this.heap[pos]!
        const entryTarget = this.heap[target]!
        this.heap[pos] = entryTarget
        this.heap[target] = entryPos
        this.indexToPosition.set(entryPos.index, target)
        this.indexToPosition.set(entryTarget.index, pos)
        pos = target
      } else {
        break
      }
    }
  }
}

export type { IndexedPriorityQueueOptions, QueueEntry }
