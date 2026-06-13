export class TopKHeap<T> {
  private heap: Array<{ value: T; score: number }> = []
  private k: number

  constructor(k: number) {
    this.k = k
  }

  add(value: T, score: number): void {
    if (this.heap.length < this.k) {
      this.heap.push({ value, score })
      this.bubbleUp(this.heap.length - 1)
    } else if (score > this.heap[0]!.score) {
      this.heap[0] = { value, score }
      this.sinkDown(0)
    }
  }

  get top(): Array<{ value: T; score: number }> {
    return [...this.heap].sort((a, b) => b.score - a.score)
  }

  get size(): number { return this.heap.length }
  get isEmpty(): boolean { return this.heap.length === 0 }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.heap[i]!.score < this.heap[parent]!.score) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]]
        i = parent
      } else break
    }
  }

  private sinkDown(i: number): void {
    const len = this.heap.length
    while (true) {
      let smallest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < len && this.heap[left]!.score < this.heap[smallest]!.score) smallest = left
      if (right < len && this.heap[right]!.score < this.heap[smallest]!.score) smallest = right
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]
        i = smallest
      } else break
    }
  }

  clear(): void { this.heap = [] }

  toArray(): Array<{ value: T; score: number }> { return this.top }
  toString(): string { return JSON.stringify({ k: this.k, size: this.size }) }
  toJSON(): Record<string, number> { return { k: this.k, size: this.size } }

  clone(): TopKHeap<T> {
    const c = new TopKHeap<T>(this.k)
    c.heap = this.heap.map((e) => ({ ...e }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TopKHeap)) return false
    return this.k === other.k && this.size === other.size
  }
}
