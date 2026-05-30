export interface BloomFilterOptions {
  expectedItems: number
  falsePositiveRate: number
}

export class BloomFilter {
  private bits: Uint8Array
  private hashCount: number
  private _size: number = 0

  constructor(options: BloomFilterOptions) {
    const bitCount = Math.ceil(
      -(options.expectedItems * Math.log(options.falsePositiveRate)) / (Math.LN2 * Math.LN2),
    )
    const byteCount = Math.ceil(bitCount / 8)
    this.bits = new Uint8Array(byteCount)
    this.hashCount = Math.ceil((bitCount / options.expectedItems) * Math.LN2)
  }

  add(item: string): void {
    const hashes = this.getHashes(item)
    for (const hash of hashes) {
      const bitIndex = hash % (this.bits.length * 8)
      const byteIndex = Math.floor(bitIndex / 8)
      const bitOffset = bitIndex % 8
      this.bits[byteIndex] = this.bits[byteIndex]! | (1 << bitOffset)
    }
    this._size++
  }

  mightContain(item: string): boolean {
    const hashes = this.getHashes(item)
    for (const hash of hashes) {
      const bitIndex = hash % (this.bits.length * 8)
      const byteIndex = Math.floor(bitIndex / 8)
      const bitOffset = bitIndex % 8
      if ((this.bits[byteIndex]! & (1 << bitOffset)) === 0) {
        return false
      }
    }
    return true
  }

  private getHashes(item: string): number[] {
    const result: number[] = []
    const str = item
    let hash1 = 0
    for (let i = 0; i < str.length; i++) {
      hash1 = ((hash1 << 5) - hash1 + str.charCodeAt(i)) | 0
    }
    let hash2 = 0
    for (let i = str.length - 1; i >= 0; i--) {
      hash2 = ((hash2 << 5) - hash2 + str.charCodeAt(i)) | 0
    }
    for (let i = 0; i < this.hashCount; i++) {
      result.push(Math.abs(hash1 + i * hash2))
    }
    return result
  }

  get size(): number {
    return this._size
  }

  get bitCount(): number {
    return this.bits.length * 8
  }

  getHashFunctionCount(): number {
    return this.hashCount
  }

  clear(): void {
    this.bits.fill(0)
    this._size = 0
  }

  getEstimatedFalsePositiveRate(): number {
    if (this._size === 0) return 0
    const k = this.hashCount
    const m = this.bitCount
    const n = this._size
    return Math.pow(1 - Math.exp(-(k * n) / m), k)
  }
}
