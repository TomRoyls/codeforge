export class DAryHeap<T> {
  private heap: T[] = []
  private d: number
  private cmp: (a: T, b: T) => number

  constructor(d?: number, comparator?: (a: T, b: T) => number) {
    this.d = d ?? 4
    if (this.d < 2) {
      this.d = 2
    }
    this.cmp = comparator ?? this.defaultComparator
  }

  private defaultComparator(a: T, b: T): number {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  insert(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  extract(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.trickleDown(0)
    }
    return top
  }

  peek(): T | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]!
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  heapify(array: T[]): void {
    this.heap = [...array]
    const start = Math.floor((this.heap.length - 2) / this.d)
    for (let i = start; i >= 0; i--) {
      this.trickleDown(i)
    }
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

  merge(other: DAryHeap<T>): DAryHeap<T> {
    const result = new DAryHeap<T>(this.d, this.cmp)
    for (let i = 0; i < this.heap.length; i++) {
      result.insert(this.heap[i]!)
    }
    for (let i = 0; i < other.heap.length; i++) {
      result.insert(other.heap[i]!)
    }
    return result
  }

  clear(): void {
    this.heap.length = 0
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this.heap.length) {
      return
    }
    const old = this.heap[index]!
    this.heap[index] = value
    const cmpResult = this.cmp(value, old)
    if (cmpResult > 0) {
      this.bubbleUp(index)
    } else if (cmpResult < 0) {
      this.trickleDown(index)
    }
  }

  getTimeComplexity(): string {
    const d = this.d
    const insertLog = `O(log${d}(n))`
    const extractLog = `O(${d} * log${d}(n))`
    return `insert: ${insertLog}, extract: ${extractLog}`
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / this.d)
  }

  private child(index: number, k: number): number {
    return this.d * index + k + 1
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index)
      if (this.cmp(this.heap[index]!, this.heap[p]!) > 0) {
        this.swap(index, p)
        index = p
      } else {
        break
      }
    }
  }

  private trickleDown(index: number): void {
    const n = this.heap.length
    while (true) {
      let largest = index
      for (let k = 0; k < this.d; k++) {
        const c = this.child(index, k)
        if (c < n && this.cmp(this.heap[c]!, this.heap[largest]!) > 0) {
          largest = c
        }
      }
      if (largest !== index) {
        this.swap(index, largest)
        index = largest
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = tmp
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
    return `${DAryHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
}
