import type { BitPackedArrayOptions } from './types.js'

export class BitPackedArray {
  private _length: number
  private _bitsPerElement: number
  private _maxValue: number
  private _data: Uint32Array

  constructor(length: number, options?: BitPackedArrayOptions) {
    if (!Number.isInteger(length) || length < 0) {
      throw new RangeError(`Length must be a non-negative integer, got ${length}`)
    }
    const bits = options?.bitsPerElement ?? 32
    if (!Number.isInteger(bits) || bits < 1 || bits > 32) {
      throw new RangeError(`bitsPerElement must be an integer in [1, 32], got ${bits}`)
    }
    this._length = length
    this._bitsPerElement = bits
    this._maxValue = bits === 32 ? 0xFFFFFFFF : (1 << bits) - 1
    const totalBits = length * bits
    const wordCount = totalBits === 0 ? 0 : Math.ceil(totalBits / 32)
    this._data = new Uint32Array(wordCount)
  }

  get(index: number): number {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length - 1}]`)
    }
    if (this._bitsPerElement === 32) {
      return this._data[index]! >>> 0
    }
    const bitOffset = index * this._bitsPerElement
    const wordIndex = bitOffset >>> 5
    const bitOffsetInWord = bitOffset & 31
    const bitsNeeded = this._bitsPerElement
    const availableBits = 32 - bitOffsetInWord
    if (availableBits >= bitsNeeded) {
      const mask = this._maxValue << bitOffsetInWord
      return ((this._data[wordIndex]! & mask) >>> bitOffsetInWord) >>> 0
    }
    const maskLow = this._maxValue << bitOffsetInWord
    const low = ((this._data[wordIndex]! & maskLow) >>> bitOffsetInWord) >>> 0
    const bitsRemaining = bitsNeeded - availableBits
    const maskHigh = (1 << bitsRemaining) - 1
    const high = (this._data[wordIndex + 1]! & maskHigh) << availableBits
    return (low | high) >>> 0
  }

  set(index: number, value: number): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length - 1}]`)
    }
    const maskedValue = (value & this._maxValue) >>> 0
    if (this._bitsPerElement === 32) {
      this._data[index] = maskedValue
      return
    }
    const bitOffset = index * this._bitsPerElement
    const wordIndex = bitOffset >>> 5
    const bitOffsetInWord = bitOffset & 31
    const bitsNeeded = this._bitsPerElement
    const availableBits = 32 - bitOffsetInWord
    if (availableBits >= bitsNeeded) {
      const clearMask = ~(this._maxValue << bitOffsetInWord)
      this._data[wordIndex] = ((this._data[wordIndex]! & clearMask) | (maskedValue << bitOffsetInWord)) >>> 0
    } else {
      const clearMaskLow = ~(this._maxValue << bitOffsetInWord)
      this._data[wordIndex] = ((this._data[wordIndex]! & clearMaskLow) | ((maskedValue & ((1 << availableBits) - 1)) << bitOffsetInWord)) >>> 0
      const bitsRemaining = bitsNeeded - availableBits
      const clearMaskHigh = ~((1 << bitsRemaining) - 1)
      this._data[wordIndex + 1] = ((this._data[wordIndex + 1]! & clearMaskHigh) | (maskedValue >>> availableBits)) >>> 0
    }
  }

  get length(): number {
    return this._length
  }

  get bitsPerElement(): number {
    return this._bitsPerElement
  }

  get maxValue(): number {
    return this._maxValue
  }

  get byteSize(): number {
    return this._data.byteLength
  }

  fill(value: number): void {
    const maskedValue = (value & this._maxValue) >>> 0
    for (let i = 0; i < this._length; i++) {
      this.set(i, maskedValue)
    }
  }

  toArray(): number[] {
    const result: number[] = new Array(this._length)
    for (let i = 0; i < this._length; i++) {
      result[i] = this.get(i)
    }
    return result
  }

  static fromArray(values: number[], options?: BitPackedArrayOptions): BitPackedArray {
    const arr = new BitPackedArray(values.length, options)
    for (let i = 0; i < values.length; i++) {
      arr.set(i, values[i]!)
    }
    return arr
  }

  clone(): BitPackedArray {
    const copy = new BitPackedArray(this._length, { bitsPerElement: this._bitsPerElement })
    copy._data = new Uint32Array(this._data)
    return copy
  }

  forEach(callback: (value: number, index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      callback(this.get(i), i)
    }
  }

  map(fn: (value: number, index: number) => number): BitPackedArray {
    const result = new BitPackedArray(this._length, { bitsPerElement: this._bitsPerElement })
    for (let i = 0; i < this._length; i++) {
      result.set(i, fn(this.get(i), i))
    }
    return result
  }

  reduce(fn: (acc: number, value: number, index: number) => number, initial: number): number {
    let acc = initial
    for (let i = 0; i < this._length; i++) {
      acc = fn(acc, this.get(i), i)
    }
    return acc
  }

  slice(start: number, end?: number): BitPackedArray {
    const normalizedStart = start < 0 ? Math.max(0, this._length + start) : Math.min(start, this._length)
    const normalizedEnd = end === undefined
      ? this._length
      : end < 0
        ? Math.max(0, this._length + end)
        : Math.min(end, this._length)
    const sliceLength = Math.max(0, normalizedEnd - normalizedStart)
    const result = new BitPackedArray(sliceLength, { bitsPerElement: this._bitsPerElement })
    for (let i = 0; i < sliceLength; i++) {
      result.set(i, this.get(normalizedStart + i))
    }
    return result
  }

  indexOf(value: number): number {
    for (let i = 0; i < this._length; i++) {
      if (this.get(i) === value) return i
    }
    return -1
  }

  lastIndexOf(value: number): number {
    for (let i = this._length - 1; i >= 0; i--) {
      if (this.get(i) === value) return i
    }
    return -1
  }

  includes(value: number): boolean {
    for (let i = 0; i < this._length; i++) {
      if (this.get(i) === value) return true
    }
    return false
  }
}

export type { BitPackedArrayOptions } from './types.js'
