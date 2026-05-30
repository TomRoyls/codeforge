export class ApproximateSet {
  private bits: Uint8Array
  private readonly size: number
  private readonly hashCount: number
  private _count: number = 0

  constructor(expectedItems: number = 1000, falsePositiveRate: number = 0.01) {
    const ln2 = 0.6931471805599453
    const size = Math.ceil(-expectedItems * Math.log(falsePositiveRate) / (ln2 * ln2))
    this.size = Math.max(size, 64)
    this.hashCount = Math.max(1, Math.round((this.size / expectedItems) * ln2))
    this.bits = new Uint8Array(Math.ceil(this.size / 8))
  }

  add(value: string): void {
    const hashes = this.getHashes(value)
    for (const h of hashes) {
      const bitIndex = h % this.size
      const byteIndex = bitIndex >>> 3
      const bitOffset = bitIndex & 7
      this.bits[byteIndex] = this.bits[byteIndex]! | (1 << bitOffset)
    }
    this._count++
  }

  has(value: string): boolean {
    const hashes = this.getHashes(value)
    for (const h of hashes) {
      const bitIndex = h % this.size
      const byteIndex = bitIndex >>> 3
      const bitOffset = bitIndex & 7
      if (!(this.bits[byteIndex]! & (1 << bitOffset))) return false
    }
    return true
  }

  get estimatedFalsePositiveRate(): number {
    let setBits = 0
    for (const byte of this.bits) {
      let b = byte
      while (b) {
        setBits += b & 1
        b >>>= 1
      }
    }
    return Math.pow(setBits / this.size, this.hashCount)
  }

  get count(): number {
    return this._count
  }

  get bitSize(): number {
    return this.size
  }

  private getHashes(value: string): number[] {
    const h1 = this.hash1(value)
    const h2 = this.hash2(value)
    const result: number[] = []
    for (let i = 0; i < this.hashCount; i++) {
      result.push(Math.abs(h1 + i * h2) >>> 0)
    }
    return result
  }

  private hash1(s: string): number {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  private hash2(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0
    }
    return h >>> 0
  }
}
