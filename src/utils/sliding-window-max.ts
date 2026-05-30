export class SlidingWindowMax {
  private deque: { index: number; value: number }[] = []
  private windowSize: number
  private index = 0

  constructor(windowSize: number) {
    if (windowSize < 1) throw new RangeError('windowSize must be >= 1')
    this.windowSize = windowSize
  }

  push(value: number): number | undefined {
    while (this.deque.length > 0 && this.deque[this.deque.length - 1]!.value <= value) {
      this.deque.pop()
    }
    this.deque.push({ index: this.index, value })
    while (this.deque.length > 0 && this.deque[0]!.index <= this.index - this.windowSize) {
      this.deque.shift()
    }
    this.index++
    if (this.index >= this.windowSize) {
      return this.deque[0]!.value
    }
    return undefined
  }

  static solve(arr: number[], windowSize: number): number[] {
    const swm = new SlidingWindowMax(windowSize)
    const result: number[] = []
    for (const val of arr) {
      const max = swm.push(val)
      if (max !== undefined) result.push(max)
    }
    return result
  }

  static solveMin(arr: number[], windowSize: number): number[] {
    const swm = new SlidingWindowMin(windowSize)
    const result: number[] = []
    for (const val of arr) {
      const min = swm.push(val)
      if (min !== undefined) result.push(min)
    }
    return result
  }
}

export class SlidingWindowMin {
  private deque: { index: number; value: number }[] = []
  private windowSize: number
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
    while (this.deque.length > 0 && this.deque[0]!.index <= this.index - this.windowSize) {
      this.deque.shift()
    }
    this.index++
    if (this.index >= this.windowSize) {
      return this.deque[0]!.value
    }
    return undefined
  }
}
