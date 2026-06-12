export class IndexedPriorityQueue<T> {
  private heap: Array<{ index: number; value: T; priority: number }> = []
  private indexMap = new Map<number, number>()

  push(index: number, value: T, priority: number): void {
    this.heap.push({ index, value, priority })
    const pos = this.heap.length - 1
    this.indexMap.set(index, pos)
    this.bubbleUp(pos)
  }

  pop(): { index: number; value: T; priority: number } | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    this.indexMap.delete(top.index)
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.indexMap.set(last.index, 0)
      this.sinkDown(0)
    }
    return top
  }

  get(index: number): T | undefined {
    const pos = this.indexMap.get(index)
    if (pos === undefined) return undefined
    return this.heap[pos]?.value
  }

  has(index: number): boolean {
    return this.indexMap.has(index)
  }

  updatePriority(index: number, newPriority: number): boolean {
    const pos = this.indexMap.get(index)
    if (pos === undefined) return false
    const oldPriority = this.heap[pos]!.priority
    this.heap[pos]!.priority = newPriority
    if (newPriority < oldPriority) {
      this.bubbleUp(pos)
    } else {
      this.sinkDown(pos)
    }
    return true
  }

  get size(): number {
    return this.heap.length
  }

  peek(): { index: number; value: T; priority: number } | undefined {
    return this.heap[0]
  }

  clear(): void {
    this.heap = []
    this.indexMap.clear()
  }

  toArray(): Array<{ index: number; value: T; priority: number }> {
    return [...this.heap]
  }

  toString(): string {
    return JSON.stringify(this.heap)
  }

  toJSON(): Array<{ index: number; value: T; priority: number }> {
    return this.toArray()
  }

  clone(): IndexedPriorityQueue<T> {
    const copy = new IndexedPriorityQueue<T>()
    copy.heap = this.heap.map((e) => ({ ...e }))
    copy.indexMap = new Map(this.indexMap)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IndexedPriorityQueue)) return false
    if (this.size !== other.size) return false
    return true
  }

  private bubbleUp(pos: number): void {
    while (pos > 0) {
      const parent = Math.floor((pos - 1) / 2)
      if (this.heap[parent]!.priority <= this.heap[pos]!.priority) break
      this.swap(parent, pos)
      pos = parent
    }
  }

  private sinkDown(pos: number): void {
    const len = this.heap.length
    while (true) {
      let smallest = pos
      const left = 2 * pos + 1
      const right = 2 * pos + 2
      if (left < len && this.heap[left]!.priority < this.heap[smallest]!.priority) smallest = left
      if (right < len && this.heap[right]!.priority < this.heap[smallest]!.priority) smallest = right
      if (smallest === pos) break
      this.swap(pos, smallest)
      pos = smallest
    }
  }

  private swap(a: number, b: number): void {
    const temp = this.heap[a]!
    this.heap[a] = this.heap[b]!
    this.heap[b] = temp
    this.indexMap.set(this.heap[a]!.index, a)
    this.indexMap.set(this.heap[b]!.index, b)
  }
}
