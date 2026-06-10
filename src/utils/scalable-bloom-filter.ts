import { BloomFilter } from './bloom-filter.js'

export class ScalableBloomFilter {
  private filters: BloomFilter[] = []
  private readonly initialCapacity: number
  private readonly baseErrorRate: number
  private readonly growthFactor: number
  private _size: number = 0
  private activeFilterCapacity: number
  private nextCapacity: number
  private nextErrorRate: number

  constructor(
    initialCapacity: number = 1000,
    errorRate: number = 0.01,
    growthFactor: number = 2,
  ) {
    this.initialCapacity = initialCapacity
    this.baseErrorRate = errorRate
    this.growthFactor = growthFactor
    this.activeFilterCapacity = initialCapacity
    this.nextCapacity = Math.ceil(initialCapacity * growthFactor)
    this.nextErrorRate = errorRate / growthFactor
    this.addFilter()
  }

  private addFilter(): void {
    const filter = new BloomFilter({
      expectedItems: this.activeFilterCapacity,
      falsePositiveRate: this.nextErrorRate,
    })
    this.filters.push(filter)
  }

  add(item: string): void {
    const currentFilter = this.filters[this.filters.length - 1]!
    currentFilter.add(item)
    this._size++

    if (currentFilter.size >= this.activeFilterCapacity) {
      this.activeFilterCapacity = this.nextCapacity
      this.nextCapacity = Math.ceil(this.nextCapacity * this.growthFactor)
      this.nextErrorRate = this.nextErrorRate / this.growthFactor
      this.addFilter()
    }
  }

  mightContain(item: string): boolean {
    for (const filter of this.filters) {
      if (filter.mightContain(item)) {
        return true
      }
    }
    return false
  }

  get size(): number {
    return this._size
  }

  get filterCount(): number {
    return this.filters.length
  }

  get capacity(): number {
    let total = 0
    for (let i = 0; i < this.filters.length; i++) {
      const cap = Math.ceil(this.initialCapacity * Math.pow(this.growthFactor, i))
      total += cap
    }
    return total
  }

  get falsePositiveRate(): number {
    if (this.filters.length === 0) return 0
    let complement = 1
    for (const filter of this.filters) {
      const fpr = filter.getEstimatedFalsePositiveRate()
      complement *= (1 - fpr)
    }
    return 1 - complement
  }

  clear(): void {
    this.filters = []
    this._size = 0
    this.activeFilterCapacity = this.initialCapacity
    this.nextCapacity = Math.ceil(this.initialCapacity * this.growthFactor)
    this.nextErrorRate = this.baseErrorRate / this.growthFactor
    this.addFilter()
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toString(): string {
    return `ScalableBloomFilter(size=${this._size}, filters=${this.filters.length}, capacity=${this.capacity})`
  }

  toJSON(): unknown {
    return {
      type: 'ScalableBloomFilter',
      size: this._size,
      filterCount: this.filters.length,
      capacity: this.capacity,
      falsePositiveRate: this.falsePositiveRate,
      initialCapacity: this.initialCapacity,
      baseErrorRate: this.baseErrorRate,
      growthFactor: this.growthFactor,
      filters: this.filters.map((f) => f.toJSON()),
    }
  }

  clone(): ScalableBloomFilter {
    const cloned = new ScalableBloomFilter(
      this.initialCapacity,
      this.baseErrorRate,
      this.growthFactor,
    )
    cloned.filters = this.filters.map((f) => f.clone())
    cloned._size = this._size
    cloned.activeFilterCapacity = this.activeFilterCapacity
    cloned.nextCapacity = this.nextCapacity
    cloned.nextErrorRate = this.nextErrorRate
    return cloned
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ScalableBloomFilter)) return false
    if (this._size !== other._size) return false
    if (this.filters.length !== other.filters.length) return false
    if (this.initialCapacity !== other.initialCapacity) return false
    if (this.baseErrorRate !== other.baseErrorRate) return false
    if (this.growthFactor !== other.growthFactor) return false
    for (let i = 0; i < this.filters.length; i++) {
      if (!this.filters[i]!.equals(other.filters[i])) return false
    }
    return true
  }
}
