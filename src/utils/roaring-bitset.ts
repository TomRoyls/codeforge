export class RoaringBitSet {
  private runs: Map<number, Uint16Array>
  private _size = 0

  constructor() {
    this.runs = new Map()
  }

  static from(indices: Iterable<number>): RoaringBitSet {
    const bs = new RoaringBitSet()
    for (const i of indices) bs.add(i)
    return bs
  }

  static fromRange(start: number, end: number): RoaringBitSet {
    const bs = new RoaringBitSet()
    bs.addRange(start, end)
    return bs
  }

  add(value: number): void {
    if (value < 0 || value > 0xFFFFFFFF) return
    const bucket = value >>> 16
    const offset = value & 0xFFFF
    const existing = this.runs.get(bucket)
    if (existing) {
      if (this.setBit(existing, offset)) this._size++
    } else {
      const arr = new Uint16Array(4096)
      const wordIdx = offset >>> 4
      const bitIdx = offset & 0xF
      arr[wordIdx] = 1 << bitIdx
      this.runs.set(bucket, arr)
      this._size++
    }
  }

  addRange(start: number, end: number): void {
    for (let i = start; i <= end; i++) {
      this.add(i)
    }
  }

  has(value: number): boolean {
    if (value < 0 || value > 0xFFFFFFFF) return false
    const bucket = value >>> 16
    const offset = value & 0xFFFF
    const arr = this.runs.get(bucket)
    if (!arr) return false
    return this.getBit(arr, offset)
  }

  delete(value: number): boolean {
    if (value < 0 || value > 0xFFFFFFFF) return false
    const bucket = value >>> 16
    const offset = value & 0xFFFF
    const arr = this.runs.get(bucket)
    if (!arr) return false
    if (this.clearBit(arr, offset)) {
      this._size--
      return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  and(other: RoaringBitSet): RoaringBitSet {
    const result = new RoaringBitSet()
    for (const [bucket, arr] of this.runs) {
      const otherArr = other.runs.get(bucket)
      if (!otherArr) continue
      const out = new Uint16Array(4096)
      let changed = false
      for (let i = 0; i < 4096; i++) {
        out[i] = arr[i]! & otherArr[i]!
        if (out[i]) changed = true
      }
      if (changed) {
        result.runs.set(bucket, out)
        result._size += this.popcountArray(out)
      }
    }
    return result
  }

  or(other: RoaringBitSet): RoaringBitSet {
    const result = new RoaringBitSet()
    const allBuckets = new Set([...this.runs.keys(), ...other.runs.keys()])
    for (const bucket of allBuckets) {
      const a = this.runs.get(bucket)
      const b = other.runs.get(bucket)
      const out = new Uint16Array(4096)
      for (let i = 0; i < 4096; i++) {
        out[i] = (a?.[i] ?? 0) | (b?.[i] ?? 0)
      }
      result.runs.set(bucket, out)
      result._size += this.popcountArray(out)
    }
    return result
  }

  xor(other: RoaringBitSet): RoaringBitSet {
    const result = new RoaringBitSet()
    const allBuckets = new Set([...this.runs.keys(), ...other.runs.keys()])
    for (const bucket of allBuckets) {
      const a = this.runs.get(bucket)
      const b = other.runs.get(bucket)
      const out = new Uint16Array(4096)
      for (let i = 0; i < 4096; i++) {
        out[i] = (a?.[i] ?? 0) ^ (b?.[i] ?? 0)
      }
      const count = this.popcountArray(out)
      if (count > 0) {
        result.runs.set(bucket, out)
        result._size += count
      }
    }
    return result
  }

  andNot(other: RoaringBitSet): RoaringBitSet {
    const result = new RoaringBitSet()
    for (const [bucket, arr] of this.runs) {
      const otherArr = other.runs.get(bucket)
      const out = new Uint16Array(4096)
      for (let i = 0; i < 4096; i++) {
        out[i] = arr[i]! & ~(otherArr?.[i] ?? 0)
      }
      const count = this.popcountArray(out)
      if (count > 0) {
        result.runs.set(bucket, out)
        result._size += count
      }
    }
    return result
  }

  forEach(callback: (value: number) => void): void {
    for (const [bucket, arr] of this.runs) {
      const base = bucket << 16
      for (let i = 0; i < 4096; i++) {
        let word = arr[i]!
        let bit = 0
        while (word) {
          if (word & 1) callback(base + (i << 4) + bit)
          word >>>= 1
          bit++
        }
      }
    }
  }

  toArray(): number[] {
    const result: number[] = []
    this.forEach((v) => result.push(v))
    return result
  }

  get min(): number | undefined {
    if (this._size === 0) return undefined
    for (const [bucket, arr] of this.runs) {
      const base = bucket << 16
      for (let i = 0; i < 4096; i++) {
        if (arr[i]!) {
          const _bit = 15 - Math.clz32(arr[i]!) + 16 - 32
          return base + (i << 4) + this.lowestBit(arr[i]!)
        }
      }
    }
    return undefined
  }

  get max(): number | undefined {
    if (this._size === 0) return undefined
    let lastBucket = 0
    let lastArr: Uint16Array | undefined
    for (const [bucket, arr] of this.runs) {
      lastBucket = bucket
      lastArr = arr
    }
    if (!lastArr) return undefined
    const base = lastBucket << 16
    for (let i = 4095; i >= 0; i--) {
      if (lastArr[i]!) {
        return base + (i << 4) + this.highestBit(lastArr[i]!)
      }
    }
    return undefined
  }

  clear(): void {
    this.runs.clear()
    this._size = 0
  }

  private setBit(arr: Uint16Array, offset: number): boolean {
    const wordIdx = offset >>> 4
    const bitIdx = offset & 0xF
    const mask = 1 << bitIdx
    if (arr[wordIdx]! & mask) return false
    arr[wordIdx] |= mask
    return true
  }

  private clearBit(arr: Uint16Array, offset: number): boolean {
    const wordIdx = offset >>> 4
    const bitIdx = offset & 0xF
    const mask = 1 << bitIdx
    if (!(arr[wordIdx]! & mask)) return false
    arr[wordIdx] &= ~mask
    return true
  }

  private getBit(arr: Uint16Array, offset: number): boolean {
    const wordIdx = offset >>> 4
    const bitIdx = offset & 0xF
    return (arr[wordIdx]! & (1 << bitIdx)) !== 0
  }

  private popcountArray(arr: Uint16Array): number {
    let count = 0
    for (let i = 0; i < arr.length; i++) {
      count += this.popcount(arr[i]!)
    }
    return count
  }

  private popcount(n: number): number {
    let c = 0
    while (n) {
      c += n & 1
      n >>>= 1
    }
    return c
  }

  private lowestBit(n: number): number {
    let bit = 0
    while (!(n & 1)) {
      n >>>= 1
      bit++
    }
    return bit
  }

  private highestBit(n: number): number {
    let bit = 15
    while (!(n & (1 << 15))) {
      n <<= 1
      bit--
    }
    return bit
  }
}
