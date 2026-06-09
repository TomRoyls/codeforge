export class HyperLogLog3 {
  private registers: Uint8Array
  private precision: number

  constructor(precision = 14) {
    if (precision < 4 || precision > 16) {
      throw new RangeError(`precision must be between 4 and 16, got ${precision}`)
    }
    this.precision = precision
    this.registers = new Uint8Array(1 << precision)
  }

  add(value: string): void {
    const hash = this.murmurHash3(value, 0x12345678)
    const idx = hash >>> (32 - this.precision)
    const remaining = ((hash << this.precision) | 1) >>> 0
    const rho = this.countLeadingZeros(remaining) + 1
    if (rho > this.registers[idx]!) {
      this.registers[idx] = rho
    }
  }

  count(): number {
    const m = this.registers.length
    let sum = 0
    let zeros = 0
    for (let i = 0; i < m; i++) {
      sum += 1 / (1 << this.registers[i]!)
      if (this.registers[i] === 0) zeros++
    }
    const alpha = this.getAlpha(m)
    const raw = (alpha * m * m) / sum
    const twoPow32 = 4294967296

    let est: number
    if (raw <= 2.5 * m && zeros > 0) {
      est = m * Math.log(m / zeros)
    } else if (raw <= twoPow32 / 30) {
      est = raw
    } else if (raw >= twoPow32) {
      est = twoPow32
    } else {
      est = -twoPow32 * Math.log(1 - raw / twoPow32)
    }

    return Math.round(est)
  }

  merge(other: HyperLogLog3): void {
    if (this.precision !== other.precision) {
      throw new Error('Cannot merge HyperLogLog3 structures with different precisions')
    }
    for (let i = 0; i < this.registers.length; i++) {
      if (other.registers[i]! > this.registers[i]!) {
        this.registers[i] = other.registers[i]!
      }
    }
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.registers.length; i++) {
      if (this.registers[i] !== 0) return false
    }
    return true
  }

  reset(): void {
    this.registers.fill(0)
  }

  private getAlpha(m: number): number {
    if (m === 16) return 0.673
    if (m === 32) return 0.697
    if (m === 64) return 0.709
    return 0.7213 / (1 + 1.079 / m)
  }

  private murmurHash3(data: string, seed: number): number {
    let h1 = seed >>> 0
    const len = data.length
    const nblocks = len >> 2
    const c1 = 0xcc9e2d51
    const c2 = 0x1b873593

    for (let i = 0; i < nblocks; i++) {
      let k1 =
        (data.charCodeAt(i * 4) & 0xff) |
        ((data.charCodeAt(i * 4 + 1) & 0xff) << 8) |
        ((data.charCodeAt(i * 4 + 2) & 0xff) << 16) |
        ((data.charCodeAt(i * 4 + 3) & 0xff) << 24)

      k1 = Math.imul(k1, c1)
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = Math.imul(k1, c2)

      h1 ^= k1
      h1 = (h1 << 13) | (h1 >>> 19)
      h1 = Math.imul(h1, 5) + 0xe6546b64
    }

    let k1 = 0
    const tailStart = nblocks * 4
    const tailLen = len & 3

    if (tailLen >= 3) k1 ^= (data.charCodeAt(tailStart + 2) & 0xff) << 16
    if (tailLen >= 2) k1 ^= (data.charCodeAt(tailStart + 1) & 0xff) << 8
    if (tailLen >= 1) {
      k1 ^= data.charCodeAt(tailStart) & 0xff
      k1 = Math.imul(k1, c1)
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = Math.imul(k1, c2)
      h1 ^= k1
    }

    h1 ^= len
    h1 ^= h1 >>> 16
    h1 = Math.imul(h1, 0x85ebca6b)
    h1 ^= h1 >>> 13
    h1 = Math.imul(h1, 0xc2b2ae35)
    h1 ^= h1 >>> 16

    return h1 >>> 0
  }

  private countLeadingZeros(x: number): number {
    if (x === 0) return 32
    let n = 0
    let v = x >>> 0
    if ((v & 0xFFFF0000) === 0) { n += 16; v <<= 16 }
    if ((v & 0xFF000000) === 0) { n += 8; v <<= 8 }
    if ((v & 0xF0000000) === 0) { n += 4; v <<= 4 }
    if ((v & 0xC0000000) === 0) { n += 2; v <<= 2 }
    if ((v & 0x80000000) === 0) { n += 1 }
    return n
  }

  clear(): void {
    this.registers = new Uint8Array(1 << this.precision);
  }
}
