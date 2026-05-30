export class BloomFilter3 {
  private partitions: Array<Uint8Array> = []
  private partitionCapacities: number[] = []
  private partitionHashCounts: number[] = []
  private partitionSizes: number[] = []
  private partitionErrorRates: number[] = []
  private _totalAdded: number = 0

  private readonly initialCapacity: number
  private readonly baseErrorRate: number
  private readonly maxFillRatio: number

  constructor(options: {
    initialCapacity?: number
    errorRate?: number
    maxFillRatio?: number
  } = {}) {
    const { initialCapacity = 1000, errorRate = 0.01, maxFillRatio = 0.6 } = options

    if (initialCapacity < 1) {
      throw new RangeError(`Initial capacity must be >= 1, got ${initialCapacity}`)
    }
    if (errorRate <= 0 || errorRate >= 1) {
      throw new RangeError(`Error rate must be in (0, 1), got ${errorRate}`)
    }
    if (maxFillRatio <= 0 || maxFillRatio >= 1) {
      throw new RangeError(`Max fill ratio must be in (0, 1), got ${maxFillRatio}`)
    }

    this.initialCapacity = initialCapacity
    this.baseErrorRate = errorRate
    this.maxFillRatio = maxFillRatio

    this.addPartition(0)
  }

  add(item: string): void {
    if (this.getCurrentFillRatio() > this.maxFillRatio) {
      this.addPartition(this.partitions.length)
    }

    const currentPartitionIndex = this.partitions.length - 1
    const positions = this.getHashPositions(item, currentPartitionIndex)

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]!
      const partition = this.partitions[currentPartitionIndex]!
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      partition[byteIndex]! |= 1 << bitIndex
    }

    this._totalAdded++
  }

  has(item: string): boolean {
    for (let p = 0; p < this.partitions.length; p++) {
      const positions = this.getHashPositions(item, p)
      let allSet = true

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]!
        const partition = this.partitions[p]!
        const byteIndex = Math.floor(pos / 8)
        const bitIndex = pos % 8
        if ((partition[byteIndex]! & (1 << bitIndex)) === 0) {
          allSet = false
          break
        }
      }

      if (allSet) {
        return true
      }
    }

    return false
  }

  get capacity(): number {
    return this.partitionCapacities.reduce((sum, cap) => sum + cap, 0)
  }

  get partitionCount(): number {
    return this.partitions.length
  }

  get estimatedSize(): number {
    return this._totalAdded
  }

  get fillRatio(): number {
    return this.getCurrentFillRatio()
  }

  clear(): void {
    this.partitions = []
    this.partitionCapacities = []
    this.partitionHashCounts = []
    this.partitionSizes = []
    this.partitionErrorRates = []
    this._totalAdded = 0
    this.addPartition(0)
  }

  private addPartition(partitionIndex: number): void {
    const errorRate = this.baseErrorRate * Math.pow(0.5, partitionIndex)
    const capacity = this.initialCapacity * Math.pow(2, partitionIndex)

    const filterSize = Math.max(
      64,
      Math.ceil(-(capacity * Math.log(errorRate)) / (Math.LN2 * Math.LN2))
    )
    const hashCount = Math.max(1, Math.round((filterSize / capacity) * Math.LN2))

    this.partitionSizes.push(filterSize)
    this.partitionHashCounts.push(hashCount)
    this.partitionCapacities.push(capacity)
    this.partitionErrorRates.push(errorRate)

    const byteCount = Math.ceil(filterSize / 8)
    this.partitions.push(new Uint8Array(byteCount))
  }

  private getCurrentFillRatio(): number {
    if (this.partitions.length === 0) {
      return 0
    }

    const currentPartitionIndex = this.partitions.length - 1
    const partition = this.partitions[currentPartitionIndex]!
    const filterSize = this.partitionSizes[currentPartitionIndex]!

    let setBits = 0
    for (let i = 0; i < partition.length; i++) {
      const byte = partition[i]!
      setBits += this.countSetBits(byte)
    }

    return setBits / filterSize
  }

  private countSetBits(byte: number): number {
    let count = 0
    let temp = byte
    while (temp > 0) {
      count += temp & 1
      temp >>>= 1
    }
    return count
  }

  private getHashPositions(item: string, partitionIndex: number): number[] {
    const positions: number[] = []
    const hashCount = this.partitionHashCounts[partitionIndex]!
    const filterSize = this.partitionSizes[partitionIndex]!

    const h1 = this.computeHash(item, 0, partitionIndex)
    const h2 = this.computeHash(item, h1, partitionIndex)

    for (let i = 0; i < hashCount; i++) {
      const combinedHash = (h1 + i * h2) >>> 0
      positions.push(combinedHash % filterSize)
    }

    return positions
  }

  private computeHash(str: string, seed: number, partitionIndex: number): number {
    let hash = seed ^ partitionIndex
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)!
      hash = Math.imul(hash ^ char, 2654435761)
      hash = (hash ^ (hash >>> 16)) >>> 0
    }
    return hash
  }
}