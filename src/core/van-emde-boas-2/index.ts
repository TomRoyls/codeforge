import type { VanEmdeBoasTreeOptions } from './types.js'
import { DEFAULT_UNIVERSE_SIZE } from './types.js'

const NIL = -1

class VEBNode {
  min: number
  max: number
  readonly universeSize: number
  summary: VEBNode | null
  readonly clusters: (VEBNode | null)[]
  private readonly upperSqrt: number
  private readonly lowerSqrt: number

  constructor(universeSize: number) {
    this.min = NIL
    this.max = NIL
    this.universeSize = universeSize
    this.summary = null
    const halfBits = Math.floor(Math.log2(universeSize) / 2)
    this.lowerSqrt = 1 << halfBits
    this.upperSqrt = 1 << Math.ceil(Math.log2(universeSize) / 2)
    this.clusters = new Array(this.upperSqrt).fill(null)
  }

  high(x: number): number {
    return x >>> Math.log2(this.lowerSqrt)
  }

  low(x: number): number {
    return x & (this.lowerSqrt - 1)
  }

  index(h: number, l: number): number {
    return (h << Math.log2(this.lowerSqrt)) | l
  }

  cluster(i: number): VEBNode {
    const existing = this.clusters[i]
    if (existing != null) return existing
    const node = new VEBNode(this.lowerSqrt)
    this.clusters[i] = node
    return node
  }

  insert(x: number): void {
    if (this.min === NIL) {
      this.min = x
      this.max = x
      return
    }
    if (x === this.min) return
    if (x < this.min) {
      const tmp = x
      x = this.min
      this.min = tmp
    }
    if (this.universeSize > 2) {
      const h = this.high(x)
      const c = this.cluster(h)
      if (c.min === NIL) {
        if (this.summary === null) {
          this.summary = new VEBNode(this.upperSqrt)
        }
        this.summary.insert(h)
      }
      c.insert(this.low(x))
    }
    if (x > this.max) {
      this.max = x
    }
  }

  has(x: number): boolean {
    if (this.min === x) return true
    if (this.universeSize <= 2) return this.max === x
    const c = this.clusters[this.high(x)]
    if (c == null) return false
    return c.has(this.low(x))
  }

  delete(x: number): boolean {
    if (this.min === NIL) return false
    if (this.min === this.max) {
      if (x !== this.min) return false
      this.min = NIL
      this.max = NIL
      return true
    }
    if (this.universeSize <= 2) {
      this.min = x === 0 ? 1 : 0
      this.max = this.min
      return true
    }
    if (x === this.min) {
      if (this.summary === null) {
        this.min = NIL
        this.max = NIL
        return false
      }
      const firstCluster = this.summary.min
      if (firstCluster === NIL) {
        this.min = NIL
        this.max = NIL
        return false
      }
      const c = this.clusters[firstCluster]
      if (c == null) {
        this.min = NIL
        this.max = NIL
        return false
      }
      x = this.index(firstCluster, c.min)
      this.min = x
    }
    const h = this.high(x)
    const c = this.clusters[h]
    if (c == null) return false
    if (!c.delete(this.low(x))) return false
    if (c.min === NIL) {
      this.clusters[h] = null
      if (this.summary !== null) {
        this.summary.delete(h)
        if (this.summary.min === NIL) {
          this.max = this.min
          return true
        }
      }
    }
    if (this.max === x) {
      if (this.summary !== null && this.summary.max !== NIL) {
        const sm = this.summary.max
        const sc = this.clusters[sm]
        this.max = sc != null ? this.index(sm, sc.max) : this.min
      } else {
        this.max = this.min
      }
    }
    return true
  }

  successor(x: number): number | undefined {
    if (this.universeSize <= 2) {
      if (x === 0 && this.max === 1) return 1
      return undefined
    }
    if (this.min !== NIL && x < this.min) return this.min
    const h = this.high(x)
    const c = this.clusters[h]
    if (c != null && c.max !== NIL && this.low(x) < c.max) {
      const s = c.successor(this.low(x))
      if (s !== undefined) return this.index(h, s)
    }
    if (this.summary === null) return undefined
    const sc = this.summary.successor(h)
    if (sc === undefined) return undefined
    const cc = this.clusters[sc]!
    if (cc == null || cc.min === NIL) return undefined
    return this.index(sc, cc.min)
  }

  predecessor(x: number): number | undefined {
    if (this.universeSize <= 2) {
      if (x === 1 && this.min === 0) return 0
      return undefined
    }
    if (this.max !== NIL && x > this.max) return this.max
    const h = this.high(x)
    const c = this.clusters[h]
    if (c != null && c.min !== NIL && this.low(x) > c.min) {
      const p = c.predecessor(this.low(x))
      if (p !== undefined) return this.index(h, p)
    }
    if (this.summary !== null) {
      const pc = this.summary.predecessor(h)
      if (pc !== undefined) {
        const cc = this.clusters[pc]
        if (cc != null && cc.max !== NIL) {
          return this.index(pc, cc.max)
        }
      }
    }
    if (this.min !== NIL && x > this.min) return this.min
    return undefined
  }
}

export class VanEmdeBoasTree {
  private root: VEBNode
  private count: number
  private readonly universeSize: number

  constructor(options?: Partial<VanEmdeBoasTreeOptions>) {
    const size = options?.universeSize ?? DEFAULT_UNIVERSE_SIZE
    if (size < 2) {
      throw new RangeError('Universe size must be at least 2')
    }
    if (!VanEmdeBoasTree.isPowerOfTwo(size)) {
      throw new RangeError('Universe size must be a power of 2')
    }
    this.universeSize = size
    this.root = new VEBNode(size)
    this.count = 0
  }

  static isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
  }

  insert(value: number): void {
    if (value < 0 || value >= this.universeSize) {
      throw new RangeError(
        `Value ${value} out of range [0, ${this.universeSize})`,
      )
    }
    if (!this.root.has(value)) {
      this.root.insert(value)
      this.count++
    }
  }

  delete(value: number): boolean {
    if (value < 0 || value >= this.universeSize) return false
    if (this.root.has(value)) {
      const ok = this.root.delete(value)
      if (ok) this.count--
      return ok
    }
    return false
  }

  has(value: number): boolean {
    if (value < 0 || value >= this.universeSize) return false
    return this.root.has(value)
  }

  successor(value: number): number | undefined {
    if (value < 0 || value >= this.universeSize) return undefined
    return this.root.successor(value)
  }

  predecessor(value: number): number | undefined {
    if (value < 0 || value >= this.universeSize) return undefined
    return this.root.predecessor(value)
  }

  min(): number | undefined {
    const m = this.root.min
    return m === NIL ? undefined : m
  }

  max(): number | undefined {
    const m = this.root.max
    return m === NIL ? undefined : m
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.root = new VEBNode(this.universeSize)
    this.count = 0
  }

  toArray(): number[] {
    const result: number[] = []
    let cur = this.min()
    while (cur !== undefined) {
      result.push(cur)
      cur = this.successor(cur)
    }
    return result
  }

  forEach(callback: (value: number, index: number) => void): void {
    let idx = 0
    let cur = this.min()
    while (cur !== undefined) {
      callback(cur, idx)
      idx++
      cur = this.successor(cur)
    }
  }

  extractMin(): number | undefined {
    const m = this.min()
    if (m === undefined) return undefined
    this.delete(m)
    return m
  }

  extractMax(): number | undefined {
    const m = this.max()
    if (m === undefined) return undefined
    this.delete(m)
    return m
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toJSON() {
    return { type: 'VanEmdeBoasTree', items: this.toArray() }
  }

  toString(): string {
    return `VanEmdeBoasTree()`
  }
}

export { DEFAULT_UNIVERSE_SIZE } from './types.js'
export type { VanEmdeBoasTreeOptions } from './types.js'
