export class BitSet {
  private data: Uint32Array
  private _size: number

  constructor(size: number) {
    if (size < 0) throw new RangeError('BitSet size must be non-negative')
    this._size = size
    this.data = new Uint32Array(Math.ceil(size / 32))
  }

  private checkIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
  }

  private wordAndOffset(index: number): [number, number] {
    return [(index / 32) | 0, index % 32]
  }

  set(index: number): void {
    this.checkIndex(index)
    const [w, o] = this.wordAndOffset(index)
    this.data[w]! |= 1 << o
  }

  clear(index: number): void {
    this.checkIndex(index)
    const [w, o] = this.wordAndOffset(index)
    this.data[w]! &= ~(1 << o)
  }

  flip(index: number): void {
    this.checkIndex(index)
    const [w, o] = this.wordAndOffset(index)
    this.data[w]! ^= 1 << o
  }

  get(index: number): number {
    this.checkIndex(index)
    const [w, o] = this.wordAndOffset(index)
    return (this.data[w]! >>> o) & 1
  }

  has(index: number): boolean {
    return this.get(index) === 1
  }

  setRange(from: number, to: number): void {
    if (from < 0 || to > this._size || from > to) {
      throw new RangeError(`Invalid range [${from}, ${to})`)
    }
    for (let i = from; i < to; i++) {
      const [w, o] = this.wordAndOffset(i)
      this.data[w]! |= 1 << o
    }
  }

  clearRange(from: number, to: number): void {
    if (from < 0 || to > this._size || from > to) {
      throw new RangeError(`Invalid range [${from}, ${to})`)
    }
    for (let i = from; i < to; i++) {
      const [w, o] = this.wordAndOffset(i)
      this.data[w]! &= ~(1 << o)
    }
  }

  flipRange(from: number, to: number): void {
    if (from < 0 || to > this._size || from > to) {
      throw new RangeError(`Invalid range [${from}, ${to})`)
    }
    for (let i = from; i < to; i++) {
      const [w, o] = this.wordAndOffset(i)
      this.data[w]! ^= 1 << o
    }
  }

  count(): number {
    let c = 0
    for (let i = 0; i < this.data.length; i++) {
      let v = this.data[i]!
      while (v !== 0) {
        v &= v - 1
        c++
      }
    }
    return c
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this.count() === 0
  }

  isFull(): boolean {
    return this.count() === this._size
  }

  and(other: BitSet): BitSet {
    const resultSize = Math.max(this._size, other._size)
    const result = new BitSet(resultSize)
    const len = Math.min(this.data.length, other.data.length)
    for (let i = 0; i < len; i++) {
      result.data[i] = this.data[i]! & other.data[i]!
    }
    return result
  }

  or(other: BitSet): BitSet {
    const resultSize = Math.max(this._size, other._size)
    const result = new BitSet(resultSize)
    const len = Math.max(this.data.length, other.data.length)
    for (let i = 0; i < len; i++) {
      const a = i < this.data.length ? this.data[i]! : 0
      const b = i < other.data.length ? other.data[i]! : 0
      result.data[i] = a | b
    }
    return result
  }

  xor(other: BitSet): BitSet {
    const resultSize = Math.max(this._size, other._size)
    const result = new BitSet(resultSize)
    const len = Math.max(this.data.length, other.data.length)
    for (let i = 0; i < len; i++) {
      const a = i < this.data.length ? this.data[i]! : 0
      const b = i < other.data.length ? other.data[i]! : 0
      result.data[i] = a ^ b
    }
    return result
  }

  not(): BitSet {
    const result = new BitSet(this._size)
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = ~this.data[i]! >>> 0
    }
    if (this._size % 32 !== 0) {
      const lastWord = this.data.length - 1
      const mask = (1 << (this._size % 32)) - 1
      result.data[lastWord]! &= mask
    }
    return result
  }

  equals(other: BitSet): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== other.data[i]) return false
    }
    return true
  }

  clone(): BitSet {
    const copy = new BitSet(this._size)
    copy.data = new Uint32Array(this.data)
    return copy
  }

  toString(): string {
    let s = ''
    for (let i = this._size - 1; i >= 0; i--) {
      s += this.get(i)
    }
    return s
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      if (this.has(i)) result.push(i)
    }
    return result
  }

  toJSON(): unknown {
    return {
      size: this._size,
      bits: Array.from(this.data),
    }
  }
}
