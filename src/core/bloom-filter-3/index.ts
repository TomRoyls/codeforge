import type { HashFunction, BloomFilterOptions, SerializedBloomFilter } from './types.js'

function defaultHash(element: string, seed: number): number {
  let h = seed
  for (let i = 0; i < element.length; i++) {
    const ch = element.charCodeAt(i)
    h = Math.imul(h ^ ch, 2654435761)
    h = (h ^ (h >>> 16)) | 1
  }
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  h = h ^ (h >>> 16)
  return h >>> 0
}

export class BloomFilter {
  private bits: Uint8Array
  private _size = 0
  private _bitCount: number
  private _hashCount: number
  private _capacity: number
  private _falsePositiveRate: number
  private _hashFunction: HashFunction
  private elements: string[] = []

  constructor(options?: BloomFilterOptions) {
    const capacity = options?.capacity ?? 100
    const fpr = options?.falsePositiveRate ?? 0.01

    if (options?.bitCount !== undefined && options?.hashCount !== undefined) {
      this._bitCount = options.bitCount
      this._hashCount = options.hashCount
    } else if (options?.bitCount !== undefined) {
      this._bitCount = options.bitCount
      this._hashCount = Math.max(
        1,
        Math.round((this._bitCount / capacity) * Math.LN2)
      )
    } else if (options?.hashCount !== undefined) {
      this._hashCount = options.hashCount
      this._bitCount = Math.max(
        this._hashCount,
        Math.ceil(
          (-capacity * Math.log(fpr)) / (Math.LN2 * Math.LN2)
        )
      )
    } else {
      this._bitCount = Math.max(
        1,
        Math.ceil((-capacity * Math.log(fpr)) / (Math.LN2 * Math.LN2))
      )
      this._hashCount = Math.max(
        1,
        Math.round((this._bitCount / capacity) * Math.LN2)
      )
    }

    this._capacity = capacity
    this._falsePositiveRate = fpr
    this._hashFunction = options?.hashFunction ?? defaultHash
    this.bits = new Uint8Array(this._bitCount)
  }

  private getBitIndices(element: string): number[] {
    const indices: number[] = []
    const h1 = this._hashFunction(element, 0)
    const h2 = this._hashFunction(element, h1)
    for (let i = 0; i < this._hashCount; i++) {
      const idx = (h1 + i * h2) % this._bitCount
      indices.push(idx < 0 ? idx + this._bitCount : idx)
    }
    return indices
  }

  add(element: string): void {
    const indices = this.getBitIndices(element)
    for (const idx of indices) {
      this.bits[idx] = 1
    }
    this._size++
    this.elements.push(element)
  }

  has(element: string): boolean {
    return this.mightContain(element)
  }

  mightContain(element: string): boolean {
    const indices = this.getBitIndices(element)
    for (const idx of indices) {
      if (this.bits[idx] === 0) return false
    }
    return true
  }

  get falsePositiveRate(): number {
    if (this._bitCount === 0) return 1
    const exponent = (-this._hashCount * this._size) / this._bitCount
    return Math.pow(1 - Math.exp(exponent), this._hashCount)
  }

  static expectedBitCount(capacity: number, falsePositiveRate: number): number {
    return Math.max(
      1,
      Math.ceil(
        (-capacity * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2)
      )
    )
  }

  static expectedHashCount(bitCount: number, capacity: number): number {
    return Math.max(1, Math.round((bitCount / capacity) * Math.LN2))
  }

  get fillRatio(): number {
    if (this._bitCount === 0) return 0
    let setBits = 0
    for (let i = 0; i < this._bitCount; i++) {
      if (this.bits[i] === 1) setBits++
    }
    return setBits / this._bitCount
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.bits.fill(0)
    this._size = 0
    this.elements = []
  }

  clone(): BloomFilter {
    const bf = new BloomFilter({
      capacity: this._capacity,
      falsePositiveRate: this._falsePositiveRate,
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      hashFunction: this._hashFunction,
    })
    bf.bits = new Uint8Array(this.bits)
    bf._size = this._size
    bf.elements = [...this.elements]
    return bf
  }

  union(other: BloomFilter): BloomFilter {
    const result = this.clone()
    for (let i = 0; i < this._bitCount; i++) {
      result.bits[i] = this.bits[i]! | other.bits[i]!
    }
    const seen = new Set<string>(result.elements)
    for (const el of other.elements) {
      if (seen.has(el)) continue
      if (!this.mightContain(el)) {
        seen.add(el)
        result._size++
        result.elements.push(el)
      }
    }
    return result
  }

  intersect(other: BloomFilter): BloomFilter {
    const result = this.clone()
    for (let i = 0; i < this._bitCount; i++) {
      result.bits[i] = this.bits[i]! & other.bits[i]!
    }
    const shared: string[] = []
    for (const el of this.elements) {
      if (other.has(el)) {
        shared.push(el)
      }
    }
    result.elements = shared
    result._size = shared.length
    return result
  }

  equals(other: BloomFilter): boolean {
    if (this._bitCount !== other._bitCount) return false
    for (let i = 0; i < this._bitCount; i++) {
      if (this.bits[i] !== other.bits[i]) return false
    }
    return true
  }

  forEach(callback: (element: string, index: number) => void): void {
    for (let i = 0; i < this.elements.length; i++) {
      callback(this.elements[i]!, i)
    }
  }

  toArray(): string[] {
    return [...this.elements]
  }

  static fromArray(
    elements: string[],
    options?: BloomFilterOptions
  ): BloomFilter {
    const capacity = options?.capacity ?? Math.max(elements.length, 1)
    const bf = new BloomFilter({
      ...options,
      capacity,
    })
    for (const el of elements) {
      bf.add(el)
    }
    return bf
  }

  serialize(): SerializedBloomFilter {
    const bitsArr: number[] = []
    for (let i = 0; i < this._bitCount; i++) {
      bitsArr.push(this.bits[i]!)
    }
    return {
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      capacity: this._capacity,
      falsePositiveRate: this._falsePositiveRate,
      size: this._size,
      elements: [...this.elements],
      bits: bitsArr,
    }
  }

  static deserialize(
    data: SerializedBloomFilter,
    hashFunction?: HashFunction
  ): BloomFilter {
    const options: BloomFilterOptions = {
      capacity: data.capacity,
      falsePositiveRate: data.falsePositiveRate,
      bitCount: data.bitCount,
      hashCount: data.hashCount,
      hashFunction,
    }
    const bf = new BloomFilter(options)
    bf._size = data.size
    bf.elements = [...data.elements]
    for (let i = 0; i < data.bitCount; i++) {
      bf.bits[i] = data.bits[i]!
    }
    return bf
  }

  get capacity(): number {
    return this._capacity
  }

  get bitCount(): number {
    return this._bitCount
  }

  get hashCount(): number {
    return this._hashCount
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${BloomFilter}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BloomFilter', size: this.size, items: this.toArray() }
  }
}
