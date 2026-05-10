import type { ScanArrayOptions, ScanArrayStatistics } from './types.js'
import { DEFAULT_SCAN_ARRAY_OPTIONS } from './types.js'

export class ScanArray {
  private data: number[] = []
  private prefix: number[] = []
  private stats = { updates: 0, prefixSums: 0, rangeSums: 0 }

  constructor(sizeOrOptions?: number | ScanArrayOptions) {
    if (sizeOrOptions === undefined) {
      return
    }
    if (typeof sizeOrOptions === 'number') {
      if (sizeOrOptions > 0) {
        this.data = new Array<number>(sizeOrOptions).fill(0)
        this.rebuildPrefix()
      }
      return
    }
    const opts: ScanArrayOptions = { ...DEFAULT_SCAN_ARRAY_OPTIONS, ...sizeOrOptions }
    if (opts.initialSize !== undefined && opts.initialSize > 0) {
      this.data = new Array<number>(opts.initialSize).fill(0)
      this.rebuildPrefix()
    }
  }

  private rebuildPrefix(): void {
    this.prefix = new Array<number>(this.data.length).fill(0)
    for (let i = 0; i < this.data.length; i++) {
      this.prefix[i] = (this.prefix[i - 1] ?? 0) + this.data[i]!
    }
  }

  set(index: number, value: number): void {
    this.validateIndex(index)
    this.data[index] = value
    this.rebuildPrefix()
    this.stats.updates++
  }

  get(index: number): number {
    this.validateIndex(index)
    return this.data[index]!
  }

  prefixSum(index: number): number {
    this.validateIndex(index)
    this.stats.prefixSums++
    return this.prefix[index]!
  }

  rangeSum(start: number, end: number): number {
    this.validateIndex(start)
    this.validateIndex(end)
    if (start > end) {
      return 0
    }
    this.stats.rangeSums++
    if (start === 0) {
      return this.prefix[end]!
    }
    return this.prefix[end]! - this.prefix[start - 1]!
  }

  update(index: number, delta: number): void {
    this.validateIndex(index)
    this.data[index] = this.data[index]! + delta
    this.rebuildPrefix()
    this.stats.updates++
  }

  get size(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  clear(): void {
    this.data = []
    this.prefix = []
    this.stats = { updates: 0, prefixSums: 0, rangeSums: 0 }
  }

  toArray(): number[] {
    return [...this.data]
  }

  toPrefixArray(): number[] {
    return [...this.prefix]
  }

  forEach(cb: (value: number, index: number) => void): void {
    for (let i = 0; i < this.data.length; i++) {
      cb(this.data[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i]!
    }
  }

  push(value: number): void {
    this.data.push(value)
    const prev = this.prefix.length > 0 ? this.prefix[this.prefix.length - 1]! : 0
    this.prefix.push(prev + value)
    this.stats.updates++
  }

  pop(): number | undefined {
    if (this.data.length === 0) {
      return undefined
    }
    const val = this.data.pop()!
    this.prefix.pop()
    return val
  }

  findFirst(sum: number): number {
    if (this.data.length === 0) {
      return -1
    }
    if (sum <= 0) {
      return -1
    }
    let lo = 0
    let hi = this.prefix.length - 1
    let result = -1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (this.prefix[mid]! >= sum) {
        result = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  getStatistics(): ScanArrayStatistics {
    return { ...this.stats }
  }

  private validateIndex(index: number): void {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length - 1}]`)
    }
  }
}

export { DEFAULT_SCAN_ARRAY_OPTIONS } from './types.js'
export type { ScanArrayOptions, ScanArrayStatistics } from './types.js'
