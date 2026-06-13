export class PriorityQueue3<T> {
  private heap: Array<{ item: T; priority: number }> = []

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority })
    this.bubbleUp(this.heap.length - 1)
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.bubbleDown(0)
    }
    return top.item
  }

  peek(): T | undefined { return this.heap[0]?.item }
  peekPriority(): number | undefined { return this.heap[0]?.priority }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2)
      if (this.heap[idx].priority <= this.heap[parent].priority) break
      ;[this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]]
      idx = parent
    }
  }

  private bubbleDown(idx: number): void {
    const n = this.heap.length
    while (true) {
      let largest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < n && this.heap[left].priority > this.heap[largest].priority) largest = left
      if (right < n && this.heap[right].priority > this.heap[largest].priority) largest = right
      if (largest === idx) break
      ;[this.heap[idx], this.heap[largest]] = [this.heap[largest], this.heap[idx]]
      idx = largest
    }
  }

  get size(): number { return this.heap.length }
  get isEmpty(): boolean { return this.heap.length === 0 }

  clear(): void { this.heap = [] }

  toArray(): Array<{ item: T; priority: number }> {
    return [...this.heap]
  }
  toString(): string { return JSON.stringify({ size: this.heap.length }) }
  toJSON(): Record<string, number> { return { size: this.heap.length } }

  clone(): PriorityQueue3<T> {
    const c = new PriorityQueue3<T>()
    c.heap = this.heap.map(h => ({ ...h }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PriorityQueue3)) return false
    return this.size === other.size
  }
}
