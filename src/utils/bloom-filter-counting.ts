export class BloomFilterCounting {
  private counts: number[]
  private size: number
  private numHashes: number

  constructor(size = 1000, numHashes = 3) {
    this.size = size
    this.numHashes = numHashes
    this.counts = new Array(size).fill(0)
  }

  add(item: string): void {
    for (const idx of this.getIndices(item)) {
      this.counts[idx]++
    }
  }

  remove(item: string): boolean {
    if (!this.has(item)) return false
    for (const idx of this.getIndices(item)) {
      this.counts[idx] = Math.max(0, this.counts[idx]! - 1)
    }
    return true
  }

  has(item: string): boolean {
    for (const idx of this.getIndices(item)) {
      if (this.counts[idx] === 0) return false
    }
    return true
  }

  count(item: string): number {
    let min = Infinity
    for (const idx of this.getIndices(item)) {
      if (this.counts[idx]! < min) min = this.counts[idx]!
    }
    return min === Infinity ? 0 : min
  }

  get totalAdds(): number {
    return this.counts.reduce((a, b) => a + b, 0)
  }

  get isEmpty(): boolean { return this.counts.every((c) => c === 0) }

  clear(): void { this.counts.fill(0) }

  toArray(): number[] { return [...this.counts] }
  toString(): string { return JSON.stringify({ size: this.size, hashes: this.numHashes }) }
  toJSON(): Record<string, number> { return { size: this.size, hashes: this.numHashes } }

  clone(): BloomFilterCounting {
    const c = new BloomFilterCounting(this.size, this.numHashes)
    c.counts = [...this.counts]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BloomFilterCounting)) return false
    return this.size === other.size
  }

  private getIndices(item: string): number[] {
    const indices: number[] = []
    let hash = this.hash(item)
    for (let i = 0; i < this.numHashes; i++) {
      indices.push(hash % this.size)
      hash = (hash * 31 + i) >>> 0
    }
    return indices
  }

  private hash(s: string): number {
    let h = 5381
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
    }
    return h
  }
}
