import type { CompressedMapOptions, CompressStats } from './types.js'

export class CompressedMap<T> {
  private _keys: number[]
  private _values: T[]
  private _size: number

  constructor(_options?: CompressedMapOptions) {
    this._keys = []
    this._values = []
    this._size = 0
  }

  private static zigzagEncode(n: number): number {
    return n >= 0 ? n * 2 : (-n) * 2 - 1
  }

  private static vlqSize(n: number): number {
    const unsigned = CompressedMap.zigzagEncode(n)
    if (unsigned === 0) return 1
    let bytes = 0
    let val = unsigned
    while (val > 0) {
      bytes++
      val >>>= 7
    }
    return bytes
  }

  private binarySearch(key: number): number {
    let low = 0
    let high = this._size - 1
    while (low <= high) {
      const mid = (low + high) >>> 1
      const midKey = this._keys[mid]!
      if (midKey < key) {
        low = mid + 1
      } else if (midKey > key) {
        high = mid - 1
      } else {
        return mid
      }
    }
    return ~low
  }

  set(key: number, value: T): void {
    if (!Number.isFinite(key) || !Number.isInteger(key)) {
      throw new TypeError('Key must be a finite integer')
    }

    if (this._size === 0) {
      this._keys[0] = key
      this._values[0] = value
      this._size++
      return
    }

    const idx = this.binarySearch(key)
    if (idx >= 0) {
      this._values[idx] = value
    } else {
      const insertIdx = ~idx
      this._keys.splice(insertIdx, 0, key)
      this._values.splice(insertIdx, 0, value)
      this._size++
    }
  }

  get(key: number): T | undefined {
    const idx = this.binarySearch(key)
    if (idx >= 0) {
      return this._values[idx]
    }
    return undefined
  }

  has(key: number): boolean {
    return this.binarySearch(key) >= 0
  }

  delete(key: number): boolean {
    const idx = this.binarySearch(key)
    if (idx < 0) return false
    this._keys.splice(idx, 1)
    this._values.splice(idx, 1)
    this._size--
    return true
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this._keys.length = 0
    this._values.length = 0
    this._size = 0
  }

  keys(): number[] {
    return this._keys.slice(0, this._size)
  }

  values(): T[] {
    return this._values.slice(0, this._size)
  }

  entries(): Array<[number, T]> {
    const result: Array<[number, T]> = []
    for (let i = 0; i < this._size; i++) {
      result.push([this._keys[i]!, this._values[i]!])
    }
    return result
  }

  forEach(callback: (value: T, key: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this._values[i]!, this._keys[i]!)
    }
  }

  first(): [number, T] | undefined {
    if (this._size === 0) return undefined
    return [this._keys[0]!, this._values[0]!]
  }

  last(): [number, T] | undefined {
    if (this._size === 0) return undefined
    return [this._keys[this._size - 1]!, this._values[this._size - 1]!]
  }

  lowerBound(key: number): [number, T] | undefined {
    let low = 0
    let high = this._size - 1
    let result = -1
    while (low <= high) {
      const mid = (low + high) >>> 1
      if (this._keys[mid]! >= key) {
        result = mid
        high = mid - 1
      } else {
        low = mid + 1
      }
    }
    if (result === -1) return undefined
    return [this._keys[result]!, this._values[result]!]
  }

  upperBound(key: number): [number, T] | undefined {
    let low = 0
    let high = this._size - 1
    let result = -1
    while (low <= high) {
      const mid = (low + high) >>> 1
      if (this._keys[mid]! > key) {
        result = mid
        high = mid - 1
      } else {
        low = mid + 1
      }
    }
    if (result === -1) return undefined
    return [this._keys[result]!, this._values[result]!]
  }

  compressStats(): CompressStats {
    let keyBytes = 0
    for (let i = 0; i < this._size; i++) {
      if (i === 0) {
        keyBytes += CompressedMap.vlqSize(this._keys[0]!)
      } else {
        keyBytes += CompressedMap.vlqSize(this._keys[i]! - this._keys[i - 1]!)
      }
    }

    let valueBytes = 0
    for (let i = 0; i < this._size; i++) {
      const val = this._values[i]!
      if (typeof val === 'number') {
        valueBytes += 8
      } else if (typeof val === 'string') {
        valueBytes += val.length * 2
      } else if (typeof val === 'boolean') {
        valueBytes += 4
      } else if (val === null || val === undefined) {
        valueBytes += 8
      } else {
        const encoded = new TextEncoder().encode(JSON.stringify(val))
        valueBytes += encoded.length
      }
    }

    return {
      keyBytes,
      valueBytes,
      totalBytes: keyBytes + valueBytes,
    }
  }
}

export type { CompressedMapOptions, CompressStats } from './types.js'
