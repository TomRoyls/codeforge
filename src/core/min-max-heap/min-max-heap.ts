import type { HeapItem, MinMaxHeapOptions } from './types.js'


export class MinMaxHeap<T = unknown> {
  private heap: HeapItem<T>[] = []

  constructor(_options?: Partial<MinMaxHeapOptions>) {
    void _options
  }

  insert(priority: number, value: T): void {
    const item: HeapItem<T> = { priority, value }
    this.heap.push(item)
    if (this.heap.length > 1) {
      this.bubbleUp(this.heap.length - 1)
    }
  }

  getMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]!.value
  }

  getMax(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    if (this.heap.length === 1) {
      return this.heap[0]!.value
    }
    if (this.heap.length === 2) {
      return this.heap[1]!.value
    }
    return this.heap[1]!.priority >= this.heap[2]!.priority
      ? this.heap[1]!.value
      : this.heap[2]!.value
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const min = this.heap[0]!.value
    this.removeAt(0)
    return min
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    if (this.heap.length === 1) {
      return this.heap.pop()!.value
    }
    const maxIndex = this.findMaxIndex()
    const max = this.heap[maxIndex]!.value
    this.removeAt(maxIndex)
    return max
  }

  deleteMin(): boolean {
    if (this.heap.length === 0) {
      return false
    }
    this.removeAt(0)
    return true
  }

  deleteMax(): boolean {
    if (this.heap.length === 0) {
      return false
    }
    if (this.heap.length === 1) {
      this.heap.pop()
      return true
    }
    this.removeAt(this.findMaxIndex())
    return true
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  update(priority: number, value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i]!.value === value) {
        this.heap[i]!.priority = priority
        this.bubbleUp(i)
        this.trickleDown(i)
        return true
      }
    }
    return false
  }

  has(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i]!.value === value) {
        return true
      }
    }
    return false
  }

  toArray(): Array<{ priority: number; value: T }> {
    return this.heap.map(item => ({ priority: item.priority, value: item.value }))
  }

  fromArray(items: Array<{ priority: number; value: T }>): void {
    this.heap = []
    for (const item of items) {
      this.insert(item.priority, item.value)
    }
  }

  merge(other: MinMaxHeap<T>): void {
    for (let i = 0; i < other.heap.length; i++) {
      const item = other.heap[i]!
      this.insert(item.priority, item.value)
    }
  }

  private findMaxIndex(): number {
    if (this.heap.length === 1) {
      return 0
    }
    if (this.heap.length === 2) {
      return 1
    }
    return this.heap[1]!.priority >= this.heap[2]!.priority ? 1 : 2
  }

  private removeAt(index: number): void {
    const last = this.heap.pop()
    if (index >= this.heap.length || last === undefined) {
      return
    }
    this.heap[index] = last
    this.bubbleUp(index)
    this.trickleDown(index)
  }

  private isMinLevel(index: number): boolean {
    let level = 0
    let i = index + 1
    while (i > 1) {
      i >>= 1
      level++
    }
    return level % 2 === 0
  }

  private parentIndex(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private grandparentIndex(index: number): number {
    return Math.floor((Math.floor((index - 1) / 2) - 1) / 2)
  }

  private bubbleUp(index: number): void {
    if (this.isMinLevel(index)) {
      if (index > 0) {
        const p = this.parentIndex(index)
        if (this.heap[index]!.priority > this.heap[p]!.priority) {
          this.swap(index, p)
          this.bubbleUpMax(p)
          return
        }
      }
      this.bubbleUpMin(index)
    } else {
      if (index > 0) {
        const p = this.parentIndex(index)
        if (this.heap[index]!.priority < this.heap[p]!.priority) {
          this.swap(index, p)
          this.bubbleUpMin(p)
          return
        }
      }
      this.bubbleUpMax(index)
    }
  }

  private bubbleUpMin(index: number): void {
    while (index > 2) {
      const gp = this.grandparentIndex(index)
      if (this.heap[index]!.priority < this.heap[gp]!.priority) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private bubbleUpMax(index: number): void {
    while (index > 2) {
      const gp = this.grandparentIndex(index)
      if (this.heap[index]!.priority > this.heap[gp]!.priority) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private trickleDown(index: number): void {
    if (this.isMinLevel(index)) {
      this.trickleDownMin(index)
    } else {
      this.trickleDownMax(index)
    }
  }

  private trickleDownMin(index: number): void {
    while (2 * index + 1 < this.heap.length) {
      const m = this.indexOfSmallestDescendant(index)
      if (this.isGrandchild(index, m)) {
        if (this.heap[m]!.priority < this.heap[index]!.priority) {
          this.swap(index, m)
          const p = this.parentIndex(m)
          if (this.heap[m]!.priority > this.heap[p]!.priority) {
            this.swap(m, p)
          }
          index = m
        } else {
          break
        }
      } else {
        if (this.heap[m]!.priority < this.heap[index]!.priority) {
          this.swap(index, m)
        }
        break
      }
    }
  }

  private trickleDownMax(index: number): void {
    while (2 * index + 1 < this.heap.length) {
      const m = this.indexOfLargestDescendant(index)
      if (this.isGrandchild(index, m)) {
        if (this.heap[m]!.priority > this.heap[index]!.priority) {
          this.swap(index, m)
          const p = this.parentIndex(m)
          if (this.heap[m]!.priority < this.heap[p]!.priority) {
            this.swap(m, p)
          }
          index = m
        } else {
          break
        }
      } else {
        if (this.heap[m]!.priority > this.heap[index]!.priority) {
          this.swap(index, m)
        }
        break
      }
    }
  }

  private indexOfSmallestDescendant(index: number): number {
    const fc = 2 * index + 1
    const sc = fc + 1
    let smallest = fc
    if (sc < this.heap.length && this.heap[sc]!.priority < this.heap[smallest]!.priority) {
      smallest = sc
    }
    for (let gc = 4 * index + 3; gc <= 4 * index + 6; gc++) {
      if (gc < this.heap.length && this.heap[gc]!.priority < this.heap[smallest]!.priority) {
        smallest = gc
      }
    }
    return smallest
  }

  private indexOfLargestDescendant(index: number): number {
    const fc = 2 * index + 1
    const sc = fc + 1
    let largest = fc
    if (sc < this.heap.length && this.heap[sc]!.priority > this.heap[largest]!.priority) {
      largest = sc
    }
    for (let gc = 4 * index + 3; gc <= 4 * index + 6; gc++) {
      if (gc < this.heap.length && this.heap[gc]!.priority > this.heap[largest]!.priority) {
        largest = gc
      }
    }
    return largest
  }

  private isGrandchild(index: number, candidate: number): boolean {
    return candidate >= 4 * index + 3 && candidate <= 4 * index + 6
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export { DEFAULT_MINMAX_HEAP_OPTIONS } from './types.js'
export type { HeapItem, MinMaxHeapOptions } from './types.js'
