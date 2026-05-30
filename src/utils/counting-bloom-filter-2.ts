export class CountingBloomFilter2 {
  private readonly counters: Uint32Array
  private readonly _capacity: number
  private readonly _filterSize: number
  private readonly _hashCount: number
  private _estimatedCount: number = 0

  constructor(expectedItems: number, falsePositiveRate: number = 0.01) {
    if (expectedItems < 1) {
      throw new RangeError(`Expected items must be >= 1, got ${expectedItems}`)
    }
    if (falsePositiveRate <= 0 || falsePositiveRate >= 1) {
      throw new RangeError(`False positive rate must be in (0, 1), got ${falsePositiveRate}`)
    }

    this._capacity = expectedItems

    const optimalSize = Math.ceil(
      -(expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2)
    )
    this._filterSize = Math.max(64, optimalSize)

    this._hashCount = Math.max(1, Math.round((this._filterSize / expectedItems) * Math.LN2))

    this.counters = new Uint32Array(this._filterSize)
  }

  add(item: string): void {
    const positions = this.getHashPositions(item)
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]!
      if (this.counters[pos]! < 4294967295) {
        this.counters[pos]!++
      }
    }
    this._estimatedCount++
  }

  remove(item: string): boolean {
    const positions = this.getHashPositions(item)
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]!
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]!
      this.counters[pos]!--
    }
    this._estimatedCount--
    return true
  }

  contains(item: string): boolean {
    const positions = this.getHashPositions(item)
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]!
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    return true
  }

  count(item: string): number {
    const positions = this.getHashPositions(item)
    let minCount = Number.MAX_VALUE
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]!
      const counterValue = this.counters[pos]!
      if (counterValue < minCount) {
        minCount = counterValue
      }
    }
    return minCount === Number.MAX_VALUE ? 0 : minCount
  }

  get capacity(): number {
    return this._capacity
  }

  get filterSize(): number {
    return this._filterSize
  }

  get hashCount(): number {
    return this._hashCount
  }

  get estimatedCount(): number {
    return this._estimatedCount
  }

  clear(): void {
    this.counters.fill(0)
    this._estimatedCount = 0
  }

  private getHashPositions(item: string): number[] {
    const positions: number[] = []
    const h1 = this.computeHash(item, 0)
    const h2 = this.computeHash(item, h1)
    for (let i = 0; i < this._hashCount; i++) {
      const combinedHash = (h1 + i * h2) >>> 0
      positions.push(combinedHash % this._filterSize)
    }
    return positions
  }

  private computeHash(str: string, seed: number): number {
    let hash = seed
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)!
      hash = Math.imul(hash ^ char, 2654435761)
      hash = (hash ^ (hash >>> 16)) >>> 0
    }
    return hash
  }
}