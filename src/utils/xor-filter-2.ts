export class XorFilter {
  private bits: Uint8Array
  private seeds: number[]
  private slotCount: number

  constructor(items: string[], private numHashes: number = 3) {
    this.slotCount = Math.max(items.length * 2, 12)
    this.bits = new Uint8Array(this.slotCount)
    this.seeds = Array.from({ length: numHashes }, (_, i) => (i + 1) * 1337)
    this.build(items)
  }

  has(item: string): boolean {
    const fp = this.fingerprint(item)
    let xorSum = 0
    for (let i = 0; i < this.numHashes; i++) {
      xorSum ^= this.bits[this.hash(item, i)]!
    }
    return xorSum === fp
  }

  private build(items: string[]): void {
    const xorSums = new Uint8Array(this.slotCount)
    for (const item of items) {
      const fp = this.fingerprint(item)
      for (let i = 0; i < this.numHashes; i++) {
        const idx = this.hash(item, i)
        xorSums[idx] = (xorSums[idx] ?? 0) ^ fp
      }
    }
    this.bits = xorSums
  }

  private fingerprint(item: string): number {
    let h = 0
    for (let i = 0; i < item.length; i++) {
      h = ((h << 5) - h + item.charCodeAt(i)) | 0
    }
    return (h & 0xFF) || 1
  }

  private hash(item: string, seedIndex: number): number {
    let h = this.seeds[seedIndex]!
    for (let i = 0; i < item.length; i++) {
      h = ((h << 5) - h + item.charCodeAt(i)) | 0
    }
    return ((h >>> 0) % this.slotCount + this.slotCount) % this.slotCount
  }
}
