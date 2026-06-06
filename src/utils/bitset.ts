export class Bitset {
  private readonly words: Uint32Array
  readonly length: number

  constructor(length: number = 64) {
    if (length < 0) throw new RangeError('length must be >= 0')
    this.length = length
    this.words = new Uint32Array(Math.ceil(length / 32))
  }

  static fromArray(bits: number[]): Bitset {
    const bs = new Bitset(bits.length)
    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) bs.set(i)
    }
    return bs
  }

  set(index: number): void {
    this.boundsCheck(index)
    this.words[index >>> 5]! |= (1 << (index & 31))
  }

  clear(index: number): void {
    this.boundsCheck(index)
    this.words[index >>> 5]! &= ~(1 << (index & 31))
  }

  flip(index: number): void {
    this.boundsCheck(index)
    this.words[index >>> 5]! ^= (1 << (index & 31))
  }

  get(index: number): boolean {
    this.boundsCheck(index)
    return ((this.words[index >>> 5]! >>> (index & 31)) & 1) === 1
  }

  count(): number {
    let c = 0
    for (let i = 0; i < this.words.length; i++) {
      c += popcount(this.words[i]!)
    }
    return c
  }

  all(): boolean {
    const fullWords = Math.floor(this.length / 32)
    for (let i = 0; i < fullWords; i++) {
      if (this.words[i]! !== 0xffffffff) return false
    }
    const remaining = this.length % 32
    if (remaining > 0) {
      const mask = (1 << remaining) - 1
      if ((this.words[fullWords]! & mask) !== mask) return false
    }
    return this.length > 0
  }

  none(): boolean {
    return this.count() === 0
  }

  any(): boolean {
    return this.count() > 0
  }

  toString(): string {
    let s = ''
    for (let i = 0; i < this.length; i++) {
      s += this.get(i) ? '1' : '0'
    }
    return s
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.length; i++) {
      result.push(this.get(i) ? 1 : 0)
    }
    return result
  }

  clone(): Bitset {
    const bs = new Bitset(this.length)
    bs.words.set(this.words)
    return bs
  }

  private boundsCheck(index: number): void {
    if (index < 0 || index >= this.length) throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`)
  }
}

function popcount(n: number): number {
  n = n - ((n >>> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333)
  return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}
