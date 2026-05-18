export interface CascadingBloomConfig {
  numFilters: number
  numBits: number
  numHashes: number
}

const DEFAULT_CONFIG: CascadingBloomConfig = {
  numFilters: 3,
  numBits: 1024,
  numHashes: 3,
}

export class CascadingBloom2 {
  private filters: Uint8Array[]
  private readonly config: CascadingBloomConfig
  private count: number

  constructor(config?: Partial<CascadingBloomConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.filters = []
    for (let i = 0; i < this.config.numFilters; i++) {
      this.filters.push(new Uint8Array(this.config.numBits))
    }
    this.count = 0
  }

  private hash(item: string, seed: number): number {
    let h = seed
    for (let i = 0; i < item.length; i++) {
      h = ((h << 5) - h + item.charCodeAt(i)) | 0
    }
    return Math.abs(h) % this.config.numBits
  }

  private getIndices(item: string, filterIdx: number): number[] {
    const indices: number[] = []
    for (let h = 0; h < this.config.numHashes; h++) {
      indices.push(this.hash(item, h + filterIdx * 100))
    }
    return indices
  }

  add(item: string): void {
    for (let i = 0; i < this.filters.length; i++) {
      const indices = this.getIndices(item, i)
      const allSet = indices.every(idx => this.filters[i]![idx!] === 1)
      if (!allSet) {
        for (const idx of indices) {
          this.filters[i]![idx!] = 1
        }
        if (i === 0) this.count++
        return
      }
    }
    const indices = this.getIndices(item, this.filters.length - 1)
    for (const idx of indices) {
      this.filters[this.filters.length - 1]![idx!] = 1
    }
    this.count++
  }

  mightContain(item: string): boolean {
    for (const filter of this.filters) {
      const indices = this.getIndices(item, this.filters.indexOf(filter))
      if (indices.every(idx => filter[idx!] === 1)) {
        return true
      }
    }
    return false
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  getFilterCount(): number {
    return this.filters.length
  }

  clear(): void {
    for (let i = 0; i < this.filters.length; i++) {
      this.filters[i] = new Uint8Array(this.config.numBits)
    }
    this.count = 0
  }

  getFillRatio(filterIndex: number): number {
    if (filterIndex < 0 || filterIndex >= this.filters.length) return 0
    let setBits = 0
    for (let i = 0; i < this.config.numBits; i++) {
      if (this.filters[filterIndex]![i] === 1) setBits++
    }
    return setBits / this.config.numBits
  }

  getConfig(): CascadingBloomConfig {
    return { ...this.config }
  }
}
