import type { RLEBitmapOptions, RLERun } from './types.js'

export class RLEBitmap {
  private _runs: RLERun[] = []
  private _size = 0

  constructor(_options?: RLEBitmapOptions) {}

  get(index: number): 0 | 1 {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    let offset = 0
    for (const run of this._runs) {
      if (index < offset + run.count) {
        return run.value
      }
      offset += run.count
    }
    return 0
  }

  set(index: number, value: 0 | 1): void {
    if (index < 0) {
      throw new RangeError(`Index ${index} must be non-negative`)
    }
    if (index >= this._size) {
      this._expandTo(index + 1)
    }
    this._setAt(index, value)
  }

  flip(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const current = this.get(index)
    this._setAt(index, current === 0 ? 1 : 0)
  }

  fill(value: 0 | 1, start?: number, end?: number): void {
    const s = start ?? 0
    const e = end ?? this._size
    if (s < 0 || e < s) {
      throw new RangeError(`Invalid range [${s}, ${e})`)
    }
    if (e > this._size) {
      this._expandTo(e)
    }
    for (let i = s; i < e; i++) {
      this._setAt(i, value)
    }
  }

  countOnes(start?: number, end?: number): number {
    const s = start ?? 0
    const e = end ?? this._size
    if (e <= s) return 0
    let count = 0
    let offset = 0
    for (const run of this._runs) {
      const runStart = offset
      const runEnd = offset + run.count
      const overlapStart = Math.max(s, runStart)
      const overlapEnd = Math.min(e, runEnd)
      if (overlapStart < overlapEnd && run.value === 1) {
        count += overlapEnd - overlapStart
      }
      offset += run.count
      if (offset >= e) break
    }
    return count
  }

  countZeros(start?: number, end?: number): number {
    const s = start ?? 0
    const e = end ?? this._size
    const range = e - s
    return range - this.countOnes(s, e)
  }

  get size(): number {
    return this._size
  }

  get runs(): RLERun[] {
    return this._runs.map((r) => ({ value: r.value, count: r.count }))
  }

  static compress(bits: number[]): RLEBitmap {
    const bitmap = new RLEBitmap()
    if (bits.length === 0) return bitmap
    bitmap._size = bits.length
    let currentVal: 0 | 1 = bits[0] === 0 ? 0 : 1
    let currentCount = 1
    for (let i = 1; i < bits.length; i++) {
      const v: 0 | 1 = bits[i] === 0 ? 0 : 1
      if (v === currentVal) {
        currentCount++
      } else {
        bitmap._runs.push({ value: currentVal, count: currentCount })
        currentVal = v
        currentCount = 1
      }
    }
    bitmap._runs.push({ value: currentVal, count: currentCount })
    return bitmap
  }

  expand(): number[] {
    const result: number[] = []
    for (const run of this._runs) {
      for (let i = 0; i < run.count; i++) {
        result.push(run.value)
      }
    }
    return result
  }

  and(other: RLEBitmap): RLEBitmap {
    const minSize = Math.min(this._size, other._size)
    const bits: number[] = []
    for (let i = 0; i < minSize; i++) {
      bits.push(this.get(i) & other.get(i))
    }
    return RLEBitmap.compress(bits)
  }

  or(other: RLEBitmap): RLEBitmap {
    const maxSize = Math.max(this._size, other._size)
    const bits: number[] = []
    for (let i = 0; i < maxSize; i++) {
      const a = i < this._size ? this.get(i) : 0
      const b = i < other._size ? other.get(i) : 0
      bits.push(a | b)
    }
    return RLEBitmap.compress(bits)
  }

  xor(other: RLEBitmap): RLEBitmap {
    const maxSize = Math.max(this._size, other._size)
    const bits: number[] = []
    for (let i = 0; i < maxSize; i++) {
      const a = i < this._size ? this.get(i) : 0
      const b = i < other._size ? other.get(i) : 0
      bits.push(a ^ b)
    }
    return RLEBitmap.compress(bits)
  }

  get not(): RLEBitmap {
    const result = new RLEBitmap()
    result._size = this._size
    result._runs = this._runs.map((r) => ({
      value: (r.value === 0 ? 1 : 0) as 0 | 1,
      count: r.count,
    }))
    return result
  }

  clone(): RLEBitmap {
    const result = new RLEBitmap()
    result._size = this._size
    result._runs = this.runs
    return result
  }

  toString(): string {
    if (this._runs.length === 0) return ''
    return this._runs.map((r) => `${r.value}:${r.count}`).join(' ')
  }

  equals(other: RLEBitmap): boolean {
    if (this._size !== other._size) return false
    if (this._runs.length !== other._runs.length) return false
    for (let i = 0; i < this._runs.length; i++) {
      if (this._runs[i]!.value !== other._runs[i]!.value || this._runs[i]!.count !== other._runs[i]!.count) {
        return false
      }
    }
    return true
  }

  slice(start: number, end?: number): RLEBitmap {
    const s = start
    const e = end ?? this._size
    if (s < 0 || e > this._size || e < s) {
      throw new RangeError(`Invalid slice [${s}, ${e})`)
    }
    const bits: number[] = []
    for (let i = s; i < e; i++) {
      bits.push(this.get(i))
    }
    return RLEBitmap.compress(bits)
  }

  private _expandTo(newSize: number): void {
    const diff = newSize - this._size
    if (diff <= 0) return
    const lastRun = this._runs[this._runs.length - 1]
    if (lastRun && lastRun.value === 0) {
      lastRun.count += diff
    } else {
      this._runs.push({ value: 0, count: diff })
    }
    this._size = newSize
  }

  private _setAt(index: number, value: 0 | 1): void {
    let offset = 0
    for (let ri = 0; ri < this._runs.length; ri++) {
      const run = this._runs[ri]!
      if (index < offset + run.count) {
        if (run.value === value) return
        const posInRun = index - offset
        const beforeCount = posInRun
        const afterCount = run.count - posInRun - 1

        const replacement: RLERun[] = []
        if (beforeCount > 0) {
          replacement.push({ value: run.value, count: beforeCount })
        }
        replacement.push({ value, count: 1 })
        if (afterCount > 0) {
          replacement.push({ value: run.value, count: afterCount })
        }

        this._runs.splice(ri, 1, ...replacement)
        this._mergeAdjacent()
        return
      }
      offset += run.count
    }
  }

  private _mergeAdjacent(): void {
    let i = 0
    while (i < this._runs.length - 1) {
      if (this._runs[i]!.value === this._runs[i + 1]!.value) {
        this._runs[i]!.count += this._runs[i + 1]!.count
        this._runs.splice(i + 1, 1)
      } else {
        i++
      }
    }
  }
}
