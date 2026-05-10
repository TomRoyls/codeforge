import type { RangeBloomOptions } from './types.js'
import { DEFAULT_RANGE_BLOOM_OPTIONS } from './types.js'

class InternalBloomLayer {
  private bitArray: Uint8Array
  private readonly _bitCount: number
  private readonly _hashCount: number
  private readonly _expectedItems: number
  private readonly _targetFPRate: number

  constructor(expectedItems: number, falsePositiveRate: number) {
    this._expectedItems = expectedItems
    this._targetFPRate = falsePositiveRate
    this._bitCount = this.calculateBitCount(expectedItems, falsePositiveRate)
    this._hashCount = this.calculateHashCount(this._bitCount, expectedItems)
    this.bitArray = new Uint8Array(Math.ceil(this._bitCount / 8))
  }

  add(key: string): void {
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      this.bitArray[byteIndex] = this.bitArray[byteIndex]! | (1 << bitIndex)
    }
  }

  has(key: string): boolean {
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      if ((this.bitArray[byteIndex]! & (1 << bitIndex)) === 0) {
        return false
      }
    }
    return true
  }

  clear(): void {
    this.bitArray = new Uint8Array(this.bitArray.length)
  }

  get bitCount(): number {
    return this._bitCount
  }

  get hashCount(): number {
    return this._hashCount
  }

  falsePositiveRate(currentSize: number): number {
    if (currentSize === 0) return 0
    return Math.pow(
      1 - Math.exp((-this._hashCount * currentSize) / this._bitCount),
      this._hashCount,
    )
  }

  fillRatio(): number {
    let setBits = 0
    for (let i = 0; i < this._bitCount; i++) {
      const byteIndex = Math.floor(i / 8)
      const bitIndex = i % 8
      if ((this.bitArray[byteIndex]! & (1 << bitIndex)) !== 0) {
        setBits++
      }
    }
    return this._bitCount > 0 ? setBits / this._bitCount : 0
  }

  get targetFPRate(): number {
    return this._targetFPRate
  }

  get expectedItems(): number {
    return this._expectedItems
  }

  private calculateBitCount(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(bitCount: number, expectedItems: number): number {
    return Math.max(1, Math.round((bitCount / expectedItems) * Math.log(2)))
  }

  private getHashPositions(key: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, 0)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._bitCount)
    }
    return positions
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }
}

export class RangeBloomFilter {
  private layers: InternalBloomLayer[]
  private readonly _layerCount: number
  private readonly _expectedItems: number
  private readonly _falsePositiveRate: number
  private readonly _granularity: number = 10
  private _size: number = 0

  constructor(expectedItems?: number, falsePositiveRate?: number, layers?: number)
  constructor(options?: RangeBloomOptions)
  constructor(
    expectedItemsOrOptions?: number | RangeBloomOptions,
    falsePositiveRate?: number,
    layers?: number,
  ) {
    let opts: Required<RangeBloomOptions>
    if (typeof expectedItemsOrOptions === 'object' && expectedItemsOrOptions !== null) {
      opts = { ...DEFAULT_RANGE_BLOOM_OPTIONS, ...expectedItemsOrOptions }
    } else {
      opts = {
        ...DEFAULT_RANGE_BLOOM_OPTIONS,
        ...(expectedItemsOrOptions !== undefined ? { expectedItems: expectedItemsOrOptions } : {}),
        ...(falsePositiveRate !== undefined ? { falsePositiveRate } : {}),
        ...(layers !== undefined ? { layers } : {}),
      }
    }
    this._expectedItems = opts.expectedItems
    this._falsePositiveRate = opts.falsePositiveRate
    this._layerCount = opts.layers
    this.layers = []
    for (let i = 0; i < this._layerCount; i++) {
      this.layers.push(new InternalBloomLayer(opts.expectedItems, opts.falsePositiveRate))
    }
  }

  add(value: number): void {
    for (let layer = 0; layer < this._layerCount; layer++) {
      const divisor = Math.pow(this._granularity, layer)
      const bucket = Math.floor(value / divisor)
      const key = `${layer}:${bucket}`
      this.layers[layer]!.add(key)
    }
    this._size++
  }

  has(value: number): boolean {
    const key = `0:${value}`
    return this.layers[0]!.has(key)
  }

  hasRange(lo: number, hi: number): boolean {
    if (lo > hi) return false
    if (lo === hi) return this.has(lo)

    const range = hi - lo

    for (let layer = this._layerCount - 1; layer >= 0; layer--) {
      const bucketSize = Math.pow(this._granularity, layer)
      const loBucket = Math.floor(lo / bucketSize)
      const hiBucket = Math.floor(hi / bucketSize)
      const bucketsNeeded = hiBucket - loBucket + 1

      const maxScan = Math.max(10, range)
      if (bucketsNeeded <= maxScan) {
        for (let b = loBucket; b <= hiBucket; b++) {
          const key = `${layer}:${b}`
          if (this.layers[layer]!.has(key)) {
            return true
          }
        }
        if (layer > 0) continue
        return false
      }
    }

    const maxExactCheck = 100
    if (range <= maxExactCheck) {
      for (let v = lo; v <= hi; v++) {
        if (this.has(v)) {
          return true
        }
      }
    }

    return false
  }

  addRange(lo: number, hi: number): void {
    if (lo > hi) return
    for (let v = lo; v <= hi; v++) {
      this.add(v)
    }
  }

  clear(): void {
    for (const layer of this.layers) {
      layer.clear()
    }
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._expectedItems
  }

  falsePositiveRate(): number {
    return this.layers[0]!.falsePositiveRate(this._size)
  }

  get bitCount(): number {
    let total = 0
    for (const layer of this.layers) {
      total += layer.bitCount
    }
    return total
  }

  fillRatio(): number {
    if (this.layers.length === 0) return 0
    let totalRatio = 0
    for (const layer of this.layers) {
      totalRatio += layer.fillRatio()
    }
    return totalRatio / this.layers.length
  }

  toString(): string {
    return `RangeBloomFilter(size=${this._size}, capacity=${this._expectedItems}, layers=${this._layerCount}, fpRate=${this._falsePositiveRate}, bitCount=${this.bitCount})`
  }
}

export { DEFAULT_RANGE_BLOOM_OPTIONS } from './types.js'
export type { RangeBloomOptions } from './types.js'
