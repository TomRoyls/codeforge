import type { Comparator, MinMaxHeapOptions, MinMaxHeapStats } from './types.js'

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class MinMaxHeap<T> {
  private heap: T[] = []
  private cmp: Comparator<T>

  constructor(options?: MinMaxHeapOptions<T>) {
    this.cmp = options?.comparator ?? defaultComparator
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  push(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  peekMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]!
  }

  peekMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap[0]!
    if (this.heap.length === 2) return this.heap[1]!
    return this.cmp(this.heap[1]!, this.heap[2]!) >= 0 ? this.heap[1]! : this.heap[2]!
  }

  popMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    const min = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.trickleDownMin(0)
    }
    return min
  }

  popMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()!
    const maxIndex = this.maxIndex()
    const max = this.heap[maxIndex]!
    const last = this.heap.pop()!
    if (maxIndex < this.heap.length) {
      this.heap[maxIndex] = last
      this.trickleDownMax(maxIndex)
    }
    return max
  }

  clear(): void {
    this.heap.length = 0
  }

  toArray(): T[] {
    return [...this.heap]
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.cmp(this.heap[i]!, value) === 0) return true
    }
    return false
  }

  containsWith(predicate: (value: T) => boolean): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (predicate(this.heap[i]!)) return true
    }
    return false
  }

  remove(value: T): boolean {
    const index = this.heap.findIndex((v) => this.cmp(v, value) === 0)
    if (index === -1) return false
    this.removeAt(index)
    return true
  }

  removeFirst(predicate: (value: T) => boolean): boolean {
    const index = this.heap.findIndex((v) => predicate(v))
    if (index === -1) return false
    this.removeAt(index)
    return true
  }

  stats(): MinMaxHeapStats {
    const n = this.heap.length
    let height = 0
    if (n > 0) {
      height = Math.floor(Math.log2(n)) + 1
    }
    return { size: n, height }
  }

  clone(): MinMaxHeap<T> {
    const h = new MinMaxHeap<T>({ comparator: this.cmp })
    h.heap = [...this.heap]
    return h
  }

  merge(other: MinMaxHeap<T>): void {
    for (let i = 0; i < other.heap.length; i++) {
      this.push(other.heap[i]!)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.heap.length; i++) {
      yield this.heap[i]!
    }
  }

  static from<T>(arr: T[], options?: MinMaxHeapOptions<T>): MinMaxHeap<T> {
    const h = new MinMaxHeap<T>(options)
    for (const item of arr) {
      h.push(item)
    }
    return h
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

  private parent(index: number): number {
    return ((index - 1) >> 1)
  }

  private grandparent(index: number): number {
    return ((index - 3) >> 2)
  }

  private hasParent(index: number): boolean {
    return index > 0
  }

  private hasGrandparent(index: number): boolean {
    return index > 2
  }

  private leftChild(index: number): number {
    return 2 * index + 1
  }

  private rightChild(index: number): number {
    return 2 * index + 2
  }

  private hasChildren(index: number): boolean {
    return 2 * index + 1 < this.heap.length
  }

  private bubbleUp(index: number): void {
    if (!this.hasParent(index)) return
    if (this.isMinLevel(index)) {
      if (this.cmp(this.heap[index]!, this.heap[this.parent(index)]!) > 0) {
        this.swap(index, this.parent(index))
        this.bubbleUpMax(this.parent(index))
      } else {
        this.bubbleUpMin(index)
      }
    } else {
      if (this.cmp(this.heap[index]!, this.heap[this.parent(index)]!) < 0) {
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
      if (this.cmp(this.heap[index]!, this.heap[gp]!) < 0) {
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
      if (this.cmp(this.heap[index]!, this.heap[gp]!) > 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private trickleDownMin(index: number): void {
    while (this.hasChildren(index)) {
      let smallest = index
      const left = this.leftChild(index)
      const right = this.rightChild(index)

      if (left < this.heap.length && this.cmp(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < this.heap.length && this.cmp(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }

      const ll = this.leftChild(left)
      const lr = this.rightChild(left)
      const rl = this.leftChild(right)
      const rr = this.rightChild(right)

      if (ll < this.heap.length && this.cmp(this.heap[ll]!, this.heap[smallest]!) < 0) {
        smallest = ll
      }
      if (lr < this.heap.length && this.cmp(this.heap[lr]!, this.heap[smallest]!) < 0) {
        smallest = lr
      }
      if (rl < this.heap.length && this.cmp(this.heap[rl]!, this.heap[smallest]!) < 0) {
        smallest = rl
      }
      if (rr < this.heap.length && this.cmp(this.heap[rr]!, this.heap[smallest]!) < 0) {
        smallest = rr
      }

      if (smallest === index) break

      if (smallest === left || smallest === right) {
        this.swap(index, smallest)
        index = smallest
      } else {
        this.swap(index, smallest)
        const parentOfSmallest = this.parent(smallest)
        if (this.cmp(this.heap[smallest]!, this.heap[parentOfSmallest]!) > 0) {
          this.swap(smallest, parentOfSmallest)
        }
        index = smallest
      }
    }
  }

  private trickleDownMax(index: number): void {
    while (this.hasChildren(index)) {
      let largest = index
      const left = this.leftChild(index)
      const right = this.rightChild(index)

      if (left < this.heap.length && this.cmp(this.heap[left]!, this.heap[largest]!) > 0) {
        largest = left
      }
      if (right < this.heap.length && this.cmp(this.heap[right]!, this.heap[largest]!) > 0) {
        largest = right
      }

      const ll = this.leftChild(left)
      const lr = this.rightChild(left)
      const rl = this.leftChild(right)
      const rr = this.rightChild(right)

      if (ll < this.heap.length && this.cmp(this.heap[ll]!, this.heap[largest]!) > 0) {
        largest = ll
      }
      if (lr < this.heap.length && this.cmp(this.heap[lr]!, this.heap[largest]!) > 0) {
        largest = lr
      }
      if (rl < this.heap.length && this.cmp(this.heap[rl]!, this.heap[largest]!) > 0) {
        largest = rl
      }
      if (rr < this.heap.length && this.cmp(this.heap[rr]!, this.heap[largest]!) > 0) {
        largest = rr
      }

      if (largest === index) break

      if (largest === left || largest === right) {
        this.swap(index, largest)
        index = largest
      } else {
        this.swap(index, largest)
        const parentOfLargest = this.parent(largest)
        if (this.cmp(this.heap[largest]!, this.heap[parentOfLargest]!) < 0) {
          this.swap(largest, parentOfLargest)
        }
        index = largest
      }
    }
  }

  private maxIndex(): number {
    if (this.heap.length === 1) return 0
    if (this.heap.length === 2) return 1
    return this.cmp(this.heap[1]!, this.heap[2]!) >= 0 ? 1 : 2
  }

  private removeAt(index: number): void {
    if (index === this.heap.length - 1) {
      this.heap.pop()
      return
    }
    const last = this.heap.pop()!
    this.heap[index] = last
    this.bubbleUp(index)
    if (this.isMinLevel(index)) {
      this.trickleDownMin(index)
    } else {
      this.trickleDownMax(index)
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = tmp
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `MinMaxHeap({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'MinMaxHeap', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  static of<T>(...items: T[]): MinMaxHeap<T> {
    return MinMaxHeap.from(items)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
