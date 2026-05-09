import type { FractionalCascadingOptions, FractionalCascadingStats } from './types.js'
import { DEFAULT_FRACTIONAL_CASCADING_OPTIONS } from './types.js'

interface AugmentedEntry {
  value: number
  originalIndex: number
  fromPrev: boolean
  prevPointer: number
  nextPointer: number
}

export class FractionalCascading {
  private _originalArrays: number[][]
  private _augmentedArrays: AugmentedEntry[][]
  private _arrayCount: number
  private _totalCount: number

  constructor(arrays: number[][], options?: Partial<FractionalCascadingOptions>) {
    const opts: FractionalCascadingOptions = { ...DEFAULT_FRACTIONAL_CASCADING_OPTIONS, ...options }
    this._originalArrays = []
    this._augmentedArrays = []
    this._arrayCount = 0
    this._totalCount = 0
    this.build(arrays, opts)
  }

  private build(arrays: number[][], opts: FractionalCascadingOptions): void {
    this._originalArrays = arrays.map(arr => [...arr])
    this._arrayCount = arrays.length
    this._totalCount = arrays.reduce((sum, arr) => sum + arr.length, 0)

    if (!opts.sorted) {
      for (let i = 0; i < this._originalArrays.length; i++) {
        this._originalArrays[i]!.sort((a, b) => a - b)
      }
    }

    this._augmentedArrays = []

    if (this._arrayCount === 0) {
      return
    }

    const firstArr = this._originalArrays[0]!
    this._augmentedArrays[0] = firstArr.map((val, idx) => ({
      value: val,
      originalIndex: idx,
      fromPrev: false,
      prevPointer: 0,
      nextPointer: 0,
    }))

    for (let i = 1; i < this._arrayCount; i++) {
      const prevAugmented = this._augmentedArrays[i - 1]!
      const currentArr = this._originalArrays[i]!

      const cascadedFromPrev: AugmentedEntry[] = []
      let skip = 0
      for (let j = 0; j < prevAugmented.length; j++) {
        if (!prevAugmented[j]!.fromPrev) {
          if (skip % 2 === 0) {
            cascadedFromPrev.push({
              value: prevAugmented[j]!.value,
              originalIndex: -1,
              fromPrev: true,
              prevPointer: j,
              nextPointer: 0,
            })
          }
          skip++
        }
      }

      const merged: AugmentedEntry[] = []
      let ci = 0
      let di = 0

      while (ci < currentArr.length && di < cascadedFromPrev.length) {
        const cv = currentArr[ci]!
        const dv = cascadedFromPrev[di]!
        if (cv <= dv.value) {
          merged.push({
            value: cv,
            originalIndex: ci,
            fromPrev: false,
            prevPointer: di,
            nextPointer: 0,
          })
          ci++
        } else {
          merged.push(dv)
          di++
        }
      }

      while (ci < currentArr.length) {
        merged.push({
          value: currentArr[ci]!,
          originalIndex: ci,
          fromPrev: false,
          prevPointer: di,
          nextPointer: 0,
        })
        ci++
      }

      while (di < cascadedFromPrev.length) {
        merged.push(cascadedFromPrev[di]!)
        di++
      }

      for (let j = 0; j < merged.length; j++) {
        const entry = merged[j]!
        if (entry.fromPrev) {
          entry.prevPointer = entry.prevPointer
        } else {
          let best = j > 0 ? (merged[j - 1]!.fromPrev ? j - 1 : j - 1) : 0
          for (let k = j - 1; k >= 0; k--) {
            if (merged[k]!.fromPrev) {
              best = k
              break
            }
            best = k
          }
          entry.prevPointer = best
        }
      }

      this._augmentedArrays[i] = merged
    }

    for (let i = this._arrayCount - 1; i >= 0; i--) {
      const arr = this._augmentedArrays[i]!
      for (let j = 0; j < arr.length; j++) {
        if (j + 1 < arr.length) {
          arr[j]!.nextPointer = j + 1
        } else {
          arr[j]!.nextPointer = arr.length
        }
      }
    }
  }

  query(value: number): number[] {
    const results: number[] = []
    if (this._arrayCount === 0) {
      return results
    }

    let idx = this._binarySearchAugmented(0, value)

    for (let i = 0; i < this._arrayCount; i++) {
      const arr = this._augmentedArrays[i]!
      idx = this._adjustPosition(arr, idx, value)

      let count = 0
      for (let j = 0; j <= idx && j < arr.length; j++) {
        if (!arr[j]!.fromPrev) {
          count++
        }
      }
      results.push(count)

      if (i + 1 < this._arrayCount) {
        idx = this._binarySearchAugmented(i + 1, value)
      }
    }

    return results
  }

  queryIndex(value: number): number[] {
    const results: number[] = []
    if (this._arrayCount === 0) {
      return results
    }

    for (let i = 0; i < this._arrayCount; i++) {
      const origArr = this._originalArrays[i]!
      let lo = 0
      let hi = origArr.length
      while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2)
        if (origArr[mid]! <= value) {
          lo = mid + 1
        } else {
          hi = mid
        }
      }
      results.push(lo)
    }

    return results
  }

  private _binarySearchAugmented(arrayIndex: number, value: number): number {
    const arr = this._augmentedArrays[arrayIndex]!
    if (arr.length === 0) return -1

    let lo = 0
    let hi = arr.length - 1
    let result = -1

    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      if (arr[mid]!.value <= value) {
        result = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    return result
  }

  private _adjustPosition(arr: AugmentedEntry[], idx: number, _value: number): number {
    if (idx >= arr.length) {
      return arr.length - 1
    }
    if (idx < 0) {
      return -1
    }
    return idx
  }

  getArray(index: number): number[] {
    if (index < 0 || index >= this._arrayCount) {
      throw new RangeError(`Array index ${index} out of bounds [0, ${this._arrayCount - 1}]`)
    }
    return [...this._originalArrays[index]!]
  }

  get arrayCount(): number {
    return this._arrayCount
  }

  get totalCount(): number {
    return this._totalCount
  }

  rebuild(arrays: number[][], options?: Partial<FractionalCascadingOptions>): void {
    const opts: FractionalCascadingOptions = { ...DEFAULT_FRACTIONAL_CASCADING_OPTIONS, ...options }
    this.build(arrays, opts)
  }

  getStats(): FractionalCascadingStats {
    let memoryUsage = 0
    for (let i = 0; i < this._augmentedArrays.length; i++) {
      memoryUsage += this._augmentedArrays[i]!.length
    }
    memoryUsage *= 5
    for (let i = 0; i < this._originalArrays.length; i++) {
      memoryUsage += this._originalArrays[i]!.length
    }

    return {
      arrayCount: this._arrayCount,
      totalCount: this._totalCount,
      memoryUsage,
    }
  }
}

export { DEFAULT_FRACTIONAL_CASCADING_OPTIONS } from './types.js'
export type { FractionalCascadingOptions, FractionalCascadingStats } from './types.js'
