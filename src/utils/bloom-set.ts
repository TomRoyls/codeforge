export class BloomSet {
  private bits: Uint8Array
  private numHashes: number
  private size: number

  constructor(bitSize = 1024, numHashes = 3) {
    this.bits = new Uint8Array(bitSize)
    this.numHashes = numHashes
    this.size = 0
  }

  add(item: string): void {
    const hashes = this.getHashes(item)
    for (const h of hashes) {
      this.bits[h % this.bits.length] = 1
    }
    this.size++
  }

  has(item: string): boolean {
    const hashes = this.getHashes(item)
    return hashes.every((h) => this.bits[h % this.bits.length] === 1)
  }

  get count(): number {
    return this.size
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  get fillRatio(): number {
    let set = 0
    for (const b of this.bits) if (b === 1) set++
    return set / this.bits.length
  }

  clear(): void {
    this.bits.fill(0)
    this.size = 0
  }

  toArray(): number[] {
    return Array.from(this.bits)
  }

  toString(): string {
    return JSON.stringify({ size: this.size, bitSize: this.bits.length })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size, bitSize: this.bits.length, fillRatio: this.fillRatio }
  }

  clone(): BloomSet {
    const copy = new BloomSet(this.bits.length, this.numHashes)
    copy.bits = new Uint8Array(this.bits)
    copy.size = this.size
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BloomSet)) return false
    return this.size === other.size
  }

  private getHashes(item: string): number[] {
    const hashes: number[] = []
    for (let i = 0; i < this.numHashes; i++) {
      let hash = 5381 + i
      for (let j = 0; j < item.length; j++) {
        hash = ((hash << 5) + hash + item.charCodeAt(j)) | 0
      }
      hashes.push(Math.abs(hash))
    }
    return hashes
  }
}
