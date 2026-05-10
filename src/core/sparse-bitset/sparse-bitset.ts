function popcount32(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  return ((x + (x >>> 4) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

function countTrailingZeros(x: number): number {
  if (x === 0) return 32
  let n = 0
  if ((x & 0x0000ffff) === 0) { n += 16; x >>>= 16 }
  if ((x & 0x000000ff) === 0) { n += 8; x >>>= 8 }
  if ((x & 0x0000000f) === 0) { n += 4; x >>>= 4 }
  if ((x & 0x00000003) === 0) { n += 2; x >>>= 2 }
  if ((x & 0x00000001) === 0) { n += 1 }
  return n
}

function wordIndexOf(bit: number): number {
  return bit >>> 5
}

function bitMaskOf(bit: number): number {
  return 1 << (bit & 31)
}

export class SparseBitset {
  private words: Map<number, number>
  private _cardinality: number
  private _highestBit: number

  constructor(initialBits?: Iterable<number>) {
    this.words = new Map()
    this._cardinality = 0
    this._highestBit = -1
    if (initialBits) {
      for (const bit of initialBits) {
        this.set(bit)
      }
    }
  }

  set(bit: number): void {
    if (bit < 0) {
      throw new RangeError(`Bit position must be non-negative, got ${bit}`)
    }
    if (!Number.isInteger(bit)) {
      throw new TypeError(`Bit position must be an integer, got ${bit}`)
    }
    const wi = wordIndexOf(bit)
    const mask = bitMaskOf(bit)
    const word = this.words.get(wi) ?? 0
    if ((word & mask) === 0) {
      this.words.set(wi, (word | mask) >>> 0)
      this._cardinality++
      if (bit > this._highestBit) {
        this._highestBit = bit
      }
    }
  }

  clear(bit: number): void {
    if (bit < 0) {
      throw new RangeError(`Bit position must be non-negative, got ${bit}`)
    }
    if (!Number.isInteger(bit)) {
      throw new TypeError(`Bit position must be an integer, got ${bit}`)
    }
    const wi = wordIndexOf(bit)
    const mask = bitMaskOf(bit)
    const word = this.words.get(wi)
    if (word !== undefined && (word & mask) !== 0) {
      const newWord = (word & ~mask) >>> 0
      if (newWord === 0) {
        this.words.delete(wi)
      } else {
        this.words.set(wi, newWord)
      }
      this._cardinality--
      if (bit === this._highestBit) {
        this._highestBit = this.computeHighestBit()
      }
    }
  }

  get(bit: number): boolean {
    if (bit < 0 || !Number.isInteger(bit)) return false
    const wi = wordIndexOf(bit)
    const word = this.words.get(wi)
    if (word === undefined) return false
    return (word & bitMaskOf(bit)) !== 0
  }

  flip(bit: number): void {
    if (bit < 0) {
      throw new RangeError(`Bit position must be non-negative, got ${bit}`)
    }
    if (!Number.isInteger(bit)) {
      throw new TypeError(`Bit position must be an integer, got ${bit}`)
    }
    if (this.get(bit)) {
      this.clear(bit)
    } else {
      this.set(bit)
    }
  }

  nextSetBit(from: number): number {
    if (from < 0) from = 0
    if (this._cardinality === 0) return -1
    const wi = wordIndexOf(from)
    const bitOffset = from & 31
    const sortedKeys = [...this.words.keys()].sort((a, b) => a - b)
    for (const key of sortedKeys) {
      if (key < wi) continue
      let word = this.words.get(key)!
      if (key === wi) {
        word = (word & (~0 << bitOffset)) >>> 0
      }
      if (word !== 0) {
        return (key << 5) + countTrailingZeros(word)
      }
    }
    return -1
  }

  prevSetBit(from: number): number {
    if (this._cardinality === 0) return -1
    if (from < 0) return -1
    const wi = wordIndexOf(from)
    const bitOffset = from & 31
    const sortedKeys = [...this.words.keys()].sort((a, b) => b - a)
    for (const key of sortedKeys) {
      if (key > wi) continue
      let word = this.words.get(key)!
      if (key === wi) {
        word = (word & ((1 << (bitOffset + 1)) - 1)) >>> 0
      }
      if (word !== 0) {
        return (key << 5) + (31 - Math.clz32(word))
      }
    }
    return -1
  }

  cardinality(): number {
    return this._cardinality
  }

  and(other: SparseBitset): SparseBitset {
    const result = new SparseBitset()
    for (const [wi, word] of this.words) {
      const otherWord = other.words.get(wi)
      if (otherWord !== undefined) {
        const combined = (word & otherWord) >>> 0
        if (combined !== 0) {
          result.words.set(wi, combined)
          result._cardinality += popcount32(combined)
        }
      }
    }
    result._highestBit = result.computeHighestBit()
    return result
  }

  or(other: SparseBitset): SparseBitset {
    const result = new SparseBitset()
    const allKeys = new Set([...this.words.keys(), ...other.words.keys()])
    for (const wi of allKeys) {
      const a = this.words.get(wi) ?? 0
      const b = other.words.get(wi) ?? 0
      const combined = (a | b) >>> 0
      if (combined !== 0) {
        result.words.set(wi, combined)
        result._cardinality += popcount32(combined)
      }
    }
    result._highestBit = result.computeHighestBit()
    return result
  }

  xor(other: SparseBitset): SparseBitset {
    const result = new SparseBitset()
    const allKeys = new Set([...this.words.keys(), ...other.words.keys()])
    for (const wi of allKeys) {
      const a = this.words.get(wi) ?? 0
      const b = other.words.get(wi) ?? 0
      const combined = (a ^ b) >>> 0
      if (combined !== 0) {
        result.words.set(wi, combined)
        result._cardinality += popcount32(combined)
      }
    }
    result._highestBit = result.computeHighestBit()
    return result
  }

  not(): SparseBitset {
    const result = new SparseBitset()
    if (this._highestBit < 0) return result
    const maxWi = wordIndexOf(this._highestBit)
    for (let wi = 0; wi <= maxWi; wi++) {
      const word = this.words.get(wi) ?? 0
      const inverted = (~word) >>> 0
      if (inverted !== 0) {
        result.words.set(wi, inverted)
        result._cardinality += popcount32(inverted)
      }
    }
    result._highestBit = result.computeHighestBit()
    return result
  }

  isEmpty(): boolean {
    return this._cardinality === 0
  }

  clone(): SparseBitset {
    const result = new SparseBitset()
    result.words = new Map(this.words)
    result._cardinality = this._cardinality
    result._highestBit = this._highestBit
    return result
  }

  *[Symbol.iterator](): Iterator<number> {
    if (this._cardinality === 0) return
    const sortedKeys = [...this.words.keys()].sort((a, b) => a - b)
    for (const wi of sortedKeys) {
      let word = this.words.get(wi)!
      while (word !== 0) {
        const bit = countTrailingZeros(word)
        yield (wi << 5) + bit
        word &= word - 1
        word = word >>> 0
      }
    }
  }

  private computeHighestBit(): number {
    if (this.words.size === 0) return -1
    let maxWi = -1
    for (const wi of this.words.keys()) {
      if (wi > maxWi) maxWi = wi
    }
    const word = this.words.get(maxWi)!
    return (maxWi << 5) + (31 - Math.clz32(word))
  }
}

export { WORD_SIZE } from './types.js'
