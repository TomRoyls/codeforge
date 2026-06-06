export type HeapType = 'min' | 'max'

export interface BinaryHeapOptions<T> {
  type?: HeapType
  comparator?: (a: T, b: T) => number
}

export class BinaryHeap<T> {
  private readonly heap: T[] = []
  private readonly isMin: boolean
  private readonly compare: (a: T, b: T) => number

  constructor(options?: BinaryHeapOptions<T>) {
    this.isMin = options?.type !== 'max'
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => (a as number) - (b as number))
  }

  push(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const root = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    return root
  }

  peek(): T | undefined {
    return this.heap[0]
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
    return [...this.heap]
  }

  toString(): string {
    return JSON.stringify(this.heap)
  }

  toJSON(): T[] {
    return [...this.heap]
  }

  clone(): BinaryHeap<T> {
    const copy = new BinaryHeap<T>({
      type: this.isMin ? 'min' : 'max',
      comparator: this.compare,
    })
    copy.heap.push(...this.heap)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinaryHeap)) return false
    if (this.heap.length !== other.heap.length) return false
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] !== other.heap[i]) return false
    }
    return true
  }

  static fromArray<T>(items: T[], options?: BinaryHeapOptions<T>): BinaryHeap<T> {
    const bh = new BinaryHeap<T>(options)
    bh.heap.push(...items)
    for (let i = Math.floor(bh.heap.length / 2) - 1; i >= 0; i--) {
      bh.sinkDown(i)
    }
    return bh
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.shouldSwap(parent, index)) {
        ;[this.heap[parent]!, this.heap[index]!] = [this.heap[index]!, this.heap[parent]!]
        index = parent
      } else {
        break
      }
    }
  }

  private sinkDown(index: number): void {
    const len = this.heap.length
    while (true) {
      let target = index
      const left = (index << 1) + 1
      const right = (index << 1) + 2
      if (left < len && this.shouldSwap(target, left)) target = left
      if (right < len && this.shouldSwap(target, right)) target = right
      if (target === index) break
      ;[this.heap[index]!, this.heap[target]!] = [this.heap[target]!, this.heap[index]!]
      index = target
    }
  }

  private shouldSwap(parent: number, child: number): boolean {
    const cmp = this.compare(this.heap[parent]!, this.heap[child]!)
    return this.isMin ? cmp > 0 : cmp < 0
  }
}
