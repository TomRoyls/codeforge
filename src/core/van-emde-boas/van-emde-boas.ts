import type { VEBOptions } from './types.js'
import { DEFAULT_VEB_OPTIONS } from './types.js'

class VEBNode {
  min: number | undefined
  max: number | undefined
  universeSize: number
  summary: VEBNode | null
  clusters: Map<number, VEBNode>

  constructor(universeSize: number) {
    this.min = undefined
    this.max = undefined
    this.universeSize = universeSize
    this.summary = null
    this.clusters = new Map()
  }

  high(x: number): number {
    const lowerSqrt = this.lowerSqrt()
    return Math.floor(x / lowerSqrt)
  }

  low(x: number): number {
    const lowerSqrt = this.lowerSqrt()
    return x % lowerSqrt
  }

  index(high: number, low: number): number {
    const lowerSqrt = this.lowerSqrt()
    return high * lowerSqrt + low
  }

  upperSqrt(): number {
    return Math.pow(2, Math.ceil(Math.log2(this.universeSize) / 2))
  }

  lowerSqrt(): number {
    return Math.pow(2, Math.floor(Math.log2(this.universeSize) / 2))
  }

  ensureCluster(index: number): VEBNode {
    let cluster = this.clusters.get(index)
    if (cluster === undefined) {
      cluster = new VEBNode(this.lowerSqrt())
      this.clusters.set(index, cluster)
    }
    return cluster
  }

  getCluster(index: number): VEBNode | undefined {
    return this.clusters.get(index)
  }

  vebMin(): number | undefined {
    return this.min
  }

  vebMax(): number | undefined {
    return this.max
  }

  vebHas(x: number): boolean {
    if (x === this.min) return true
    if (x === this.max) return true
    if (this.universeSize <= 2) return false
    const cluster = this.getCluster(this.high(x))
    if (cluster === undefined) return false
    return cluster.vebHas(this.low(x))
  }

  vebInsert(x: number): void {
    if (this.min === undefined) {
      this.min = x
      this.max = x
      return
    }
    if (x < this.min) {
      const temp = this.min
      this.min = x
      x = temp
    }
    if (this.universeSize > 2) {
      if (this.summary === null) {
        this.summary = new VEBNode(this.upperSqrt())
      }
      const highX = this.high(x)
      const lowX = this.low(x)
      const cluster = this.getCluster(highX)
      if (cluster === undefined || cluster.vebMin() === undefined) {
        this.summary.vebInsert(highX)
        const newCluster = this.ensureCluster(highX)
        newCluster.vebInsert(lowX)
      } else {
        cluster.vebInsert(lowX)
      }
    }
    if (this.max === undefined || x > this.max) {
      this.max = x
    }
  }

  vebDelete(x: number): boolean {
    if (this.min === undefined) return false
    if (this.min === this.max) {
      if (x === this.min) {
        this.min = undefined
        this.max = undefined
        return true
      }
      return false
    }
    if (this.universeSize <= 2) {
      if (x === 0) {
        this.min = 1
      } else {
        this.min = 0
      }
      this.max = this.min
      return true
    }
    if (x === this.min) {
      const firstCluster = this.summary !== null ? this.summary.vebMin() : undefined
      if (firstCluster === undefined) {
        this.min = undefined
        this.max = undefined
        return false
      }
      const cluster = this.getCluster(firstCluster)
      if (cluster === undefined) {
        this.min = undefined
        this.max = undefined
        return false
      }
      x = this.index(firstCluster, cluster.vebMin()!)
      this.min = x
    }
    const highX = this.high(x)
    const cluster = this.getCluster(highX)
    if (cluster === undefined) return false
    const deleted = cluster.vebDelete(this.low(x))
    if (!deleted) return false
    if (cluster.vebMin() === undefined) {
      if (this.summary !== null) {
        this.summary.vebDelete(highX)
      }
      if (this.summary !== null && this.summary.vebMin() === undefined) {
        this.max = this.min
      } else {
        const summaryMax = this.summary !== null ? this.summary.vebMax() : undefined
        if (summaryMax !== undefined) {
          const maxCluster = this.getCluster(summaryMax)
          if (maxCluster !== undefined) {
            this.max = this.index(summaryMax, maxCluster.vebMax()!)
          } else {
            this.max = this.min
          }
        } else {
          this.max = this.min
        }
      }
    } else if (this.max === x) {
      const lowMax = cluster.vebMax()!
      this.max = this.index(highX, lowMax)
    }
    return true
  }

  vebSuccessor(x: number): number | undefined {
    if (this.universeSize <= 2) {
      if (x === 0 && this.max === 1) return 1
      return undefined
    }
    if (this.min !== undefined && x < this.min) {
      return this.min
    }
    const highX = this.high(x)
    const cluster = this.getCluster(highX)
    if (cluster !== undefined) {
      const clusterMax = cluster.vebMax()
      if (clusterMax !== undefined && this.low(x) < clusterMax) {
        const offset = cluster.vebSuccessor(this.low(x))
        if (offset !== undefined) {
          return this.index(highX, offset)
        }
      }
    }
    if (this.summary === null) return undefined
    const succCluster = this.summary.vebSuccessor(highX)
    if (succCluster === undefined) return undefined
    const succClusterNode = this.getCluster(succCluster)
    if (succClusterNode === undefined) return undefined
    const offset2 = succClusterNode.vebMin()
    if (offset2 === undefined) return undefined
    return this.index(succCluster, offset2)
  }

  vebPredecessor(x: number): number | undefined {
    if (this.universeSize <= 2) {
      if (x === 1 && this.min === 0) return 0
      return undefined
    }
    if (this.max !== undefined && x > this.max) {
      return this.max
    }
    const highX = this.high(x)
    const cluster = this.getCluster(highX)
    if (cluster !== undefined) {
      const clusterMin = cluster.vebMin()
      if (clusterMin !== undefined && this.low(x) > clusterMin) {
        const offset = cluster.vebPredecessor(this.low(x))
        if (offset !== undefined) {
          return this.index(highX, offset)
        }
      }
    }
    if (this.summary === null) return undefined
    const predCluster = this.summary.vebPredecessor(highX)
    if (predCluster === undefined) {
      if (this.min !== undefined && x > this.min) {
        return this.min
      }
      return undefined
    }
    const predClusterNode = this.getCluster(predCluster)
    if (predClusterNode === undefined) {
      if (this.min !== undefined && x > this.min) {
        return this.min
      }
      return undefined
    }
    const offset2 = predClusterNode.vebMax()
    if (offset2 === undefined) {
      if (this.min !== undefined && x > this.min) {
        return this.min
      }
      return undefined
    }
    return this.index(predCluster, offset2)
  }
}

export class VanEmdeBoasTree {
  private root: VEBNode
  private count: number
  private universeSize: number

  constructor(options?: Partial<VEBOptions>) {
    const opts = { ...DEFAULT_VEB_OPTIONS, ...options }
    if (opts.universeSize < 2) {
      throw new Error('Universe size must be at least 2')
    }
    if (!this.isPowerOfTwo(opts.universeSize)) {
      throw new Error('Universe size must be a power of 2')
    }
    this.universeSize = opts.universeSize
    this.root = new VEBNode(this.universeSize)
    this.count = 0
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
  }

  insert(x: number): void {
    if (x < 0 || x >= this.universeSize) {
      throw new RangeError(`Value ${x} out of universe range [0, ${this.universeSize})`)
    }
    if (!this.root.vebHas(x)) {
      this.root.vebInsert(x)
      this.count++
    }
  }

  delete(x: number): boolean {
    if (x < 0 || x >= this.universeSize) return false
    if (this.root.vebHas(x)) {
      const result = this.root.vebDelete(x)
      if (result) {
        this.count--
      }
      return result
    }
    return false
  }

  has(x: number): boolean {
    if (x < 0 || x >= this.universeSize) return false
    return this.root.vebHas(x)
  }

  successor(x: number): number | undefined {
    if (x < 0 || x >= this.universeSize) return undefined
    return this.root.vebSuccessor(x)
  }

  predecessor(x: number): number | undefined {
    if (x < 0 || x >= this.universeSize) return undefined
    return this.root.vebPredecessor(x)
  }

  min(): number | undefined {
    return this.root.vebMin()
  }

  max(): number | undefined {
    return this.root.vebMax()
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  size(): number {
    return this.count
  }

  clear(): void {
    this.root = new VEBNode(this.universeSize)
    this.count = 0
  }

  toArray(): number[] {
    const result: number[] = []
    let current = this.min()
    while (current !== undefined) {
      result.push(current)
      current = this.successor(current)
    }
    return result
  }
}

export { DEFAULT_VEB_OPTIONS } from './types.js'
export type { VEBOptions } from './types.js'
