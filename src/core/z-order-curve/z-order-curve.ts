import type { ZOrderCurveOptions, Point2D, Point3D } from './types.js'

export class ZOrderCurve {
  private _bits: number
  private _dimensions: 2 | 3

  constructor(options?: ZOrderCurveOptions) {
    this._bits = options?.bits ?? 16
    this._dimensions = options?.dimensions ?? 2
  }

  encode2D(x: number, y: number): bigint {
    if (x < 0 || y < 0) {
      throw new Error('Coordinates must be non-negative')
    }
    const maxVal = (1 << this._bits) - 1
    if (x > maxVal || y > maxVal) {
      throw new Error('Coordinates exceed bit precision')
    }
    let result = 0n
    for (let i = 0; i < this._bits; i++) {
      result |= BigInt((x >> i) & 1) << BigInt(2 * i)
      result |= BigInt((y >> i) & 1) << BigInt(2 * i + 1)
    }
    return result
  }

  decode2D(code: bigint): Point2D {
    let x = 0n
    let y = 0n
    for (let i = 0; i < this._bits; i++) {
      x |= ((code >> BigInt(2 * i)) & 1n) << BigInt(i)
      y |= ((code >> BigInt(2 * i + 1)) & 1n) << BigInt(i)
    }
    return { x: Number(x), y: Number(y) }
  }

  encode3D(x: number, y: number, z: number): bigint {
    if (x < 0 || y < 0 || z < 0) {
      throw new Error('Coordinates must be non-negative')
    }
    const maxVal = (1 << this._bits) - 1
    if (x > maxVal || y > maxVal || z > maxVal) {
      throw new Error('Coordinates exceed bit precision')
    }
    let result = 0n
    for (let i = 0; i < this._bits; i++) {
      result |= BigInt((x >> i) & 1) << BigInt(3 * i)
      result |= BigInt((y >> i) & 1) << BigInt(3 * i + 1)
      result |= BigInt((z >> i) & 1) << BigInt(3 * i + 2)
    }
    return result
  }

  decode3D(code: bigint): Point3D {
    let x = 0n
    let y = 0n
    let z = 0n
    for (let i = 0; i < this._bits; i++) {
      x |= ((code >> BigInt(3 * i)) & 1n) << BigInt(i)
      y |= ((code >> BigInt(3 * i + 1)) & 1n) << BigInt(i)
      z |= ((code >> BigInt(3 * i + 2)) & 1n) << BigInt(i)
    }
    return { x: Number(x), y: Number(y), z: Number(z) }
  }

  encodeRange2D(x1: number, y1: number, x2: number, y2: number): bigint[] {
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)
    const codes: bigint[] = []
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        codes.push(this.encode2D(x, y))
      }
    }
    codes.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    return codes
  }

  queryRange2D(x1: number, y1: number, x2: number, y2: number): Point2D[] {
    const codes = this.encodeRange2D(x1, y1, x2, y2)
    return codes.map((code) => this.decode2D(code))
  }

  biggestPowerOf2(code: bigint): bigint {
    if (code <= 0n) return 1n
    let p = 1n
    while ((code & p) === 0n) {
      p <<= 1n
    }
    return p
  }

  coversRange(
    code: bigint,
    length: bigint,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): boolean {
    const start = this.decode2D(code)
    const end = this.decode2D(code + length - 1n)
    return start.x <= x1 && start.y <= y1 && end.x >= x2 && end.y >= y2
  }

  compare(a: bigint, b: bigint): number {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  get bits(): number {
    return this._bits
  }

  get dimensions(): 2 | 3 {
    return this._dimensions
  }
}

export type { ZOrderCurveOptions, Point2D, Point3D } from './types.js'
