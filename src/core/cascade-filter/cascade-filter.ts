import type { CascadeFilterOptions, CascadeFilterStatistics, CascadeFilterJSON } from './types.js'
import { DEFAULT_CASCADE_FILTER_OPTIONS } from './types.js'

interface BloomLayer {
  counters: Uint16Array
  bitCount: number
  hashCount: number
}

export class CascadeFilter<T = string> {
  private _layers: BloomLayer[]
  private _expectedItems: number
  private _falsePositiveRate: number
  private _numLayers: number
  private _size: number = 0
  private _stats: CascadeFilterStatistics

  constructor(options?: CascadeFilterOptions) {
    const opts = { ...DEFAULT_CASCADE_FILTER_OPTIONS, ...options }
    this._expectedItems = opts.expectedItems
    this._falsePositiveRate = opts.falsePositiveRate
    this._numLayers = opts.layers
    this._layers = this.createLayers()
    this._stats = {
      adds: 0,
      lookups: 0,
      removals: 0,
      layerHits: new Array<number>(this._numLayers).fill(0),
      totalChecks: 0,
      falsePositiveEstimate: 0,
    }
  }

  private createLayers(): BloomLayer[] {
    const totalBits = this.calculateTotalBits(this._expectedItems, this._falsePositiveRate)
    const layers: BloomLayer[] = []
    let scaleSum = 0
    for (let i = 0; i < this._numLayers; i++) {
      scaleSum += Math.pow(2, i)
    }
    for (let i = 0; i < this._numLayers; i++) {
      const bitCount = Math.max(64, Math.ceil(totalBits * Math.pow(2, i) / scaleSum))
      const hashCount = Math.max(1, Math.round((bitCount / this._expectedItems) * Math.LN2))
      const counters = new Uint16Array(bitCount)
      layers.push({ counters, bitCount, hashCount })
    }
    return layers
  }

  private calculateTotalBits(expectedItems: number, fpr: number): number {
    return Math.ceil(-(expectedItems * Math.log(fpr)) / (Math.LN2 * Math.LN2))
  }

  add(item: T): void {
    const key = this.serialize(item)
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      const positions = this.getPositions(key, layer, i)
      for (const pos of positions) {
        layer.counters[pos] = Math.min(layer.counters[pos]! + 1, 65535)
      }
    }
    this._size++
    this._stats.adds++
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    this._stats.lookups++
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      const positions = this.getPositions(key, layer, i)
      this._stats.totalChecks++
      let allSet = true
      for (const pos of positions) {
        if (layer.counters[pos]! === 0) {
          allSet = false
          break
        }
      }
      if (allSet) {
        this._stats.layerHits[i] = this._stats.layerHits[i]! + 1
      } else {
        return false
      }
    }
    this._stats.falsePositiveEstimate = this.expectedFalsePositiveRate()
    return true
  }

  remove(item: T): boolean {
    const key = this.serialize(item)
    if (!this.checkInternal(key)) {
      this._stats.removals++
      return false
    }
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      const positions = this.getPositions(key, layer, i)
      for (const pos of positions) {
        const val = layer.counters[pos]!
        if (val > 0) {
          layer.counters[pos] = val - 1
        }
      }
    }
    this._size--
    this._stats.removals++
    return true
  }

  private checkInternal(key: string): boolean {
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      const positions = this.getPositions(key, layer, i)
      for (const pos of positions) {
        if (layer.counters[pos]! === 0) {
          return false
        }
      }
    }
    return true
  }

  clear(): void {
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      layer.counters.fill(0)
    }
    this._size = 0
    this._stats = {
      adds: 0,
      lookups: 0,
      removals: 0,
      layerHits: new Array<number>(this._numLayers).fill(0),
      totalChecks: 0,
      falsePositiveEstimate: 0,
    }
  }

  estimatedFillRatio(): number {
    let totalSet = 0
    let totalBits = 0
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      for (let j = 0; j < layer.bitCount; j++) {
        if (layer.counters[j]! > 0) {
          totalSet++
        }
      }
      totalBits += layer.bitCount
    }
    return totalBits > 0 ? totalSet / totalBits : 0
  }

  expectedFalsePositiveRate(): number {
    if (this._size === 0) return 0
    let combinedRate = 1
    for (let i = 0; i < this._numLayers; i++) {
      const layer = this._layers[i]!
      const k = layer.hashCount
      const m = layer.bitCount
      const n = this._size
      const layerRate = Math.pow(1 - Math.exp((-k * n) / m), k)
      combinedRate *= layerRate
    }
    return combinedRate
  }

  layerCount(): number {
    return this._numLayers
  }

  capacity(): number {
    return this._expectedItems
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  optimize(): { currentFillRatio: number; currentFalsePositiveRate: number; recommendedExpectedItems: number; recommendedLayers: number; estimatedSpaceEfficiency: number } {
    const currentFill = this.estimatedFillRatio()
    const currentFPR = this.expectedFalsePositiveRate()
    const recommendedItems = this._size > 0
      ? Math.max(this._expectedItems, Math.ceil(this._size * 1.5))
      : this._expectedItems
    const recommendedLayers = currentFPR > this._falsePositiveRate
      ? this._numLayers + 1
      : this._numLayers
    const usedBits = this._layers.reduce((sum, l) => sum + l.bitCount, 0)
    const optimalBits = this.calculateTotalBits(recommendedItems, this._falsePositiveRate)
    const spaceEfficiency = optimalBits > 0 ? usedBits / optimalBits : 1
    return {
      currentFillRatio: currentFill,
      currentFalsePositiveRate: currentFPR,
      recommendedExpectedItems: recommendedItems,
      recommendedLayers,
      estimatedSpaceEfficiency: spaceEfficiency,
    }
  }

  toJSON(): CascadeFilterJSON {
    return {
      layers: this._layers.map((layer) => ({
        counters: Array.from(layer.counters),
        bitCount: layer.bitCount,
        hashCount: layer.hashCount,
      })),
      expectedItems: this._expectedItems,
      falsePositiveRate: this._falsePositiveRate,
      layerCount: this._numLayers,
      itemCount: this._size,
      statistics: {
        adds: this._stats.adds,
        lookups: this._stats.lookups,
        removals: this._stats.removals,
        layerHits: [...this._stats.layerHits],
        totalChecks: this._stats.totalChecks,
        falsePositiveEstimate: this._stats.falsePositiveEstimate,
      },
    }
  }

  static fromJSON<T = string>(data: CascadeFilterJSON): CascadeFilter<T> {
    const filter = new CascadeFilter<T>({
      expectedItems: data.expectedItems,
      falsePositiveRate: data.falsePositiveRate,
      layers: data.layerCount,
    })
    filter._layers = data.layers.map((layerData) => ({
      counters: new Uint16Array(layerData.counters),
      bitCount: layerData.bitCount,
      hashCount: layerData.hashCount,
    }))
    filter._size = data.itemCount
    filter._stats = {
      adds: data.statistics.adds,
      lookups: data.statistics.lookups,
      removals: data.statistics.removals,
      layerHits: [...data.statistics.layerHits],
      totalChecks: data.statistics.totalChecks,
      falsePositiveEstimate: data.statistics.falsePositiveEstimate,
    }
    return filter
  }

  getStatistics(): CascadeFilterStatistics {
    return {
      adds: this._stats.adds,
      lookups: this._stats.lookups,
      removals: this._stats.removals,
      layerHits: [...this._stats.layerHits],
      totalChecks: this._stats.totalChecks,
      falsePositiveEstimate: this.expectedFalsePositiveRate(),
    }
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }

  private getPositions(key: string, layer: BloomLayer, layerIndex: number): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, (layerIndex + 1) * 0x9e3779b9)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < layer.hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % layer.bitCount)
    }
    return positions
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }
}

export { DEFAULT_CASCADE_FILTER_OPTIONS } from './types.js'
export type { CascadeFilterOptions, CascadeFilterJSON, CascadeFilterStatistics } from './types.js'
