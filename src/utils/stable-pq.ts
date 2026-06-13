export class StablePQ<T> {
  private heap: Array<{ priority: number; sequence: number; value: T }> = []
  private sequence = 0

  enqueue(value: T, priority: number): void {
    this.heap.push({ priority, sequence: this.sequence++, value })
    this.bubbleUp(this.heap.length - 1)
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    return top.value
  }

  peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0]!.value : undefined
  }

  peekPriority(): number | undefined {
    return this.heap.length > 0 ? this.heap[0]!.priority : undefined
  }

  get size(): number {
    return this.heap.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.compare(index, parent) < 0) {
        this.swap(index, parent)
        index = parent
      } else break
    }
  }

  private sinkDown(index: number): void {
    const len = this.heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < len && this.compare(left, smallest) < 0) smallest = left
      if (right < len && this.compare(right, smallest) < 0) smallest = right
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else break
    }
  }

  private compare(a: number, b: number): number {
    const ha = this.heap[a]!
    const hb = this.heap[b]!
    if (ha.priority !== hb.priority) return ha.priority - hb.priority
    return ha.sequence - hb.sequence
  }

  private swap(a: number, b: number): void {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]]
  }

  clear(): void {
    this.heap = []
    this.sequence = 0
  }

  toArray(): T[] {
    return [...this.heap].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return a.sequence - b.sequence
    }).map((e) => e.value)
  }

  toString(): string {
    return JSON.stringify({ size: this.size })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size }
  }

  clone(): StablePQ<T> {
    const copy = new StablePQ<T>()
    copy.heap = this.heap.map((e) => ({ ...e }))
    copy.sequence = this.sequence
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof StablePQ)) return false
    return this.size === other.size
  }
}
