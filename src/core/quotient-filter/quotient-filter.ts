import type { QuotientFilterOptions, QuotientFilterStats } from './types.js'
import { DEFAULT_QUOTIENT_FILTER_OPTIONS } from './types.js'

export class QuotientFilter<T = string> {
  private buckets: number[][]
  private _quotientBits: number
  private _remainderBits: number
  private _size: number = 0
  private _expectedItems: number
  private _targetFPRate: number

  constructor(options?: Partial<QuotientFilterOptions>) {
    const opts: QuotientFilterOptions = { ...DEFAULT_QUOTIENT_FILTER_OPTIONS, ...options }
    this._expectedItems = opts.expectedItems
    this._targetFPRate = opts.falsePositiveRate
    this._quotientBits = this.calculateQuotientBits(opts.expectedItems)
    this._remainderBits = this.calculateRemainderBits(opts.falsePositiveRate)
    const numSlots = 1 << this._quotientBits
    this.buckets = []
    for (let i = 0; i < numSlots; i++) {
      this.buckets.push([])
    }
  }

  insert(item: T): void {
    const hash = this.hash(this.serialize(item))
    const fq = hash & ((1 << this._quotientBits) - 1)
    const fr = (hash >>> this._quotientBits) & ((1 << this._remainderBits) - 1)
    this.buckets[fq]!.push(fr)
    this._size++
  }

  mayContain(item: T): boolean {
    if (this._size === 0) return false
    const hash = this.hash(this.serialize(item))
    const fq = hash & ((1 << this._quotientBits) - 1)
    const fr = (hash >>> this._quotientBits) & ((1 << this._remainderBits) - 1)
    const bucket = this.buckets[fq]!
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === fr) return true
    }
    return false
  }

  remove(item: T): boolean {
    if (this._size === 0) return false
    const hash = this.hash(this.serialize(item))
    const fq = hash & ((1 << this._quotientBits) - 1)
    const fr = (hash >>> this._quotientBits) & ((1 << this._remainderBits) - 1)
    const bucket = this.buckets[fq]!
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === fr) {
        bucket.splice(i, 1)
        this._size--
        return true
      }
    }
    return false
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return 1 << this._quotientBits
  }

  get falsePositiveRate(): number {
    if (this._size === 0) return 0
    return Math.pow(2, -this._remainderBits)
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    const numSlots = 1 << this._quotientBits
    for (let i = 0; i < numSlots; i++) {
      this.buckets[i]!.length = 0
    }
    this._size = 0
  }

  clone(): QuotientFilter<T> {
    const cloned = new QuotientFilter<T>({
      expectedItems: this._expectedItems,
      falsePositiveRate: this._targetFPRate,
    })
    const numSlots = 1 << this._quotientBits
    for (let i = 0; i < numSlots; i++) {
      cloned.buckets[i] = this.buckets[i]!.slice()
    }
    cloned._size = this._size
    return cloned
  }

  static from<T = string>(items: Iterable<T>, options?: Partial<QuotientFilterOptions>): QuotientFilter<T> {
    const filter = new QuotientFilter<T>(options)
    for (const item of items) {
      filter.insert(item)
    }
    return filter
  }

  stats(): QuotientFilterStats {
    const numSlots = 1 << this._quotientBits
    return {
      size: this._size,
      capacity: numSlots,
      loadFactor: numSlots > 0 ? this._size / numSlots : 0,
      falsePositiveRate: this.falsePositiveRate,
      quotientBits: this._quotientBits,
      remainderBits: this._remainderBits,
    }
  }

  private calculateQuotientBits(expectedItems: number): number {
    let q = 1
    while ((1 << q) < expectedItems) q++
    return q
  }

  private calculateRemainderBits(falsePositiveRate: number): number {
    if (falsePositiveRate >= 1) return 1
    let r = 1
    while (Math.pow(2, -r) > falsePositiveRate) r++
    return r
  }

  private hash(str: string): number {
    let h = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    return h >>> 0
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }
}

export type { QuotientFilterOptions, QuotientFilterStats } from './types.js'
export { DEFAULT_QUOTIENT_FILTER_OPTIONS } from './types.js'
