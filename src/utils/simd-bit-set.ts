const BITS_PER_WORD = 32

export class SimdBitSet {
  private words: Uint32Array
  private length_: number

  constructor(size: number) {
    if (size < 0) {
      throw new RangeError(`size must be >= 0, got ${size}`)
    }
    this.length_ = size
    const wordCount = Math.ceil(size / BITS_PER_WORD)
    this.words = new Uint32Array(wordCount)
  }

  set(index: number): void {
    if (index < 0 || index >= this.length_) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length_})`)
    }
    const word = index >>> 5
    const bit = index & 31
    this.words[word]! |= (1 << bit)
  }

  clear(index: number): void {
    if (index < 0 || index >= this.length_) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length_})`)
    }
    const word = index >>> 5
    const bit = index & 31
    this.words[word]! &= ~(1 << bit)
  }

  toggle(index: number): void {
    if (index < 0 || index >= this.length_) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length_})`)
    }
    const word = index >>> 5
    const bit = index & 31
    this.words[word]! ^= (1 << bit)
  }

  get(index: number): boolean {
    if (index < 0 || index >= this.length_) return false
    const word = index >>> 5
    const bit = index & 31
    return (this.words[word]! & (1 << bit)) !== 0
  }

  setRange(start: number, end: number): void {
    if (start < 0 || end > this.length_ || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}) for size ${this.length_}`)
    }
    for (let i = start; i < end; i++) {
      this.set(i)
    }
  }

  clearRange(start: number, end: number): void {
    if (start < 0 || end > this.length_ || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}) for size ${this.length_}`)
    }
    for (let i = start; i < end; i++) {
      this.clear(i)
    }
  }

  flipAll(): void {
    const fullWords = this.length_ >>> 5
    for (let i = 0; i < fullWords; i++) {
      this.words[i]! = ~this.words[i]! >>> 0
    }
    const remaining = this.length_ & 31
    if (remaining > 0 && fullWords < this.words.length) {
      const mask = (1 << remaining) - 1
      this.words[fullWords]! = (~this.words[fullWords]! & mask) >>> 0
    }
  }

  and(other: SimdBitSet): SimdBitSet {
    const result = new SimdBitSet(Math.min(this.length_, other.length_))
    const len = Math.min(this.words.length, other.words.length)
    for (let i = 0; i < len; i++) {
      result.words[i] = this.words[i]! & other.words[i]!
    }
    return result
  }

  or(other: SimdBitSet): SimdBitSet {
    const result = new SimdBitSet(Math.max(this.length_, other.length_))
    const len = Math.min(this.words.length, other.words.length)
    for (let i = 0; i < len; i++) {
      result.words[i] = this.words[i]! | other.words[i]!
    }
    for (let i = other.words.length; i < this.words.length; i++) {
      result.words[i] = this.words[i]!
    }
    return result
  }

  xor(other: SimdBitSet): SimdBitSet {
    const result = new SimdBitSet(Math.max(this.length_, other.length_))
    const len = Math.min(this.words.length, other.words.length)
    for (let i = 0; i < len; i++) {
      result.words[i] = (this.words[i]! ^ other.words[i]!) >>> 0
    }
    for (let i = other.words.length; i < this.words.length; i++) {
      result.words[i] = this.words[i]!
    }
    return result
  }

  not(): SimdBitSet {
    const result = this.clone()
    result.flipAll()
    return result
  }

  popcount(): number {
    let count = 0
    for (let i = 0; i < this.words.length; i++) {
      let w = this.words[i]!
      w = w - ((w >>> 1) & 0x55555555)
      w = (w & 0x33333333) + ((w >>> 2) & 0x33333333)
      count += ((w + (w >>> 4)) & 0x0F0F0F0F) * 0x01010101
    }
    return count >>> 24
  }

  nextSetBit(from: number): number {
    if (from >= this.length_) return -1
    let wordIndex = from >>> 5
    let bit = from & 31
    let word = this.words[wordIndex]! >>> bit
    if (word !== 0) return from + this.ctz(word)
    wordIndex++
    while (wordIndex < this.words.length) {
      word = this.words[wordIndex]!
      if (word !== 0) return wordIndex * BITS_PER_WORD + this.ctz(word)
      wordIndex++
    }
    return -1
  }

  nextClearBit(from: number): number {
    if (from >= this.length_) return this.length_
    let wordIndex = from >>> 5
    let bit = from & 31
    let word = (~this.words[wordIndex]! >>> 0) >>> bit
    if (word !== 0) return from + this.ctz(word)
    wordIndex++
    while (wordIndex < this.words.length) {
      word = ~this.words[wordIndex]! >>> 0
      if (word !== 0) return wordIndex * BITS_PER_WORD + this.ctz(word)
      wordIndex++
    }
    return this.length_
  }

  private ctz(value: number): number {
    if (value === 0) return 32
    let count = 0
    while ((value & 1) === 0) {
      count++
      value >>>= 1
    }
    return count
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i]! !== 0) return false
    }
    return true
  }

  intersects(other: SimdBitSet): boolean {
    const len = Math.min(this.words.length, other.words.length)
    for (let i = 0; i < len; i++) {
      if ((this.words[i]! & other.words[i]!) !== 0) return true
    }
    return false
  }

  isSubsetOf(other: SimdBitSet): boolean {
    const len = Math.min(this.words.length, other.words.length)
    for (let i = 0; i < len; i++) {
      if ((this.words[i]! & ~other.words[i]!) !== 0) return false
    }
    for (let i = other.words.length; i < this.words.length; i++) {
      if (this.words[i]! !== 0) return false
    }
    return true
  }

  clone(): SimdBitSet {
    const copy = new SimdBitSet(this.length_)
    copy.words = new Uint32Array(this.words)
    return copy
  }

  reset(): void {
    this.words.fill(0)
  }

  get length(): number {
    return this.length_
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = this.nextSetBit(0); i >= 0; i = this.nextSetBit(i + 1)) {
      result.push(i)
    }
    return result
  }

  toString(): string {
    let result = ''
    for (let i = 0; i < this.length_; i++) {
      result += this.get(i) ? '1' : '0'
    }
    return result
  }

  static fromArray(indices: number[], size: number): SimdBitSet {
    const bs = new SimdBitSet(size)
    for (const i of indices) {
      if (i >= 0 && i < size) {
        bs.set(i)
      }
    }
    return bs
  }

  static fromString(bits: string): SimdBitSet {
    const bs = new SimdBitSet(bits.length)
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === '1') bs.set(i)
    }
    return bs
  }

  equals(other: SimdBitSet): boolean {
    if (this.length_ !== other.length_) return false
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i] !== other.words[i]) return false
    }
    return true
  }
}
