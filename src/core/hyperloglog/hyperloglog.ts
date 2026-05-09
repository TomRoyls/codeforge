import type { HyperLogLogOptions } from './types.js'
import { DEFAULT_HYPERLOGLOG_OPTIONS } from './types.js'

const ALPHA_16 = 0.673
const ALPHA_32 = 0.697
const ALPHA_64 = 0.709
const ALPHA_M = 0.7213 / (1 + 1.079 / 65536)

function getAlpha(m: number): number {
  if (m === 16) return ALPHA_16
  if (m === 32) return ALPHA_32
  if (m === 64) return ALPHA_64
  return ALPHA_M
}

function murmurHash3(str: string, seed: number): number {
  let h1 = seed >>> 0
  const len = str.length
  const nblocks = len >> 2
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593

  for (let i = 0; i < nblocks; i++) {
    let k1 =
      (str.charCodeAt(i * 4) & 0xff) |
      ((str.charCodeAt(i * 4 + 1) & 0xff) << 8) |
      ((str.charCodeAt(i * 4 + 2) & 0xff) << 16) |
      ((str.charCodeAt(i * 4 + 3) & 0xff) << 24)

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

  if (tailLen >= 3) k1 ^= (str.charCodeAt(tailStart + 2) & 0xff) << 16
  if (tailLen >= 2) k1 ^= (str.charCodeAt(tailStart + 1) & 0xff) << 8
  if (tailLen >= 1) {
    k1 ^= str.charCodeAt(tailStart) & 0xff
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

function countLeadingZeros32(x: number): number {
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

export class HyperLogLog {
  private regs: Uint8Array
  private p: number
  private m: number

  constructor(options?: Partial<HyperLogLogOptions>) {
    const opts: HyperLogLogOptions = { ...DEFAULT_HYPERLOGLOG_OPTIONS, ...options }
    const precision = opts.precision
    if (precision < 4 || precision > 16) {
      throw new RangeError(`precision must be between 4 and 16, got ${precision}`)
    }
    this.p = precision
    this.m = 1 << precision
    this.regs = new Uint8Array(this.m)
  }

  add(item: string): void {
    const hash = murmurHash3(item, 0x12345678)
    const idx = hash >>> (32 - this.p)
    const remaining = ((hash << this.p) | 1) >>> 0
    const rho = countLeadingZeros32(remaining) + 1
    if (rho > this.regs[idx]!) {
      this.regs[idx] = rho
    }
  }

  count(): number {
    const m = this.m
    let sum = 0
    let zeros = 0
    for (let i = 0; i < m; i++) {
      sum += 1 / (1 << this.regs[i]!)
      if (this.regs[i] === 0) zeros++
    }
    const alpha = getAlpha(m)
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

  merge(other: HyperLogLog): void {
    if (this.p !== other.p) {
      throw new Error('Cannot merge HyperLogLog structures with different precisions')
    }
    for (let i = 0; i < this.m; i++) {
      if (other.regs[i]! > this.regs[i]!) {
        this.regs[i] = other.regs[i]!
      }
    }
  }

  reset(): void {
    this.regs = new Uint8Array(this.m)
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.m; i++) {
      if (this.regs[i] !== 0) return false
    }
    return true
  }

  precision(): number {
    return this.p
  }

  registers(): Uint8Array {
    return new Uint8Array(this.regs)
  }

  estimateError(): number {
    return 1.04 / Math.sqrt(this.m)
  }
}

export { DEFAULT_HYPERLOGLOG_OPTIONS } from './types.js'
export type { HyperLogLogOptions } from './types.js'
