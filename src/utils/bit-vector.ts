export class BitVector {
  private words: Uint32Array
  private length: number

  constructor(length: number) {
    this.length = length
    this.words = new Uint32Array(Math.ceil(length / 32))
  }

  set(index: number, value: boolean): void {
    if (index < 0 || index >= this.length) return
    const wordIdx = index >> 5
    const bitIdx = index & 31
    if (value) this.words[wordIdx]! |= (1 << bitIdx)
    else this.words[wordIdx]! &= ~(1 << bitIdx)
  }

  get(index: number): boolean {
    if (index < 0 || index >= this.length) return false
    return ((this.words[index >> 5]! >> (index & 31)) & 1) === 1
  }

  flip(index: number): void { this.set(index, !this.get(index)) }

  countOnes(): number {
    let count = 0
    for (let i = 0; i < this.words.length; i++) {
      let w = this.words[i]!
      while (w) { count++; w &= w - 1 }
    }
    return count
  }

  countZeros(): number { return this.length - this.countOnes() }

  get size(): number { return this.length }
  get isEmpty(): boolean { return this.countOnes() === 0 }

  clear(): void { this.words.fill(0) }

  toArray(): boolean[] {
    const result: boolean[] = []
    for (let i = 0; i < this.length; i++) result.push(this.get(i))
    return result
  }

  toString(): string { return JSON.stringify({ length: this.length, ones: this.countOnes() }) }
  toJSON(): Record<string, number> { return { length: this.length, ones: this.countOnes() } }

  clone(): BitVector {
    const c = new BitVector(this.length)
    c.words = new Uint32Array(this.words)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BitVector)) return false
    if (this.length !== other.length) return false
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i] !== other.words[i]) return false
    }
    return true
  }
}
