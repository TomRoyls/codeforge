export class BinaryHeap2<T> {
  private heap: T[] = []
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a, b) => a < b ? -1 : a > b ? 1 : 0)
  }

  static fromArray<T>(arr: T[], compare?: (a: T, b: T) => number): BinaryHeap2<T> {
    const h = new BinaryHeap2<T>(compare)
    h.heap = [...arr]
    for (let i = Math.floor(h.heap.length / 2) - 1; i >= 0; i--) h.siftDown(i)
    return h
  }

  push(item: T): void {
    this.heap.push(item)
    this.siftUp(this.heap.length - 1)
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }
    return top
  }

  peek(): T | undefined { return this.heap[0] }

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2)
      if (this.compare(this.heap[idx], this.heap[parent]) >= 0) break
      ;[this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]]
      idx = parent
    }
  }

  private siftDown(idx: number): void {
    const n = this.heap.length
    while (true) {
      let smallest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right
      if (smallest === idx) break
      ;[this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]]
      idx = smallest
    }
  }

  get size(): number { return this.heap.length }
  get isEmpty(): boolean { return this.heap.length === 0 }

  clear(): void { this.heap = [] }

  toArray(): T[] { return [...this.heap] }
  toString(): string { return JSON.stringify({ size: this.heap.length }) }
  toJSON(): Record<string, number> { return { size: this.heap.length } }

  clone(): BinaryHeap2<T> {
    const c = new BinaryHeap2<T>(this.compare)
    c.heap = [...this.heap]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinaryHeap2)) return false
    return this.size === other.size
  }
}
