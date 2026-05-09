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

function murmurHash3(data: string, seed: number): number {
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

export interface HyperLogLogJSON {
  precision: number
  registers: number[]
}

export class HyperLogLog<T = string> {
  private regs: Uint8Array
  private _precision: number
  private _registerCount: number

  constructor(options?: Partial<HyperLogLogOptions>) {
    const opts: HyperLogLogOptions = { ...DEFAULT_HYPERLOGLOG_OPTIONS, ...options }
    const p = opts.precision
    if (p < 4 || p > 16) {
      throw new RangeError(`precision must be between 4 and 16, got ${p}`)
    }
    this._precision = p
    this._registerCount = 1 << p
    this.regs = new Uint8Array(this._registerCount)
  }

  add(item: T): void {
    const str = this.serialize(item)
    const hash = murmurHash3(str, 0x12345678)
    const idx = hash >>> (32 - this._precision)
    const remaining = ((hash << this._precision) | 1) >>> 0
    const rho = countLeadingZeros32(remaining) + 1
    if (rho > this.regs[idx]!) {
      this.regs[idx] = rho
    }
  }

  count(): number {
    const m = this._registerCount
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

  merge(other: HyperLogLog<T>): void {
    if (this._precision !== other._precision) {
      throw new Error('Cannot merge HyperLogLog structures with different precisions')
    }
    for (let i = 0; i < this._registerCount; i++) {
      if (other.regs[i]! > this.regs[i]!) {
        this.regs[i] = other.regs[i]!
      }
    }
  }

  reset(): void {
    this.regs = new Uint8Array(this._registerCount)
  }

  clear(): void {
    this.regs = new Uint8Array(this._registerCount)
  }

  isEmpty(): boolean {
    for (let i = 0; i < this._registerCount; i++) {
      if (this.regs[i] !== 0) return false
    }
    return true
  }

  clone(): HyperLogLog<T> {
    const cloned = new HyperLogLog<T>({ precision: this._precision })
    cloned.regs = new Uint8Array(this.regs)
    return cloned
  }

  precision(): number {
    return this._precision
  }

  get registerCount(): number {
    return this._registerCount
  }

  registers(): Uint8Array {
    return new Uint8Array(this.regs)
  }

  relativeError(): number {
    return 1.04 / Math.sqrt(this._registerCount)
  }

  estimateError(): number {
    return this.relativeError()
  }

  toJSON(): HyperLogLogJSON {
    return {
      precision: this._precision,
      registers: Array.from(this.regs),
    }
  }

  static fromJSON<T = string>(json: HyperLogLogJSON): HyperLogLog<T> {
    const hll = new HyperLogLog<T>({ precision: json.precision })
    for (let i = 0; i < json.registers.length; i++) {
      hll.regs[i] = json.registers[i]!
    }
    return hll
  }

  private serialize(item: T): string {
    if (typeof item === 'string') return item
    return JSON.stringify(item)
  }
}

export { DEFAULT_HYPERLOGLOG_OPTIONS } from './types.js'
export type { HyperLogLogOptions } from './types.js'
