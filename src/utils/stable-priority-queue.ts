interface Entry<T> {
  value: T
  sequence: number
}

export class StablePriorityQueue<T> {
  private readonly heap: Entry<T>[] = []
  private sequence = 0
  private readonly comparator: (a: T, b: T) => number

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator ?? ((a, b) => (a as number) - (b as number))
  }

  enqueue(value: T): void {
    const entry: Entry<T> = { value, sequence: this.sequence++ }
    this.heap.push(entry)
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
    return this.heap[0]?.value
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap.length = 0
  }

  toArray(): T[] {
    return [...this.heap].sort((a, b) => {
      const cmp = this.comparator(a.value, b.value)
      return cmp !== 0 ? cmp : a.sequence - b.sequence
    }).map(e => e.value)
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.compare(index, parent) < 0) {
        this.swap(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private sinkDown(index: number): void {
    const n = this.heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < n && this.compare(left, smallest) < 0) smallest = left
      if (right < n && this.compare(right, smallest) < 0) smallest = right
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private compare(i: number, j: number): number {
    const a = this.heap[i]!
    const b = this.heap[j]!
    const cmp = this.comparator(a.value, b.value)
    return cmp !== 0 ? cmp : a.sequence - b.sequence
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}
