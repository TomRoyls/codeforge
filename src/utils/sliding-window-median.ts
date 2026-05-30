export class SlidingWindowMedian {
  private readonly windowSize: number
  private readonly buffer: number[] = []
  private sorted: number[] = []
  private index = 0

  constructor(windowSize: number) {
    if (windowSize < 1) {
      throw new RangeError(`windowSize must be >= 1, got ${windowSize}`)
    }
    this.windowSize = windowSize
    this.buffer = new Array(windowSize).fill(0)
  }

  push(value: number): void {
    const oldValue = this.buffer[this.index % this.windowSize]
    const isFull = this.index >= this.windowSize

    if (isFull) {
      const oldIdx = this.binarySearch(oldValue!)
      if (oldIdx !== -1) {
        this.sorted.splice(oldIdx, 1)
      }
    }

    this.buffer[this.index % this.windowSize] = value
    this.index++

    const insertIdx = this.binarySearchInsert(value)
    this.sorted.splice(insertIdx, 0, value)
  }

  median(): number {
    if (this.index === 0) {
      throw new Error('No values added yet')
    }
    const len = Math.min(this.index, this.windowSize)
    const mid = len >>> 1
    if (len % 2 === 0) {
      return (this.sorted[mid - 1]! + this.sorted[mid]!) / 2
    }
    return this.sorted[mid]!
  }

  min(): number {
    if (this.index === 0) {
      throw new Error('No values added yet')
    }
    return this.sorted[0]!
  }

  max(): number {
    if (this.index === 0) {
      throw new Error('No values added yet')
    }
    const len = Math.min(this.index, this.windowSize)
    return this.sorted[len - 1]!
  }

  get size(): number {
    return Math.min(this.index, this.windowSize)
  }

  get totalPushed(): number {
    return this.index
  }

  get isFull(): boolean {
    return this.index >= this.windowSize
  }

  mean(): number {
    if (this.index === 0) {
      throw new Error('No values added yet')
    }
    let sum = 0
    const len = Math.min(this.index, this.windowSize)
    for (let i = 0; i < len; i++) {
      sum += this.sorted[i]!
    }
    return sum / len
  }

  percentile(p: number): number {
    if (this.index === 0) {
      throw new Error('No values added yet')
    }
    if (p < 0 || p > 100) {
      throw new RangeError(`percentile must be [0, 100], got ${p}`)
    }
    const len = Math.min(this.index, this.windowSize)
    const idx = Math.ceil((p / 100) * len) - 1
    return this.sorted[Math.max(0, idx)]!
  }

  toArray(): number[] {
    const len = Math.min(this.index, this.windowSize)
    const start = this.index >= this.windowSize ? this.index % this.windowSize : 0
    const result: number[] = []
    for (let i = 0; i < len; i++) {
      result.push(this.buffer[(start + i) % this.windowSize]!)
    }
    return result
  }

  clear(): void {
    this.buffer.fill(0)
    this.sorted = []
    this.index = 0
  }

  private binarySearch(value: number): number {
    let lo = 0
    let hi = this.sorted.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (this.sorted[mid] === value) {
        return mid
      }
      if (this.sorted[mid]! < value) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return -1
  }

  private binarySearchInsert(value: number): number {
    let lo = 0
    let hi = this.sorted.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.sorted[mid]! < value) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}
