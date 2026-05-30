export class HyperLogLog {
  private registers: Uint8Array
  private readonly precision: number
  private readonly m: number
  private readonly alpha: number

  constructor(precision: number = 14) {
    if (precision < 4 || precision > 16) throw new RangeError('precision must be between 4 and 16')
    this.precision = precision
    this.m = 1 << precision
    this.registers = new Uint8Array(this.m)
    this.alpha = this.m === 16 ? 0.673
      : this.m === 32 ? 0.697
      : this.m === 64 ? 0.709
      : 0.7213 / (1 + 1.079 / this.m)
  }

  add(value: string): void {
    const hash = this.hashString(value)
    const index = hash >>> (32 - this.precision)
    const remaining = (hash << this.precision) | (hash >>> (32 - this.precision))
    const rho = this.rho(remaining >>> (this.precision > 0 ? 0 : 0))
    if (rho > this.registers[index]!) {
      this.registers[index] = rho
    }
  }

  count(): number {
    let sum = 0
    let zeros = 0
    for (let i = 0; i < this.m; i++) {
      const val = this.registers[i]!
      sum += 1 / (1 << val)
      if (val === 0) zeros++
    }
    const estimate = this.alpha * this.m * this.m / sum
    if (estimate <= 2.5 * this.m && zeros > 0) {
      return this.m * Math.log(this.m / zeros)
    }
    if (estimate <= (1 / 30) * (1 << 32)) {
      return estimate
    }
    return -(1 << 32) * Math.log(1 - estimate / (1 << 32))
  }

  merge(other: HyperLogLog): HyperLogLog {
    if (this.precision !== other.precision) {
      throw new Error('Cannot merge HyperLogLogs with different precision')
    }
    const result = new HyperLogLog(this.precision)
    for (let i = 0; i < this.m; i++) {
      result.registers[i] = Math.max(this.registers[i]!, other.registers[i]!)
    }
    return result
  }

  get registerCount(): number {
    return this.m
  }

  reset(): void {
    this.registers.fill(0)
  }

  private rho(value: number): number {
    if (value === 0) return 32 - this.precision + 1
    let count = 1
    while ((value & 1) === 0) {
      count++
      value >>>= 1
    }
    return count
  }

  private hashString(s: string): number {
    let h1 = 0x314159265
    let h2 = 0x271828183
    for (let i = 0; i < s.length; i++) {
      const ch = s.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 0x85ebca6b)
      h2 = Math.imul(h2 ^ ch, 0x165667b1)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 0x45d9f3b)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 0x45d9f3b)
    return (h1 ^ h2) >>> 0
  }
}
