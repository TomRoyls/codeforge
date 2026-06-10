import type { ZOrderMapOptions, ZOrderEntry, Point2D } from './types.js'

export class ZOrderMap<T> {
  private _bits: number
  private _map: Map<bigint, T>
  private _coords: Map<bigint, Point2D>

  constructor(options?: ZOrderMapOptions) {
    this._bits = options?.bits ?? 16
    this._map = new Map()
    this._coords = new Map()
  }

  encode(x: number, y: number): bigint {
    if (x < 0 || y < 0) {
      throw new Error('Coordinates must be non-negative')
    }
    const maxVal = this._bits >= 31 ? Number.MAX_SAFE_INTEGER : (1 << this._bits) - 1
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

  decode(mortonCode: bigint): [number, number] {
    if (mortonCode < 0n) {
      throw new Error('Morton code must be non-negative')
    }
    let x = 0n
    let y = 0n
    for (let i = 0; i < this._bits; i++) {
      x |= ((mortonCode >> BigInt(2 * i)) & 1n) << BigInt(i)
      y |= ((mortonCode >> BigInt(2 * i + 1)) & 1n) << BigInt(i)
    }
    return [Number(x), Number(y)]
  }

  set(x: number, y: number, value: T): this {
    const code = this.encode(x, y)
    this._map.set(code, value)
    this._coords.set(code, { x, y })
    return this
  }

  get(x: number, y: number): T | undefined {
    const code = this.encode(x, y)
    return this._map.get(code)
  }

  has(x: number, y: number): boolean {
    const code = this.encode(x, y)
    return this._map.has(code)
  }

  delete(x: number, y: number): boolean {
    const code = this.encode(x, y)
    const deleted = this._map.delete(code)
    this._coords.delete(code)
    return deleted
  }

  get size(): number {
    return this._map.size
  }

  get isEmpty(): boolean {
    return this._map.size === 0
  }

  clear(): void {
    this._map.clear()
    this._coords.clear()
  }

  *keys(): IterableIterator<Point2D> {
    for (const code of this._map.keys()) {
      const coord = this._coords.get(code)
      if (coord) {
        yield { x: coord.x, y: coord.y }
      }
    }
  }

  *values(): IterableIterator<T> {
    yield* this._map.values()
  }

  *entries(): IterableIterator<[Point2D, T]> {
    for (const [code, value] of this._map.entries()) {
      const coord = this._coords.get(code)
      if (coord) {
        yield [{ x: coord.x, y: coord.y }, value]
      }
    }
  }

  forEach(callback: (value: T, key: Point2D, map: ZOrderMap<T>) => void): void {
    for (const [code, value] of this._map.entries()) {
      const coord = this._coords.get(code)
      if (coord) {
        callback(value, { x: coord.x, y: coord.y }, this)
      }
    }
  }

  *[Symbol.iterator](): IterableIterator<[Point2D, T]> {
    yield* this.entries()
  }

  clone(): ZOrderMap<T> {
    const result = new ZOrderMap<T>({ bits: this._bits })
    for (const [code, value] of this._map.entries()) {
      result._map.set(code, value)
      const coord = this._coords.get(code)
      if (coord) {
        result._coords.set(code, { x: coord.x, y: coord.y })
      }
    }
    return result
  }

  static fromEntries<T>(
    entries: Iterable<ZOrderEntry<T>>,
    options?: ZOrderMapOptions,
  ): ZOrderMap<T> {
    const map = new ZOrderMap<T>(options)
    for (const entry of entries) {
      map.set(entry.x, entry.y, entry.value)
    }
    return map
  }

  rangeQuery(minX: number, minY: number, maxX: number, maxY: number): ZOrderEntry<T>[] {
    const results: ZOrderEntry<T>[] = []
    const lo = Math.min(minX, maxX)
    const hiX = Math.max(minX, maxX)
    const loY = Math.min(minY, maxY)
    const hiY = Math.max(minY, maxY)

    const mortonMin = this.encode(lo, loY)
    const mortonMax = this.encode(hiX, hiY)

    for (const [code, value] of this._map.entries()) {
      if (code < mortonMin || code > mortonMax) continue
      const coord = this._coords.get(code)
      if (coord && coord.x >= lo && coord.x <= hiX && coord.y >= loY && coord.y <= hiY) {
        results.push({ x: coord.x, y: coord.y, value })
      }
    }

    return results
  }

  nearestNeighbor(x: number, y: number): Point2D | undefined {
    if (this._map.size === 0) return undefined

    let bestDist = Infinity
    let bestPoint: Point2D | undefined

    for (const [code] of this._map.entries()) {
      const coord = this._coords.get(code)
      if (coord) {
        const dx = coord.x - x
        const dy = coord.y - y
        const dist = dx * dx + dy * dy
        if (dist < bestDist) {
          bestDist = dist
          bestPoint = { x: coord.x, y: coord.y }
        }
      }
    }

    return bestPoint
  }

  containsPoint(x: number, y: number): boolean {
    return this.has(x, y)
  }

  toSortedArray(): ZOrderEntry<T>[] {
    const entries: ZOrderEntry<T>[] = []
    for (const [code, value] of this._map.entries()) {
      const coord = this._coords.get(code)
      if (coord) {
        entries.push({ x: coord.x, y: coord.y, value })
      }
    }
    entries.sort((a, b) => {
      const codeA = this.encode(a.x, a.y)
      const codeB = this.encode(b.x, b.y)
      if (codeA < codeB) return -1
      if (codeA > codeB) return 1
      return 0
    })
    return entries
  }

  get bits(): number {
    return this._bits
  }

toArray() {
    return this.entries()
  }

  toJSON() {
    return { type: 'ZOrderMap', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `ZOrderMap({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'ZOrderMap'
  }

  nonEmpty(): boolean {
    return !this.isEmpty
  }
}

export type { ZOrderMapOptions, ZOrderEntry, Point2D 
 
} from './types.js'
