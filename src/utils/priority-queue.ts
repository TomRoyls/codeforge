export interface PriorityQueueOptions<T> {
  comparator: (a: T, b: T) => number
}

export class PriorityQueue<T> {
  private readonly heap: T[] = []
  private readonly comparator: (a: T, b: T) => number

  constructor(options?: Partial<PriorityQueueOptions<T>>) {
    this.comparator = options?.comparator ?? ((a, b) => (a as number) - (b as number))
  }

  public enqueue(item: T): void {
    this.heap.push(item)
    this.siftUp(this.heap.length - 1)
  }

  public dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.siftDown(0)
    }
    return top
  }

  public peek(): T | undefined {
    return this.heap[0]
  }

  public get size(): number {
    return this.heap.length
  }

  public isEmpty(): boolean {
    return this.heap.length === 0
  }

  public clear(): void {
    this.heap.length = 0
  }

  public toArray(): T[] {
    return [...this.heap]
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.comparator(this.heap[index]!, this.heap[parent]!) < 0) {
        this.swap(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private siftDown(index: number): void {
    const len = this.heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2

      if (left < len && this.comparator(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < len && this.comparator(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}
