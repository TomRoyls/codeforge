export interface TopKStreamOptions {
  readonly k: number
  readonly comparator?: (a: number, b: number) => number
}

interface Entry<T> {
  readonly item: T
  readonly score: number
}

export class TopKStream<T = unknown> {
  private readonly k: number
  private readonly compare: (a: number, b: number) => number
  private heap: Entry<T>[] = []
  private _processed = 0

  constructor(options: TopKStreamOptions) {
    if (options.k < 1) {
      throw new RangeError(`k must be >= 1, got ${options.k}`)
    }
    this.k = options.k
    this.compare = options.comparator ?? ((a, b) => a - b)
  }

  offer(item: T, score: number): void {
    this._processed++
    if (this.heap.length < this.k) {
      this.heap.push({ item, score })
      this.bubbleUp(this.heap.length - 1)
      return
    }
    if (this.compare(score, this.heap[0]!.score) > 0) {
      this.heap[0] = { item, score }
      this.bubbleDown(0)
    }
  }

  getTopK(): Array<{ item: T; score: number }> {
    const sorted = this.heap.slice().sort((a, b) => this.compare(b.score, a.score))
    return sorted.map((e) => ({ item: e.item, score: e.score }))
  }

  getItems(): T[] {
    return this.getTopK().map((e) => e.item)
  }

  getScores(): number[] {
    return this.getTopK().map((e) => e.score)
  }

  get minScore(): number | undefined {
    return this.heap[0]?.score
  }

  get size(): number {
    return this.heap.length
  }

  get processed(): number {
    return this._processed
  }

  get isFull(): boolean {
    return this.heap.length >= this.k
  }

  clear(): void {
    this.heap = []
    this._processed = 0
  }

  merge(other: TopKStream<T>): void {
    for (const entry of other.heap) {
      this.offer(entry.item, entry.score)
    }
  }

  static fromItems<U>(items: Array<{ item: U; score: number }>, options: TopKStreamOptions): TopKStream<U> {
    const stream = new TopKStream<U>(options)
    for (const { item, score } of items) {
      stream.offer(item, score)
    }
    return stream
  }

  private bubbleUp(index: number): void {
    let current = index
    while (current > 0) {
      const parent = (current - 1) >>> 1
      if (this.compare(this.heap[current]!.score, this.heap[parent]!.score) < 0) {
        this.swap(current, parent)
        current = parent
      } else {
        break
      }
    }
  }

  private bubbleDown(index: number): void {
    const n = this.heap.length
    let current = index
    while (true) {
      let smallest = current
      const left = 2 * current + 1
      const right = 2 * current + 2
      if (left < n && this.compare(this.heap[left]!.score, this.heap[smallest]!.score) < 0) {
        smallest = left
      }
      if (right < n && this.compare(this.heap[right]!.score, this.heap[smallest]!.score) < 0) {
        smallest = right
      }
      if (smallest !== current) {
        this.swap(current, smallest)
        current = smallest
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
