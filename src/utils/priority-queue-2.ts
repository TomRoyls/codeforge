export class PriorityQueue2<T> {
  private heap: Array<{ value: T; priority: number }> = []

  enqueue(value: T, priority: number): void {
    this.heap.push({ value, priority })
    this.bubbleUp(this.heap.length - 1)
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) { this.heap[0] = last; this.sinkDown(0) }
    return top.value
  }

  peek(): T | undefined { return this.heap[0]?.value }

  get size(): number { return this.heap.length }
  get isEmpty(): boolean { return this.heap.length === 0 }

  clear(): void { this.heap = [] }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.heap[i]!.priority < this.heap[parent]!.priority) {
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
      if (left < len && this.heap[left]!.priority < this.heap[smallest]!.priority) smallest = left
      if (right < len && this.heap[right]!.priority < this.heap[smallest]!.priority) smallest = right
      if (smallest !== i) { [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]; i = smallest }
      else break
    }
  }

  toArray(): T[] { return this.heap.map((h) => h.value) }
  toString(): string { return JSON.stringify({ size: this.heap.length }) }
  toJSON(): Record<string, number> { return { size: this.heap.length } }

  clone(): PriorityQueue2<T> {
    const c = new PriorityQueue2<T>()
    c.heap = this.heap.map((h) => ({ ...h }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PriorityQueue2)) return false
    return this.size === other.size
  }
}
