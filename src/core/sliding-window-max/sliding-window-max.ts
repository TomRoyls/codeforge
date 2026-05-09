import type { SlidingWindowMaxOptions, SlidingWindowMaxStats } from './types.js'

export class SlidingWindowMax {
  private windowSize: number
  private data: number[] = []
  private maxDeque: number[] = []
  private minDeque: number[] = []
  private _pushCount: number = 0

  constructor(options: SlidingWindowMaxOptions) {
    if (!Number.isInteger(options.windowSize) || options.windowSize < 1) {
      throw new RangeError('windowSize must be a positive integer')
    }
    this.windowSize = options.windowSize
  }

  push(value: number): void {
    while (
      this.maxDeque.length > 0 &&
      this.maxDeque[this.maxDeque.length - 1]! < value
    ) {
      this.maxDeque.pop()
    }
    this.maxDeque.push(value)

    while (
      this.minDeque.length > 0 &&
      this.minDeque[this.minDeque.length - 1]! > value
    ) {
      this.minDeque.pop()
    }
    this.minDeque.push(value)

    this.data.push(value)
    this._pushCount++

    if (this.data.length > this.windowSize) {
      const removed = this.data.shift()!
      if (this.maxDeque.length > 0 && this.maxDeque[0] === removed) {
        this.maxDeque.shift()
      }
      if (this.minDeque.length > 0 && this.minDeque[0] === removed) {
        this.minDeque.shift()
      }
    }
  }

  max(): number | undefined {
    if (this.maxDeque.length === 0) return undefined
    return this.maxDeque[0]
  }

  getMin(): number | undefined {
    if (this.minDeque.length === 0) return undefined
    return this.minDeque[0]
  }

  getWindow(): number[] {
    return [...this.data]
  }

  get size(): number {
    return this.data.length
  }

  get isFull(): boolean {
    return this.data.length === this.windowSize
  }

  clear(): void {
    this.data = []
    this.maxDeque = []
    this.minDeque = []
  }

  forEach(callback: (value: number, index: number) => void): void {
    for (let i = 0; i < this.data.length; i++) {
      callback(this.data[i]!, i)
    }
  }

  toArray(): number[] {
    return [...this.data]
  }

  stats(): SlidingWindowMaxStats {
    return {
      windowSize: this.windowSize,
      currentSize: this.data.length,
      currentMax: this.max(),
      currentMin: this.getMin(),
      pushCount: this._pushCount,
    }
  }
}

export type { SlidingWindowMaxOptions, SlidingWindowMaxStats } from './types.js'
