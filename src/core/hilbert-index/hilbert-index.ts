import type { HilbertIndexOptions, Point2D } from './types.js'

export class HilbertIndex {
  private _order: number

  constructor(options?: HilbertIndexOptions) {
    this._order = options?.order ?? 16
  }

  private static rot(n: number, x: number, y: number, rx: number, ry: number): [number, number] {
    if (ry === 0) {
      if (rx === 1) {
        x = n - 1 - x
        y = n - 1 - y
      }
      const tmp = x
      x = y
      y = tmp
    }
    return [x, y]
  }

  xy2d(x: number, y: number): number {
    if (x < 0 || y < 0) {
      throw new Error('Coordinates must be non-negative')
    }
    const n = 1 << this._order
    if (x >= n || y >= n) {
      throw new Error('Coordinates exceed order precision')
    }
    let d = 0
    let cx = y
    let cy = x
    for (let s = n >>> 1; s > 0; s >>>= 1) {
      const rx = (cx & s) !== 0 ? 1 : 0
      const ry = (cy & s) !== 0 ? 1 : 0
      d += s * s * ((3 * rx) ^ ry)
      const rotated = HilbertIndex.rot(n, cx, cy, rx, ry)
      cx = rotated[0]
      cy = rotated[1]
    }
    return d >>> 0
  }

  d2xy(d: number): Point2D {
    if (d < 0) {
      throw new Error('Distance must be non-negative')
    }
    const n = 1 << this._order
    const maxDist = n * n - 1
    if (d > maxDist) {
      throw new Error('Distance exceeds grid capacity')
    }
    let rx: number
    let ry: number
    let tx = 0
    let ty = 0
    let cd = d
    for (let s = 1; s < n; s <<= 1) {
      rx = 1 & (cd >>> 1)
      ry = 1 & (cd ^ rx)
      const rotated = HilbertIndex.rot(s, tx, ty, rx, ry)
      tx = rotated[0]
      ty = rotated[1]
      tx += s * rx
      ty += s * ry
      cd >>>= 2
    }
    return { x: ty, y: tx }
  }

  encode(x: number, y: number): number {
    return this.xy2d(x, y)
  }

  decode(d: number): Point2D {
    return this.d2xy(d)
  }

  encodeRange(x1: number, y1: number, x2: number, y2: number): number[] {
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)
    const codes: number[] = []
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        codes.push(this.xy2d(x, y))
      }
    }
    codes.sort((a, b) => a - b)
    return codes
  }

  isValidPoint(x: number, y: number): boolean {
    if (x < 0 || y < 0) return false
    const maxVal = (1 << this._order) - 1
    return x <= maxVal && y <= maxVal
  }

  isValidDistance(d: number): boolean {
    if (d < 0) return false
    const maxDist = (1 << (2 * this._order)) - 1
    return d <= maxDist
  }

  get order(): number {
    return this._order
  }

  get sideLength(): number {
    return 1 << this._order
  }

  get totalPoints(): number {
    return (1 << this._order) * (1 << this._order)
  }
}

export type { HilbertIndexOptions, Point2D } from './types.js'
