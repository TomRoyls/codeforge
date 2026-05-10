import type { ReservoirSamplerOptions } from './types.js'

function createRng(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class ReservoirSampler<T> {
  private reservoir: T[] = []
  private processedCount = 0
  private readonly k: number
  private rng: () => number

  constructor(reservoirSize: number, seed?: number) {
    if (reservoirSize < 0) {
      throw new RangeError('reservoirSize must be non-negative')
    }
    this.k = reservoirSize
    this.rng = createRng(seed ?? ((Math.random() * 2147483647) | 0))
  }

  static fromOptions<T>(options: ReservoirSamplerOptions): ReservoirSampler<T> {
    return new ReservoirSampler<T>(options.reservoirSize, options.seed)
  }

  add(item: T): void {
    this.processedCount++
    if (this.reservoir.length < this.k) {
      this.reservoir.push(item)
    } else if (this.k > 0) {
      const j = Math.floor(this.rng() * this.processedCount)
      if (j < this.k) {
        this.reservoir[j] = item
      }
    }
  }

  get sample(): T[] {
    return [...this.reservoir]
  }

  get size(): number {
    return this.processedCount
  }

  get capacity(): number {
    return this.k
  }

  get isFull(): boolean {
    return this.processedCount >= this.k
  }

  get samples(): number {
    return this.processedCount
  }

  reset(): void {
    this.reservoir = []
    this.processedCount = 0
  }

  contains(item: T): boolean {
    for (const x of this.reservoir) {
      if (Object.is(x, item)) return true
    }
    return false
  }

  frequency(item: T): number {
    let count = 0
    for (const x of this.reservoir) {
      if (Object.is(x, item)) count++
    }
    return count
  }

  setSeed(seed: number): void {
    this.rng = createRng(seed)
  }

  addMany(items: Iterable<T>): void {
    for (const item of items) {
      this.add(item)
    }
  }

  merge(other: ReservoirSampler<T>): void {
    const otherSample = other.sample
    for (const item of otherSample) {
      this.add(item)
    }
  }
}
