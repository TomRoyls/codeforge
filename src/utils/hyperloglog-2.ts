export class HyperLogLog2 {
  private registers: Uint8Array
  readonly precision: number
  readonly m: number

  constructor(precision = 14) {
    this.precision = precision
    this.m = 1 << precision
    this.registers = new Uint8Array(this.m)
  }

  private hash(item: string): number {
    let h = 0
    for (let i = 0; i < item.length; i++) {
      h = ((h << 5) - h + item.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  private leadingZeros(hash: number): number {
    const w = hash >>> (32 - this.precision)
    let count = 1
    let bits = hash & ((1 << (32 - this.precision)) - 1)
    while (count <= (32 - this.precision) && (bits & (1 << (32 - this.precision - 1))) === 0) {
      count++
      bits <<= 1
    }
    void w
    return count
  }

  add(item: string): void {
    const hash = this.hash(item)
    const idx = hash >>> (32 - this.precision)
    const lz = this.leadingZeros(hash)
    if (lz > this.registers[idx]) this.registers[idx] = lz
  }

  estimate(): number {
    let alpha: number
    if (this.m <= 16) alpha = 0.673
    else if (this.m <= 32) alpha = 0.697
    else if (this.m <= 64) alpha = 0.709
    else alpha = 0.7213 / (1 + 1.079 / this.m)

    let sum = 0
    let zeros = 0
    for (let i = 0; i < this.m; i++) {
      sum += 2 ** -this.registers[i]
      if (this.registers[i] === 0) zeros++
    }

    const raw = alpha * this.m * this.m / sum

    if (raw <= 2.5 * this.m && zeros > 0) {
      return this.m * Math.log(this.m / zeros)
    }
    return Math.round(raw)
  }

  merge(other: HyperLogLog2): HyperLogLog2 {
    const result = new HyperLogLog2(this.precision)
    for (let i = 0; i < this.m; i++) {
      result.registers[i] = Math.max(this.registers[i], other.registers[i])
    }
    return result
  }

  get isEmpty(): boolean { return this.registers.every(r => r === 0) }

  clear(): void { this.registers.fill(0) }

  toArray(): number[] { return Array.from(this.registers) }
  toString(): string { return JSON.stringify({ precision: this.precision, m: this.m }) }
  toJSON(): Record<string, number> { return { precision: this.precision, m: this.m } }

  clone(): HyperLogLog2 {
    const c = new HyperLogLog2(this.precision)
    c.registers = new Uint8Array(this.registers)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HyperLogLog2)) return false
    return this.m === other.m
  }
}
