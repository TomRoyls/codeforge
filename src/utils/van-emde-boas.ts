/** Van Emde Boas Tree - a priority queue with O(log log U) operations */

export class VanEmdeBoas {
  private readonly _universeSize: number
  private readonly halfBits: number
  private readonly lowerMask: number
  private readonly numClusters: number
  private readonly clusterSize: number
  private readonly cluster: (VanEmdeBoas | null)[]
  private readonly summary: VanEmdeBoas | null
  private _min: number | undefined
  private _max: number | undefined
  private _size: number

  constructor(universeSize: number) {
    if (universeSize < 2 || (universeSize & (universeSize - 1)) !== 0) {
      throw new RangeError(
        `universeSize must be a power of 2 >= 2, got ${universeSize}`,
      )
    }
    this._universeSize = universeSize
    this._size = 0

    if (universeSize === 2) {
      this.halfBits = 0
      this.lowerMask = 0
      this.numClusters = 0
      this.clusterSize = 0
      this.cluster = []
      this.summary = null
    } else {
      const bits = Math.log2(universeSize)
      this.halfBits = bits >>> 1
      this.clusterSize = 1 << this.halfBits
      this.lowerMask = this.clusterSize - 1
      this.numClusters = 1 << (bits - this.halfBits)
      this.cluster = new Array(this.numClusters).fill(null)
      this.summary = new VanEmdeBoas(this.numClusters)
    }

    this._min = undefined
    this._max = undefined
  }

  private high(x: number): number {
    return x >>> this.halfBits
  }

  private low(x: number): number {
    return x & this.lowerMask
  }

  private index(h: number, l: number): number {
    return (h << this.halfBits) | l
  }

  private clusterAt(i: number): VanEmdeBoas {
    if (!this.cluster[i]) {
      this.cluster[i] = new VanEmdeBoas(this.clusterSize)
    }
    return this.cluster[i]!
  }

  get universeSize(): number {
    return this._universeSize
  }

  get size(): number {
    return this._size
  }

  min(): number | undefined {
    return this._min
  }

  max(): number | undefined {
    return this._max
  }

  isEmpty(): boolean {
    return this._min === undefined
  }

  has(value: number): boolean {
    return this.contains(value)
  }

  contains(value: number): boolean {
    if (value < 0 || value >= this._universeSize) return false
    if (this._min === undefined) return false
    if (value === this._min) return true
    if (this._universeSize === 2) return value === this._max
    const h = this.high(value)
    const l = this.low(value)
    const cl = this.cluster[h]
    if (!cl) return false
    return cl.contains(l)
  }

  insert(value: number): void {
    if (value < 0 || value >= this._universeSize) return
    if (this.contains(value)) return
    this._size++
    this.insertInner(value)
  }

  private insertInner(value: number): void {
    if (this._min === undefined) {
      this._min = value
      this._max = value
      return
    }

    if (value < this._min) {
      const tmp = this._min
      this._min = value
      if (tmp !== undefined) this.insertInner(tmp)
      return
    }

    if (value > this._max!) {
      this._max = value
    }

    if (this._universeSize === 2) {
      this._max = Math.max(this._max!, value)
      return
    }

    const h = this.high(value)
    const l = this.low(value)

    const cl = this.clusterAt(h)
    if (cl.isEmpty()) {
      this.summary!.insertInner(h)
    }
    cl.insertInner(l)
  }

  delete(value: number): void {
    if (value < 0 || value >= this._universeSize) return
    if (!this.contains(value)) return
    this._size--
    this.deleteInner(value)
  }

  private deleteInner(value: number): void {
    if (this._min === undefined) return

    if (this._min === this._max) {
      this._min = undefined
      this._max = undefined
      return
    }

    if (this._universeSize === 2) {
      if (value === 0) {
        this._min = 1
      } else {
        this._min = 0
      }
      this._max = this._min
      return
    }

    if (value === this._min) {
      const firstCluster = this.summary!.min()
      if (firstCluster === undefined) {
        this._min = undefined
        this._max = undefined
        return
      }
      const cl = this.cluster[firstCluster]!
      this._min = this.index(firstCluster, cl.min()!)
      value = this._min
    }

    const h = this.high(value)
    const l = this.low(value)
    const cl = this.cluster[h]
    if (cl) {
      cl.deleteInner(l)
      if (cl.isEmpty()) {
        this.summary!.deleteInner(h)
        this.cluster[h] = null
      }
    }

    if (value === this._max) {
      const summaryMax = this.summary!.max()
      if (summaryMax === undefined) {
        this._max = this._min
      } else {
        const maxCluster = this.cluster[summaryMax]!
        this._max = this.index(summaryMax, maxCluster.max()!)
      }
    }
  }

  successor(value: number): number | undefined {
    if (value < 0 || value >= this._universeSize) return undefined
    if (this._min === undefined) return undefined

    if (this._universeSize === 2) {
      if (value === 0 && this._max === 1) return 1
      return undefined
    }

    if (value < this._min) return this._min

    const h = this.high(value)
    const l = this.low(value)
    const cl = this.cluster[h]

    if (cl && !cl.isEmpty() && l < cl.max()!) {
      const offset = cl.successor(l)
      return offset !== undefined ? this.index(h, offset) : undefined
    }

    const succCluster = this.summary!.successor(h)
    if (succCluster === undefined) return undefined

    const succCl = this.cluster[succCluster]!
    return this.index(succCluster, succCl.min()!)
  }

  predecessor(value: number): number | undefined {
    if (value < 0 || value >= this._universeSize) return undefined
    if (this._min === undefined) return undefined

    if (this._universeSize === 2) {
      if (value === 1 && this._min === 0) return 0
      return undefined
    }

    if (value > this._max!) return this._max

    const h = this.high(value)
    const l = this.low(value)
    const cl = this.cluster[h]

    if (cl && !cl.isEmpty() && l > cl.min()!) {
      const offset = cl.predecessor(l)
      return offset !== undefined ? this.index(h, offset) : undefined
    }

    const predCluster = this.summary!.predecessor(h)
    if (predCluster === undefined) {
      if (this._min !== undefined && value > this._min) return this._min
      return undefined
    }

    const predCl = this.cluster[predCluster]!
    return this.index(predCluster, predCl.max()!)
  }

  clear(): void {
    this._size = 0
    this._min = undefined
    this._max = undefined
    if (this._universeSize > 2) {
      for (let i = 0; i < this.numClusters; i++) {
        this.cluster[i] = null
      }
      this.summary!.clear()
    }
  }
}
