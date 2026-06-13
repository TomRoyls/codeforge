export class BitSet2 {
  private bits: bigint = 0n

  set(bit: number, value = true): void {
    if (bit < 0 || bit >= 1024) return
    const mask = 1n << BigInt(bit)
    if (value) this.bits |= mask
    else this.bits &= ~mask
  }

  get(bit: number): boolean {
    if (bit < 0 || bit >= 1024) return false
    return (this.bits & (1n << BigInt(bit))) !== 0n
  }

  toggle(bit: number): void { this.set(bit, !this.get(bit)) }

  countOnes(): number {
    let count = 0
    let b = this.bits
    while (b) { count++; b &= b - 1n }
    return count
  }

  or(other: BitSet2): void { this.bits |= other.bits }
  and(other: BitSet2): void { this.bits &= other.bits }
  xor(other: BitSet2): void { this.bits ^= other.bits }
  not(): void { this.bits = ~this.bits }

  intersects(other: BitSet2): boolean { return (this.bits & other.bits) !== 0n }
  isSubsetOf(other: BitSet2): boolean { return (this.bits & other.bits) === this.bits }

  get isEmpty(): boolean { return this.bits === 0n }

  clear(): void { this.bits = 0n }

  toArray(): number[] {
    const result: number[] = []
    let b = this.bits
    let bit = 0
    while (b) {
      if (b & 1n) result.push(bit)
      b >>= 1n
      bit++
    }
    return result
  }

  toString(): string { return this.bits.toString(2) }
  toJSON(): Record<string, number> { return { ones: this.countOnes() } }

  clone(): BitSet2 {
    const c = new BitSet2()
    c.bits = this.bits
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BitSet2)) return false
    return this.bits === other.bits
  }
}
