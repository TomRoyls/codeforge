export class HyperLogLog {
  private registers: Uint8Array
  private readonly _precision: number
  private readonly _m: number
  private readonly _alpha: number

  constructor(precision: number = 14) {
    if (precision < 4 || precision > 16) {
      throw new RangeError(`Precision must be between 4 and 16, got ${precision}`)
    }
    this._precision = precision
    this._m = 1 << precision
    this.registers = new Uint8Array(this._m)
    this._alpha = this.computeAlpha(this._m)
  }

  private computeAlpha(m: number): number {
    switch (m) {
      case 16: return 0.673
      case 32: return 0.697
      case 64: return 0.709
      default: return 0.7213 / (1 + 1.079 / m)
    }
  }

  private hash(str: string): number {
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }

  add(value: string): void {
    const hash = this.hash(value)
    const index = hash >>> (32 - this._precision)
    const w = ((hash << this._precision) >>> this._precision) >>> 0
    const rho = this.rho(w)
    if (rho > this.registers[index]!) {
      this.registers[index] = rho
    }
  }

  private rho(value: number): number {
    if (value === 0) return 32 - this._precision + 1
    let count = 0
    while ((value & 1) === 0) {
      count++
      value >>>= 1
    }
    return count + 1
  }

  count(): number {
    let sum = 0
    let zeros = 0
    for (let i = 0; i < this._m; i++) {
      const val = this.registers[i]!
      sum += 1 / (1 << val)
      if (val === 0) zeros++
    }
    const estimate = this._alpha * this._m * this._m / sum
    if (estimate <= 2.5 * this._m && zeros > 0) {
      return Math.round(this._m * Math.log(this._m / zeros))
    }
    return Math.round(estimate)
  }

  merge(other: HyperLogLog): HyperLogLog {
    if (this._precision !== other._precision) {
      throw new Error('Cannot merge HyperLogLog with different precision')
    }
    const result = new HyperLogLog(this._precision)
    for (let i = 0; i < this._m; i++) {
      result.registers[i] = Math.max(this.registers[i]!, other.registers[i]!)
    }
    return result
  }

  get precision(): number {
    return this._precision
  }

  get registerCount(): number {
    return this._m
  }

  reset(): void {
    this.registers.fill(0)
  }
}
