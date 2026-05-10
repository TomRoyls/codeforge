import type { Comparator, DoubleEndedPriorityQueueOptions } from './types.js'
import { DEFAULT_DEPQ_OPTIONS } from './types.js'

export class DoubleEndedPriorityQueue<T = number> {
  private heap: T[] = []
  private compare: Comparator<T>

  constructor(options?: Partial<DoubleEndedPriorityQueueOptions<T>>) {
    if (options?.comparator) {
      this.compare = options.comparator
    } else {
      this.compare = DEFAULT_DEPQ_OPTIONS.comparator as Comparator<T>
    }
  }

  enqueue(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  dequeueMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    const min = this.heap[0]!
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      this.pushDown(0)
    }
    return min
  }

  dequeueMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()
    if (this.heap.length === 2) return this.heap.pop()
    const maxIndex =
      this.compare(this.heap[1]!, this.heap[2]!) > 0 ? 1 : 2
    const max = this.heap[maxIndex]!
    const last = this.heap.pop()
    if (maxIndex < this.heap.length && last !== undefined) {
      this.heap[maxIndex] = last
      this.pushDown(maxIndex)
    }
    return max
  }

  peekMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]!
  }

  peekMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap[0]!
    if (this.heap.length === 2) return this.heap[1]!
    return this.compare(this.heap[1]!, this.heap[2]!) > 0
      ? this.heap[1]!
      : this.heap[2]!
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

  toArray(): T[] {
    return [...this.heap]
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const heap = this.heap
    return {
      next(): IteratorResult<T> {
        if (index < heap.length) {
          return { value: heap[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === value) return true
    }
    return false
  }

  remove(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === value) {
        this.removeAtIndex(i)
        return true
      }
    }
    return false
  }

  merge(other: DoubleEndedPriorityQueue<T>): void {
    for (let i = 0; i < other.heap.length; i++) {
      this.enqueue(other.heap[i]!)
    }
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === oldValue) {
        this.heap[i] = newValue
        this.bubbleUp(i)
        return true
      }
    }
    return false
  }

  increaseKey(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === oldValue) {
        this.heap[i] = newValue
        this.pushDown(i)
        return true
      }
    }
    return false
  }

  private isMinLevel(index: number): boolean {
    return Math.floor(Math.log2(index + 1)) % 2 === 0
  }

  private parentOf(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private grandparentOf(index: number): number {
    return this.parentOf(this.parentOf(index))
  }

  private hasGrandparent(index: number): boolean {
    return index > 2
  }

  private bubbleUp(index: number): void {
    if (index === 0) return
    const parentIndex = this.parentOf(index)
    if (this.isMinLevel(index)) {
      if (this.compare(this.heap[index]!, this.heap[parentIndex]!) > 0) {
        this.swap(index, parentIndex)
        this.bubbleUpMax(parentIndex)
      } else {
        this.bubbleUpMin(index)
      }
    } else {
      if (this.compare(this.heap[index]!, this.heap[parentIndex]!) < 0) {
        this.swap(index, parentIndex)
        this.bubbleUpMin(parentIndex)
      } else {
        this.bubbleUpMax(index)
      }
    }
  }

  private bubbleUpMin(index: number): void {
    while (this.hasGrandparent(index)) {
      const gp = this.grandparentOf(index)
      if (this.compare(this.heap[index]!, this.heap[gp]!) < 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private bubbleUpMax(index: number): void {
    while (this.hasGrandparent(index)) {
      const gp = this.grandparentOf(index)
      if (this.compare(this.heap[index]!, this.heap[gp]!) > 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private pushDown(index: number): void {
    if (this.isMinLevel(index)) {
      this.pushDownMin(index)
    } else {
      this.pushDownMax(index)
    }
  }

  private pushDownMin(index: number): void {
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < this.heap.length && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < this.heap.length && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }
      const ll = 4 * index + 3
      const lr = 4 * index + 4
      const rl = 4 * index + 5
      const rr = 4 * index + 6
      if (ll < this.heap.length && this.compare(this.heap[ll]!, this.heap[smallest]!) < 0) {
        smallest = ll
      }
      if (lr < this.heap.length && this.compare(this.heap[lr]!, this.heap[smallest]!) < 0) {
        smallest = lr
      }
      if (rl < this.heap.length && this.compare(this.heap[rl]!, this.heap[smallest]!) < 0) {
        smallest = rl
      }
      if (rr < this.heap.length && this.compare(this.heap[rr]!, this.heap[smallest]!) < 0) {
        smallest = rr
      }
      if (smallest === index) break
      this.swap(index, smallest)
      if (smallest >= 4 * index + 3) {
        const parentOfSmallest = this.parentOf(smallest)
        if (this.compare(this.heap[smallest]!, this.heap[parentOfSmallest]!) > 0) {
          this.swap(smallest, parentOfSmallest)
        }
      }
      index = smallest
    }
  }

  private pushDownMax(index: number): void {
    while (true) {
      let largest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < this.heap.length && this.compare(this.heap[left]!, this.heap[largest]!) > 0) {
        largest = left
      }
      if (right < this.heap.length && this.compare(this.heap[right]!, this.heap[largest]!) > 0) {
        largest = right
      }
      const ll = 4 * index + 3
      const lr = 4 * index + 4
      const rl = 4 * index + 5
      const rr = 4 * index + 6
      if (ll < this.heap.length && this.compare(this.heap[ll]!, this.heap[largest]!) > 0) {
        largest = ll
      }
      if (lr < this.heap.length && this.compare(this.heap[lr]!, this.heap[largest]!) > 0) {
        largest = lr
      }
      if (rl < this.heap.length && this.compare(this.heap[rl]!, this.heap[largest]!) > 0) {
        largest = rl
      }
      if (rr < this.heap.length && this.compare(this.heap[rr]!, this.heap[largest]!) > 0) {
        largest = rr
      }
      if (largest === index) break
      this.swap(index, largest)
      if (largest >= 4 * index + 3) {
        const parentOfLargest = this.parentOf(largest)
        if (this.compare(this.heap[largest]!, this.heap[parentOfLargest]!) < 0) {
          this.swap(largest, parentOfLargest)
        }
      }
      index = largest
    }
  }

  private removeAtIndex(index: number): void {
    const last = this.heap.pop()
    if (index >= this.heap.length) return
    if (last !== undefined) {
      this.heap[index] = last
      this.bubbleUp(index)
      this.pushDown(index)
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export { DEFAULT_COMPARATOR, DEFAULT_STRING_COMPARATOR } from './types.js'
export type { Comparator, DoubleEndedPriorityQueueOptions } from './types.js'
