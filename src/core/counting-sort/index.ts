import type { CountingSortOptions, DistributionEntry } from './types.js'

export class CountingSort {
  private optsMin: number | undefined
  private optsMax: number | undefined
  private counts: number[]
  private dataMin: number
  private dataMax: number
  private _uniqueCount = 0
  private _totalElements = 0
  private processed = false

  constructor(options?: CountingSortOptions) {
    this.optsMin = options?.min
    this.optsMax = options?.max
    this.counts = []
    this.dataMin = 0
    this.dataMax = 0
  }

  private computeMinMax(arr: number[]): { min: number; max: number } {
    if (arr.length === 0) {
      return { min: this.optsMin ?? 0, max: this.optsMax ?? 0 }
    }
    let lo = arr[0]!
    let hi = arr[0]!
    for (let i = 1; i < arr.length; i++) {
      const v = arr[i]!
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    if (this.optsMin !== undefined && this.optsMin < lo) lo = this.optsMin
    if (this.optsMax !== undefined && this.optsMax > hi) hi = this.optsMax
    return { min: lo, max: hi }
  }

  private buildCounts(arr: number[], min: number, max: number): void {
    const range = max - min + 1
    this.counts = new Array<number>(range).fill(0)
    for (let i = 0; i < arr.length; i++) {
      const idx = arr[i]! - min
      this.counts[idx] = this.counts[idx]! + 1
    }
    this._uniqueCount = 0
    for (let i = 0; i < this.counts.length; i++) {
      if (this.counts[i]! > 0) this._uniqueCount++
    }
    this._totalElements = arr.length
    this.dataMin = min
    this.dataMax = max
    this.processed = true
  }

  sort(arr: number[]): number[] {
    if (arr.length <= 1) {
      const result = [...arr]
      if (arr.length === 1) {
        const { min, max } = this.computeMinMax(arr)
        this.buildCounts(arr, min, max)
      }
      return result
    }
    const { min, max } = this.computeMinMax(arr)
    this.buildCounts(arr, min, max)
    const result: number[] = new Array(arr.length)
    let pos = 0
    for (let i = 0; i < this.counts.length; i++) {
      for (let j = 0; j < this.counts[i]!; j++) {
        result[pos] = i + min
        pos++
      }
    }
    return result
  }

  sortDescending(arr: number[]): number[] {
    if (arr.length <= 1) {
      const result = [...arr]
      if (arr.length === 1) {
        const { min, max } = this.computeMinMax(arr)
        this.buildCounts(arr, min, max)
      }
      return result
    }
    const { min, max } = this.computeMinMax(arr)
    this.buildCounts(arr, min, max)
    const result: number[] = new Array(arr.length)
    let pos = 0
    for (let i = this.counts.length - 1; i >= 0; i--) {
      for (let j = 0; j < this.counts[i]!; j++) {
        result[pos] = i + min
        pos++
      }
    }
    return result
  }

  sortInRange(arr: number[], min: number, max: number): number[] {
    if (arr.length === 0) return []
    if (arr.length === 1) {
      this.buildCounts(arr, min, max)
      return [...arr]
    }
    this.buildCounts(arr, min, max)
    const result: number[] = new Array(arr.length)
    let pos = 0
    for (let i = 0; i < this.counts.length; i++) {
      for (let j = 0; j < this.counts[i]!; j++) {
        result[pos] = i + min
        pos++
      }
    }
    return result
  }

  sortStable(arr: number[]): number[] {
    if (arr.length <= 1) {
      const result = [...arr]
      if (arr.length === 1) {
        const { min, max } = this.computeMinMax(arr)
        this.buildCounts(arr, min, max)
      }
      return result
    }
    const { min, max } = this.computeMinMax(arr)
    const range = max - min + 1
    const counts = new Array<number>(range).fill(0)
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]! - min] = counts[arr[i]! - min]! + 1
    }
    for (let i = 1; i < range; i++) {
      counts[i] = counts[i]! + counts[i - 1]!
    }
    const result: number[] = new Array(arr.length)
    for (let i = arr.length - 1; i >= 0; i--) {
      const idx = arr[i]! - min
      counts[idx] = counts[idx]! - 1
      result[counts[idx]!] = arr[i]!
    }
    this.buildCounts(arr, min, max)
    return result
  }

  getCount(value: number): number {
    if (!this.processed) return 0
    if (value < this.dataMin || value > this.dataMax) return 0
    return this.counts[value - this.dataMin] ?? 0
  }

  getDistribution(): DistributionEntry[] {
    if (!this.processed) return []
    const result: DistributionEntry[] = []
    for (let i = 0; i < this.counts.length; i++) {
      if (this.counts[i]! > 0) {
        result.push({ value: i + this.dataMin, count: this.counts[i]! })
      }
    }
    return result
  }

  get min(): number | undefined {
    if (!this.processed) return undefined
    return this.dataMin
  }

  get max(): number | undefined {
    if (!this.processed) return undefined
    return this.dataMax
  }

  get range(): number {
    if (!this.processed) return 0
    return this.dataMax - this.dataMin
  }

  get uniqueCount(): number {
    return this._uniqueCount
  }

  get totalElements(): number {
    return this._totalElements
  }

  static isSorted(arr: number[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  static merge(sorted1: number[], sorted2: number[]): number[] {
    const result: number[] = new Array(sorted1.length + sorted2.length)
    let i = 0
    let j = 0
    let k = 0
    while (i < sorted1.length && j < sorted2.length) {
      if (sorted1[i]! <= sorted2[j]!) {
        result[k] = sorted1[i]!
        i++
      } else {
        result[k] = sorted2[j]!
        j++
      }
      k++
    }
    while (i < sorted1.length) {
      result[k] = sorted1[i]!
      i++
      k++
    }
    while (j < sorted2.length) {
      result[k] = sorted2[j]!
      j++
      k++
    }
    return result
  }

  static from(arr: number[], options?: CountingSortOptions): CountingSort {
    const cs = new CountingSort(options)
    cs.sort(arr)
    return cs
  }

  toString(): string {
    return `CountingSort()`
  }

  static empty(): CountingSort {
    return new CountingSort()
  }
}

export type { CountingSortOptions, DistributionEntry } from './types.js'
