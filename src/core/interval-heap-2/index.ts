import type { Comparator, IntervalHeapOptions, IntervalHeapStats } from './types.js'

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class IntervalHeap<T> {
  private heap: T[] = []
  private _size = 0
  private compare: Comparator<T>

  constructor(options?: IntervalHeapOptions<T>) {
    this.compare = options?.comparator ?? defaultComparator
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  push(value: T): void {
    this.heap[this._size] = value
    this._size++
    if (this._size <= 1) return
    const nodeIdx = (this._size - 1) >> 1
    this.ensureNodeOrder(nodeIdx)
    this.bubbleUp(nodeIdx)
  }

  peekMin(): T | undefined {
    if (this._size === 0) return undefined
    return this.heap[0]!
  }

  peekMax(): T | undefined {
    if (this._size === 0) return undefined
    if (this._size === 1) return this.heap[0]!
    return this.heap[1]!
  }

  popMin(): T | undefined {
    if (this._size === 0) return undefined
    const min = this.heap[0]!
    if (this._size === 1) {
      this.heap.length = 0
      this._size = 0
      return min
    }
    this._size--
    this.heap[0] = this.heap[this._size]!
    this.heap.length = this._size
    if (this._size > 1) {
      this.ensureNodeOrder(0)
      this.trickleDownMin(0)
    }
    return min
  }

  popMax(): T | undefined {
    if (this._size === 0) return undefined
    if (this._size === 1) {
      const val = this.heap[0]!
      this.heap.length = 0
      this._size = 0
      return val
    }
    const max = this.heap[1]!
    this._size--
    if (this._size === 1) {
      this.heap.length = 1
      return max
    }
    this.heap[1] = this.heap[this._size]!
    this.heap.length = this._size
    this.ensureNodeOrder(0)
    this.trickleDownMax(0)
    return max
  }

  clear(): void {
    this.heap.length = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.heap[i]!)
    }
    return result
  }

  contains(value: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.compare(this.heap[i]!, value) === 0) return true
    }
    return false
  }

  remove(value: T): boolean {
    let idx = -1
    for (let i = 0; i < this._size; i++) {
      if (this.compare(this.heap[i]!, value) === 0) {
        idx = i
        break
      }
    }
    if (idx === -1) return false
    this.removeAt(idx)
    return true
  }

  replace(oldValue: T, newValue: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.compare(this.heap[i]!, oldValue) === 0) {
        this.heap[i] = newValue
        const nodeIdx = i >> 1
        this.fixNode(nodeIdx)
        return true
      }
    }
    return false
  }

  getStats(): IntervalHeapStats {
    const nodeCount = Math.ceil(this._size / 2)
    return {
      size: this._size,
      nodeCount,
      hasSingleElement: this._size % 2 === 1,
    }
  }

  static from<T>(arr: T[], options?: IntervalHeapOptions<T>): IntervalHeap<T> {
    const heap = new IntervalHeap<T>(options)
    for (const item of arr) {
      heap.push(item)
    }
    return heap
  }

  private numNodes(): number {
    return Math.ceil(this._size / 2)
  }

  private maxPosOf(nodeIdx: number): number {
    return nodeIdx * 2 + 1 < this._size ? nodeIdx * 2 + 1 : nodeIdx * 2
  }

  private ensureNodeOrder(nodeIdx: number): void {
    const minPos = nodeIdx * 2
    const maxPos = nodeIdx * 2 + 1
    if (maxPos >= this._size) return
    if (this.compare(this.heap[minPos]!, this.heap[maxPos]!) > 0) {
      const tmp = this.heap[minPos]!
      this.heap[minPos] = this.heap[maxPos]!
      this.heap[maxPos] = tmp
    }
  }

  private bubbleUp(nodeIdx: number): void {
    while (nodeIdx > 0) {
      const parent = (nodeIdx - 1) >> 1
      let changed = false

      if (this.compare(this.heap[nodeIdx * 2]!, this.heap[parent * 2]!) < 0) {
        const tmp = this.heap[nodeIdx * 2]!
        this.heap[nodeIdx * 2] = this.heap[parent * 2]!
        this.heap[parent * 2] = tmp
        this.ensureNodeOrder(parent)
        changed = true
      }

      const nMaxPos = this.maxPosOf(nodeIdx)
      const pMaxPos = this.maxPosOf(parent)
      if (this.compare(this.heap[nMaxPos]!, this.heap[pMaxPos]!) > 0) {
        const tmp = this.heap[nMaxPos]!
        this.heap[nMaxPos] = this.heap[pMaxPos]!
        this.heap[pMaxPos] = tmp
        this.ensureNodeOrder(parent)
        changed = true
      }

      if (!changed) break
      this.ensureNodeOrder(nodeIdx)
      nodeIdx = parent
    }
  }

  private trickleDownMin(nodeIdx: number): void {
    const nn = this.numNodes()
    while (true) {
      const left = 2 * nodeIdx + 1
      const right = 2 * nodeIdx + 2
      let smallest = nodeIdx

      if (left < nn && this.compare(this.heap[left * 2]!, this.heap[smallest * 2]!) < 0) {
        smallest = left
      }
      if (right < nn && this.compare(this.heap[right * 2]!, this.heap[smallest * 2]!) < 0) {
        smallest = right
      }

      if (smallest === nodeIdx) break

      const tmp = this.heap[nodeIdx * 2]!
      this.heap[nodeIdx * 2] = this.heap[smallest * 2]!
      this.heap[smallest * 2] = tmp

      this.ensureNodeOrder(nodeIdx)
      this.ensureNodeOrder(smallest)

      const sMaxPos = this.maxPosOf(smallest)
      const nMaxPos = this.maxPosOf(nodeIdx)
      if (this.compare(this.heap[sMaxPos]!, this.heap[nMaxPos]!) > 0) {
        const tmp2 = this.heap[sMaxPos]!
        this.heap[sMaxPos] = this.heap[nMaxPos]!
        this.heap[nMaxPos] = tmp2
        this.ensureNodeOrder(nodeIdx)
        this.ensureNodeOrder(smallest)
      }

      nodeIdx = smallest
    }
  }

  private trickleDownMax(nodeIdx: number): void {
    const nn = this.numNodes()
    while (true) {
      const left = 2 * nodeIdx + 1
      const right = 2 * nodeIdx + 2
      let largest = nodeIdx

      if (left < nn) {
        const lMaxPos = this.maxPosOf(left)
        const lgMaxPos = this.maxPosOf(largest)
        if (this.compare(this.heap[lMaxPos]!, this.heap[lgMaxPos]!) > 0) {
          largest = left
        }
      }
      if (right < nn) {
        const rMaxPos = this.maxPosOf(right)
        const lgMaxPos = this.maxPosOf(largest)
        if (this.compare(this.heap[rMaxPos]!, this.heap[lgMaxPos]!) > 0) {
          largest = right
        }
      }

      if (largest === nodeIdx) break

      const nMaxPos = this.maxPosOf(nodeIdx)
      const lMaxPos = this.maxPosOf(largest)
      const tmp = this.heap[nMaxPos]!
      this.heap[nMaxPos] = this.heap[lMaxPos]!
      this.heap[lMaxPos] = tmp

      this.ensureNodeOrder(nodeIdx)
      this.ensureNodeOrder(largest)

      if (this.compare(this.heap[largest * 2]!, this.heap[nodeIdx * 2]!) < 0) {
        const tmp2 = this.heap[largest * 2]!
        this.heap[largest * 2] = this.heap[nodeIdx * 2]!
        this.heap[nodeIdx * 2] = tmp2
        this.ensureNodeOrder(nodeIdx)
        this.ensureNodeOrder(largest)
      }

      nodeIdx = largest
    }
  }

  private fixNode(nodeIdx: number): void {
    this.ensureNodeOrder(nodeIdx)
    this.bubbleUp(nodeIdx)
    this.ensureNodeOrder(nodeIdx)
    this.trickleDownMin(nodeIdx)
    this.ensureNodeOrder(nodeIdx)
    this.trickleDownMax(nodeIdx)
    this.ensureNodeOrder(nodeIdx)
  }

  private removeAt(idx: number): void {
    const lastIdx = this._size - 1
    if (idx === lastIdx) {
      this._size--
      this.heap.length = this._size
      return
    }
    this.heap[idx] = this.heap[lastIdx]!
    this._size--
    this.heap.length = this._size
    const nodeIdx = idx >> 1
    this.fixNode(nodeIdx)
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
    return `${IntervalHeap}({ size: ${this.size} })`
  }

  clone(): IntervalHeap<T> {
    return IntervalHeap.from(this.toArray())
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'IntervalHeap', size: this.size, items: this.toArray() }
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

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }
}
