export class SlidingWindowMin {
  private readonly windowSize: number
  private readonly deque: { index: number; value: number }[] = []
  private index = 0

  constructor(windowSize: number) {
    if (windowSize < 1) throw new RangeError('windowSize must be >= 1')
    this.windowSize = windowSize
  }

  push(value: number): number | undefined {
    while (this.deque.length > 0 && this.deque[this.deque.length - 1]!.value >= value) {
      this.deque.pop()
    }
    this.deque.push({ index: this.index, value })
    this.index++
    while (this.deque.length > 0 && this.deque[0]!.index <= this.index - this.windowSize - 1) {
      this.deque.shift()
    }
    if (this.index >= this.windowSize) {
      return this.deque[0]!.value
    }
    return undefined
  }

  getMin(): number | undefined {
    return this.deque.length > 0 ? this.deque[0]!.value : undefined
  }

  static solve(data: number[], windowSize: number): number[] {
    const swm = new SlidingWindowMin(windowSize)
    const results: number[] = []
    for (const val of data) {
      const min = swm.push(val)
      if (min !== undefined) results.push(min)
    }
    return results
  }
}
