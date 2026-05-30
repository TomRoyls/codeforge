export class BoundedPriorityQueue<T> {
  private readonly heap: T[] = []

  constructor(
    private readonly _maxSize: number,
    private readonly comparator: (a: T, b: T) => number,
  ) {
    if (_maxSize < 1) throw new RangeError(`maxSize must be >= 1, got ${_maxSize}`)
  }

  push(item: T): void {
    if (this.heap.length < this._maxSize) {
      this.heap.push(item)
      this.siftUp(this.heap.length - 1)
      return
    }
    if (this.comparator(item, this.heap[0]!) < 0) {
      this.heap[0] = item
      this.siftDown(0)
    }
  }

  peek(): T | undefined {
    return this.heap[0]
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }
    return top
  }

  drain(): T[] {
    const result: T[] = []
    while (this.heap.length > 0) {
      result.push(this.pop()!)
    }
    return result
  }

  get size(): number {
    return this.heap.length
  }

  get maxSize(): number {
    return this._maxSize
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  get isFull(): boolean {
    return this.heap.length === this._maxSize
  }

  toArray(): T[] {
    return [...this.heap].sort(this.comparator)
  }

  clear(): void {
    this.heap.length = 0
  }

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1
      if (this.comparator(this.heap[idx]!, this.heap[parent]!) > 0) {
        this.swap(idx, parent)
        idx = parent
      } else {
        break
      }
    }
  }

  private siftDown(idx: number): void {
    const len = this.heap.length
    while (true) {
      let largest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this.comparator(this.heap[left]!, this.heap[largest]!) > 0) {
        largest = left
      }
      if (right < len && this.comparator(this.heap[right]!, this.heap[largest]!) > 0) {
        largest = right
      }
      if (largest !== idx) {
        this.swap(idx, largest)
        idx = largest
      } else {
        break
      }
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.heap[a]!
    this.heap[a] = this.heap[b]!
    this.heap[b] = tmp
  }
}
