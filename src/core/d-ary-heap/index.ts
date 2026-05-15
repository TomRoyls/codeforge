import type { DAryHeapOptions } from './types.js'

export class DAryHeap<T = number> {
  private heap: T[] = []
  private arity: number
  private compare: (a: T, b: T) => number

  constructor(options?: DAryHeapOptions<T>) {
    this.arity = options?.d ?? options?.arity ?? 4
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  push(item: T): void {
    this.heap.push(item)
    this.siftUp(this.heap.length - 1)
  }

  pop(): T {
    if (this.heap.length === 0) {
      throw new Error('Heap is empty')
    }
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }
    return top
  }

  peek(): T {
    if (this.heap.length === 0) {
      throw new Error('Heap is empty')
    }
    return this.heap[0]!
  }

  pushPop(item: T): T {
    if (this.heap.length === 0) {
      this.heap.push(item)
      return item
    }
    if (this.compare(item, this.heap[0]!) <= 0) {
      return item
    }
    const top = this.heap[0]!
    this.heap[0] = item
    this.siftDown(0)
    return top
  }

  popPush(item: T): T {
    if (this.heap.length === 0) {
      throw new Error('Heap is empty')
    }
    const top = this.heap[0]!
    this.heap[0] = item
    this.siftDown(0)
    return top
  }

  replace(item: T): T {
    return this.popPush(item)
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

  toSortedArray(): T[] {
    const copy = [...this.heap]
    const result: T[] = []
    while (copy.length > 0) {
      result.push(copy[0]!)
      const last = copy.pop()!
      if (copy.length > 0) {
        copy[0] = last
        this.siftDownArray(copy, 0)
      }
    }
    return result
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        return true
      }
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        this.removeAt(i)
        return true
      }
    }
    return false
  }

  update(item: T, newItem: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        this.heap[i] = newItem
        const parentIdx = this.parentIndex(i)
        if (i > 0 && this.compare(newItem, this.heap[parentIdx]!) < 0) {
          this.siftUp(i)
        } else {
          this.siftDown(i)
        }
        return true
      }
    }
    return false
  }

  merge(other: DAryHeap<T>): void {
    const items = other.toArray()
    for (let i = 0; i < items.length; i++) {
      this.push(items[i]!)
    }
  }

  clone(): DAryHeap<T> {
    const cloned = new DAryHeap<T>({
      arity: this.arity,
      comparator: this.compare,
    })
    cloned.heap = this.heap.map(item => typeof item === 'object' && item !== null ? structuredClone(item) : item) as T[]
    return cloned
  }

  static fromArray<U>(
    items: U[],
    options?: DAryHeapOptions<U>
  ): DAryHeap<U> {
    const heap = new DAryHeap<U>(options)
    heap.heap = [...items]
    const arity = heap.arity
    const start = Math.max(0, Math.floor((items.length - 2) / arity))
    for (let i = start; i >= 0; i--) {
      heap.siftDown(i)
    }
    return heap
  }

  forEach(callback: (item: T, index: number) => void): void {
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

  private parentIndex(index: number): number {
    return Math.floor((index - 1) / this.arity)
  }

  private firstChildIndex(index: number): number {
    return this.arity * index + 1
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = this.parentIndex(index)
      if (this.compare(this.heap[index]!, this.heap[parent]!) < 0) {
        this.swap(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const firstChild = this.firstChildIndex(index)
      for (let c = 0; c < this.arity; c++) {
        const childIdx = firstChild + c
        if (
          childIdx < length &&
          this.compare(this.heap[childIdx]!, this.heap[smallest]!) < 0
        ) {
          smallest = childIdx
        }
      }
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private siftDownArray(arr: T[], index: number): void {
    const length = arr.length
    while (true) {
      let smallest = index
      const firstChild = this.firstChildIndex(index)
      for (let c = 0; c < this.arity; c++) {
        const childIdx = firstChild + c
        if (
          childIdx < length &&
          this.compare(arr[childIdx]!, arr[smallest]!) < 0
        ) {
          smallest = childIdx
        }
      }
      if (smallest !== index) {
        const temp = arr[index]!
        arr[index] = arr[smallest]!
        arr[smallest] = temp
        index = smallest
      } else {
        break
      }
    }
  }

  private removeAt(index: number): void {
    const last = this.heap.pop()!
    if (index >= this.heap.length) {
      return
    }
    if (this.heap.length > 0) {
      this.heap[index] = last
      const parentIdx = this.parentIndex(index)
      if (
        index > 0 &&
        this.compare(this.heap[index]!, this.heap[parentIdx]!) < 0
      ) {
        this.siftUp(index)
      } else {
        this.siftDown(index)
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}

export type { DAryHeapOptions } from './types.js'
