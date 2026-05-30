export type MonotonicMode = 'min' | 'max'

export interface MonotonicQueueOptions {
  mode?: MonotonicMode
  windowSize?: number
}

export class MonotonicQueue<T> {
  private readonly data: T[] = []
  private dataHead = 0
  private dataTail = 0
  private readonly deque: T[] = []
  private dequeHead = 0
  private dequeTail = 0
  private readonly mode: MonotonicMode
  private readonly windowSize: number | undefined
  private readonly compare: (a: T, b: T) => number

  constructor(options?: MonotonicQueueOptions, compare?: (a: T, b: T) => number) {
    this.mode = options?.mode ?? 'min'
    this.windowSize = options?.windowSize
    this.compare = compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  push(value: T): void {
    this.data[this.dataTail] = value
    this.dataTail++

    const dequeLen = this.dequeTail - this.dequeHead
    if (dequeLen > 0) {
      const back = this.deque[this.dequeTail - 1]!
      const shouldEvict =
        this.mode === 'min'
          ? this.compare(back, value) >= 0
          : this.compare(back, value) <= 0
      if (shouldEvict) {
        this.dequeTail--
        while (this.dequeTail > this.dequeHead) {
          const back2 = this.deque[this.dequeTail - 1]!
          const shouldEvict2 =
            this.mode === 'min'
              ? this.compare(back2, value) >= 0
              : this.compare(back2, value) <= 0
          if (!shouldEvict2) break
          this.dequeTail--
        }
      }
    }
    this.deque[this.dequeTail] = value
    this.dequeTail++

    if (this.windowSize !== undefined && (this.dataTail - this.dataHead) > this.windowSize) {
      const evicted = this.data[this.dataHead]!
      this.dataHead++
      if (this.dequeTail > this.dequeHead && this.deque[this.dequeHead] === evicted) {
        this.dequeHead++
      }
    }
  }

  current(): T {
    if (this.dequeTail === this.dequeHead) {
      throw new RangeError('Cannot get current from empty MonotonicQueue')
    }
    return this.deque[this.dequeHead]!
  }

  get size(): number {
    return this.dataTail - this.dataHead
  }

  isEmpty(): boolean {
    return this.dataTail === this.dataHead
  }

  clear(): void {
    this.dataHead = 0
    this.dataTail = 0
    this.dequeHead = 0
    this.dequeTail = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = this.dataHead; i < this.dataTail; i++) {
      result.push(this.data[i]!)
    }
    return result
  }

  getMode(): MonotonicMode {
    return this.mode
  }

  getWindowSize(): number | undefined {
    return this.windowSize
  }
}
