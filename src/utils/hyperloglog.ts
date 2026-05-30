export class HyperLogLog {
  private registers: Uint8Array
  private m: number
  private alpha: number

  constructor(precision: number = 14) {
    this.m = 1 << precision
    this.registers = new Uint8Array(this.m)
    this.alpha = this.computeAlpha(this.m)
  }

  add(value: string): void {
    const hash = this.hash(value)
    const index = hash >>> (32 - Math.log2(this.m))
    const w = (hash << Math.log2(this.m)) | (1 << (Math.log2(this.m) - 1))
    const rho = this.rho(w)
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
    return Math.round(estimate)
  }

  merge(other: HyperLogLog): void {
    for (let i = 0; i < this.m; i++) {
      if (other.registers[i]! > this.registers[i]!) {
        this.registers[i] = other.registers[i]!
      }
    }
  }

  get precision(): number {
    return Math.log2(this.m)
  }

  get registerCount(): number {
    return this.m
  }

  private hash(str: string): number {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  private rho(w: number): number {
    let count = 1
    while ((w & 1) === 0 && count <= 32) {
      count++
      w >>>= 1
    }
    return count
  }

  private computeAlpha(m: number): number {
    switch (m) {
      case 16: return 0.673
      case 32: return 0.697
      case 64: return 0.709
      default: return 0.7213 / (1 + 1.079 / m)
    }
  }
}
