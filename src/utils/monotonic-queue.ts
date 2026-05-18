export type MonotonicMode = 'min' | 'max'

export interface MonotonicQueueOptions {
  mode?: MonotonicMode
  windowSize?: number
}

export class MonotonicQueue<T> {
  private readonly data: T[] = []
  private readonly deque: T[] = []
  private readonly mode: MonotonicMode
  private readonly windowSize: number | undefined
  private readonly compare: (a: T, b: T) => number

  constructor(options?: MonotonicQueueOptions, compare?: (a: T, b: T) => number) {
    this.mode = options?.mode ?? 'min'
    this.windowSize = options?.windowSize
    this.compare = compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  push(value: T): void {
    this.data.push(value)

    while (this.deque.length > 0) {
      const back = this.deque[this.deque.length - 1]!
      const shouldEvict =
        this.mode === 'min'
          ? this.compare(back, value) >= 0
          : this.compare(back, value) <= 0
      if (!shouldEvict) break
      this.deque.pop()
    }
    this.deque.push(value)

    if (this.windowSize !== undefined && this.data.length > this.windowSize) {
      const evicted = this.data.shift()!
      if (this.deque.length > 0 && this.deque[0] === evicted) {
        this.deque.shift()
      }
    }
  }

  current(): T {
    if (this.deque.length === 0) {
      throw new RangeError('Cannot get current from empty MonotonicQueue')
    }
    return this.deque[0]!
  }

  get size(): number {
    return this.data.length
  }

  isEmpty(): boolean {
    return this.data.length === 0
  }

  clear(): void {
    this.data.length = 0
    this.deque.length = 0
  }

  toArray(): T[] {
    return [...this.data]
  }

  getMode(): MonotonicMode {
    return this.mode
  }

  getWindowSize(): number | undefined {
    return this.windowSize
  }
}
