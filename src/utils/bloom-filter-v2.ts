export class BloomFilterV2 {
  private bits: Uint8Array
  private hashCount: number
  private count = 0

  constructor(size: number, hashCount = 3) {
    this.bits = new Uint8Array(size)
    this.hashCount = hashCount
  }

  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this.hash(item, i)
      this.bits[hash % this.bits.length] = 1
    }
    this.count++
  }

  mightContain(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this.hash(item, i)
      if (this.bits[hash % this.bits.length] === 0) return false
    }
    return true
  }

  private hash(item: string, seed: number): number {
    let h = seed * 31 + 7
    for (let i = 0; i < item.length; i++) {
      h = ((h << 5) - h + item.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  get size(): number { return this.bits.length }
  get itemCount(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }

  clear(): void { this.bits.fill(0); this.count = 0 }

  toArray(): number[] { return Array.from(this.bits) }
  toString(): string { return JSON.stringify({ size: this.size, hashes: this.hashCount, items: this.count }) }
  toJSON(): Record<string, number> { return { size: this.size, hashes: this.hashCount, items: this.count } }

  clone(): BloomFilterV2 {
    const c = new BloomFilterV2(this.bits.length, this.hashCount)
    c.bits = new Uint8Array(this.bits)
    c.count = this.count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BloomFilterV2)) return false
    return this.bits.length === other.bits.length && this.hashCount === other.hashCount
  }
}
