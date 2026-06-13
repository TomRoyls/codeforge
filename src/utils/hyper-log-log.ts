export class HyperLogLog {
  private registers: Uint8Array
  private precision: number

  constructor(precision = 14) {
    this.precision = precision
    this.registers = new Uint8Array(1 << precision)
  }

  add(item: string): void {
    const hash = this.hash(item)
    const index = hash >>> (32 - this.precision)
    const w = hash << this.precision
    const rank = this.rankOf(w >>> this.precision)
    if (rank > this.registers[index]!) {
      this.registers[index] = rank
    }
  }

  count(): number {
    const m = this.registers.length
    let alpha = 0
    if (m === 16) alpha = 0.673
    else if (m === 32) alpha = 0.697
    else if (m === 64) alpha = 0.709
    else alpha = 0.7213 / (1 + 1.079 / m)

    let sum = 0
    let zeros = 0
    for (let i = 0; i < m; i++) {
      const val = this.registers[i]!
      sum += 1 / (1 << val)
      if (val === 0) zeros++
    }

    const estimate = alpha * m * m / sum
    if (estimate <= 2.5 * m && zeros > 0) {
      return Math.round(m * Math.log(m / zeros))
    }
    return Math.round(estimate)
  }

  merge(other: HyperLogLog): void {
    for (let i = 0; i < this.registers.length; i++) {
      this.registers[i] = Math.max(this.registers[i]!, other.registers[i]!)
    }
  }

  get registerCount(): number {
    return this.registers.length
  }

  get isEmpty(): boolean {
    for (const r of this.registers) if (r > 0) return false
    return true
  }

  clear(): void {
    this.registers.fill(0)
  }

  toString(): string {
    return JSON.stringify({ precision: this.precision, estimate: this.count() })
  }

  toJSON(): Record<string, unknown> {
    return { precision: this.precision, estimate: this.count(), registers: this.registers.length }
  }

  clone(): HyperLogLog {
    const copy = new HyperLogLog(this.precision)
    copy.registers = new Uint8Array(this.registers)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HyperLogLog)) return false
    return this.precision === other.precision
  }

  private hash(item: string): number {
    let h = 2166136261
    for (let i = 0; i < item.length; i++) {
      h ^= item.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  private rankOf(value: number): number {
    if (value === 0) return 32
    let r = 1
    while ((value & 1) === 0) {
      r++
      value >>>= 1
    }
    return r
  }
}
