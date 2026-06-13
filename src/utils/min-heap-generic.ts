export class MinHeapGeneric<T> {
  private heap: Array<{ priority: number; value: T }> = []

  push(value: T, priority: number): void {
    this.heap.push({ priority, value })
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): T | undefined {
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

  get size(): number { return this.heap.length }
  get isEmpty(): boolean { return this.heap.length === 0 }

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
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]
        i = smallest
      } else break
    }
  }

  clear(): void { this.heap = [] }

  toArray(): T[] {
    return [...this.heap].sort((a, b) => a.priority - b.priority).map((e) => e.value)
  }

  toString(): string { return JSON.stringify({ size: this.size }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): MinHeapGeneric<T> {
    const copy = new MinHeapGeneric<T>()
    copy.heap = this.heap.map((e) => ({ ...e }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MinHeapGeneric)) return false
    return this.size === other.size
  }
}
