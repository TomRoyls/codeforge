import type { CompareFn } from './types.js'
import { DEFAULT_COMPARE } from './types.js'

export class PriorityDeque<T = number> {
  private heap: T[] = []
  private compare: CompareFn<T>

  constructor(compare?: CompareFn<T>) {
    this.compare = (compare ?? DEFAULT_COMPARE) as CompareFn<T>
  }

  push(item: T): void {
    this.heap.push(item)
    this.bubbleUp(this.heap.length - 1)
  }

  popMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    if (this.heap.length === 1) {
      return this.heap.pop()
    }
    const min = this.heap[0]!
    const last = this.heap.pop()!
    this.heap[0] = last
    this.sinkDown(0)
    return min
  }

  popMax(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const maxIndex = this.findMaxIndex()
    const max = this.heap[maxIndex]!
    if (maxIndex === this.heap.length - 1) {
      this.heap.pop()
      return max
    }
    const last = this.heap.pop()!
    this.heap[maxIndex] = last
    this.rebalance(maxIndex)
    return max
  }

  peekMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]!
  }

  peekMax(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    if (this.heap.length === 1) {
      return this.heap[0]!
    }
    if (this.heap.length === 2) {
      return this.heap[1]!
    }
    const left = this.heap[1]!
    const right = this.heap[2]!
    return this.compare(left, right) >= 0 ? left : right
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
    const copy = [...this.heap]
    const result: T[] = []
    const temp = new PriorityDeque<T>(this.compare)
    temp.heap = copy
    while (temp.heap.length > 0) {
      result.push(temp.popMin()!)
    }
    return result
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === item) {
        return true
      }
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === item) {
        this.removeAtIndex(i)
        return true
      }
    }
    return false
  }

  update(oldItem: T, newItem: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] === oldItem) {
        this.heap[i] = newItem
        this.rebalance(i)
        return true
      }
    }
    return false
  }

  merge(other: PriorityDeque<T>): PriorityDeque<T> {
    const result = this.clone()
    for (let i = 0; i < other.heap.length; i++) {
      result.push(other.heap[i]!)
    }
    return result
  }

  clone(): PriorityDeque<T> {
    const copy = new PriorityDeque<T>(this.compare)
    copy.heap = [...this.heap]
    return copy
  }

  drain(): T[] {
    const result: T[] = []
    while (this.heap.length > 0) {
      result.push(this.popMin()!)
    }
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const items = [...this.heap]
    return {
      next: () => {
        if (index >= items.length) {
          return { value: undefined, done: true } as IteratorResult<T>
        }
        return { value: items[index++]!, done: false }
      },
    }
  }

  static fromArray<T>(items: T[], compare?: CompareFn<T>): PriorityDeque<T> {
    const deque = new PriorityDeque<T>(compare)
    deque.heap = [...items]
    deque.buildHeap()
    return deque
  }

  private buildHeap(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.trickleDown(i)
    }
  }

  private isMinLevel(index: number): boolean {
    let level = 0
    let i = index
    while (i > 0) {
      i = Math.floor((i - 1) / 2)
      level++
    }
    return level % 2 === 0
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private grandparent(index: number): number {
    return this.parent(this.parent(index))
  }

  private hasParent(index: number): boolean {
    return index > 0
  }

  private hasGrandparent(index: number): boolean {
    return index > 2
  }

  private children(index: number): number[] {
    const result: number[] = []
    const left = 2 * index + 1
    const right = 2 * index + 2
    if (left < this.heap.length) result.push(left)
    if (right < this.heap.length) result.push(right)
    return result
  }

  private grandchildren(index: number): number[] {
    const kids = this.children(index)
    const result: number[] = []
    for (const child of kids) {
      const gc = this.children(child)
      for (const g of gc) {
        result.push(g)
      }
    }
    return result
  }

  private bubbleUp(index: number): void {
    if (!this.hasParent(index)) return
    const current = this.heap[index]!
    if (this.isMinLevel(index)) {
      if (this.compare(current, this.heap[this.parent(index)]!) > 0) {
        this.swap(index, this.parent(index))
        this.bubbleUpMax(this.parent(index))
      } else {
        this.bubbleUpMin(index)
      }
    } else {
      if (this.compare(current, this.heap[this.parent(index)]!) < 0) {
        this.swap(index, this.parent(index))
        this.bubbleUpMin(this.parent(index))
      } else {
        this.bubbleUpMax(index)
      }
    }
  }

  private bubbleUpMin(index: number): void {
    while (this.hasGrandparent(index)) {
      const gp = this.grandparent(index)
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
      const gp = this.grandparent(index)
      if (this.compare(this.heap[index]!, this.heap[gp]!) > 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private sinkDown(index: number): void {
    if (this.isMinLevel(index)) {
      this.trickleDownMin(index)
    } else {
      this.trickleDownMax(index)
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
    while (true) {
      const descendants = [...this.children(index), ...this.grandchildren(index)]
      if (descendants.length === 0) break
      let smallest = descendants[0]!
      for (let i = 1; i < descendants.length; i++) {
        if (this.compare(this.heap[descendants[i]!]!, this.heap[smallest]!) < 0) {
          smallest = descendants[i]!
        }
      }
      if (this.grandchildren(index).includes(smallest)) {
        if (this.compare(this.heap[smallest]!, this.heap[index]!) < 0) {
          this.swap(smallest, index)
          if (this.compare(this.heap[smallest]!, this.heap[this.parent(smallest)]!) > 0) {
            this.swap(smallest, this.parent(smallest))
          }
          index = smallest
        } else {
          break
        }
      } else {
        if (this.compare(this.heap[smallest]!, this.heap[index]!) < 0) {
          this.swap(smallest, index)
        }
        break
      }
    }
  }

  private trickleDownMax(index: number): void {
    while (true) {
      const descendants = [...this.children(index), ...this.grandchildren(index)]
      if (descendants.length === 0) break
      let largest = descendants[0]!
      for (let i = 1; i < descendants.length; i++) {
        if (this.compare(this.heap[descendants[i]!]!, this.heap[largest]!) > 0) {
          largest = descendants[i]!
        }
      }
      if (this.grandchildren(index).includes(largest)) {
        if (this.compare(this.heap[largest]!, this.heap[index]!) > 0) {
          this.swap(largest, index)
          if (this.compare(this.heap[largest]!, this.heap[this.parent(largest)]!) < 0) {
            this.swap(largest, this.parent(largest))
          }
          index = largest
        } else {
          break
        }
      } else {
        if (this.compare(this.heap[largest]!, this.heap[index]!) > 0) {
          this.swap(largest, index)
        }
        break
      }
    }
  }

  private findMaxIndex(): number {
    if (this.heap.length === 1) return 0
    if (this.heap.length === 2) return 1
    const left = this.heap[1]!
    const right = this.heap[2]!
    return this.compare(left, right) >= 0 ? 1 : 2
  }

  private removeAtIndex(index: number): void {
    if (index === this.heap.length - 1) {
      this.heap.pop()
      return
    }
    const last = this.heap.pop()!
    this.heap[index] = last
    this.rebalance(index)
  }

  private rebalance(index: number): void {
    if (index === 0 || this.heap.length <= 1) {
      if (this.heap.length > 1) {
        this.sinkDown(index)
      }
      return
    }
    const oldValue = this.heap[index]
    this.bubbleUp(index)
    if (this.heap[index] === oldValue) {
      this.sinkDown(index)
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export { DEFAULT_COMPARE } from './types.js'
export type { CompareFn, PriorityDequeOptions } from './types.js'
