import type { UnionFindOptions } from './types.js'
import { DEFAULT_UNIONFIND_OPTIONS } from './types.js'

export class UnionFind {
  private parent: Int32Array
  private rank: Int32Array
  private sizes: Int32Array
  private capacity: number
  private count: number
  private elementCount: number

  constructor(options?: Partial<UnionFindOptions>) {
    const opts: UnionFindOptions = { ...DEFAULT_UNIONFIND_OPTIONS, ...options }
    const cap = Math.max(0, opts.initialCapacity)
    this.capacity = cap
    this.parent = new Int32Array(cap).fill(-1)
    this.rank = new Int32Array(cap)
    this.sizes = new Int32Array(cap)
    this.count = 0
    this.elementCount = 0
  }

  private ensureCapacity(index: number): void {
    if (index >= this.capacity) {
      const newCap = Math.max(index + 1, this.capacity * 2)
      const newParent = new Int32Array(newCap).fill(-1)
      const newRank = new Int32Array(newCap)
      const newSizes = new Int32Array(newCap)
      newParent.set(this.parent)
      newRank.set(this.rank)
      newSizes.set(this.sizes)
      this.parent = newParent
      this.rank = newRank
      this.sizes = newSizes
      this.capacity = newCap
    }
  }

  makeSet(element: number): void {
    if (element < 0) {
      throw new Error(`Element must be non-negative, got ${element}`)
    }
    this.ensureCapacity(element)
    if (this.parent[element] !== -1) return
    this.parent[element] = element
    this.rank[element] = 0
    this.sizes[element] = 1
    this.count++
    this.elementCount++
  }

  find(element: number): number {
    if (element < 0 || element >= this.capacity || this.parent[element]! === -1) {
      throw new Error(`Element ${element} not found`)
    }
    if (this.parent[element]! !== element) {
      this.parent[element] = this.find(this.parent[element]!)
    }
    return this.parent[element]!
  }

  union(a: number, b: number): boolean {
    if (a < 0 || a >= this.capacity || this.parent[a] === -1) return false
    if (b < 0 || b >= this.capacity || this.parent[b] === -1) return false
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return false
    const rankA = this.rank[rootA]!
    const rankB = this.rank[rootB]!
    if (rankA < rankB) {
      this.parent[rootA] = rootB
      this.sizes[rootB] = this.sizes[rootB]! + this.sizes[rootA]!
    } else if (rankA > rankB) {
      this.parent[rootB] = rootA
      this.sizes[rootA] = this.sizes[rootA]! + this.sizes[rootB]!
    } else {
      this.parent[rootB] = rootA
      this.rank[rootA] = rankA + 1
      this.sizes[rootA] = this.sizes[rootA]! + this.sizes[rootB]!
    }
    this.count--
    return true
  }

  connected(a: number, b: number): boolean {
    if (a < 0 || a >= this.capacity || this.parent[a] === -1) return false
    if (b < 0 || b >= this.capacity || this.parent[b] === -1) return false
    return this.find(a) === this.find(b)
  }

  componentSize(element: number): number {
    if (element < 0 || element >= this.capacity || this.parent[element] === -1) return 0
    const root = this.find(element)
    return this.sizes[root]!
  }

  componentCount(): number {
    return this.count
  }

  size(): number {
    return this.elementCount
  }

  reset(): void {
    this.parent.fill(-1)
    this.rank.fill(0)
    this.sizes.fill(0)
    this.count = 0
    this.elementCount = 0
  }

  toArray(): number[] {
    return Array.from(this.parent)
  }

  getSets(): Map<number, number[]> {
    const sets = new Map<number, number[]>()
    for (let i = 0; i < this.capacity; i++) {
      if (this.parent[i] === -1) continue
      const root = this.find(i)
      if (!sets.has(root)) {
        sets.set(root, [])
      }
      sets.get(root)!.push(i)
    }
    return sets
  }
}

export { DEFAULT_UNIONFIND_OPTIONS } from './types.js'
export type { UnionFindOptions } from './types.js'
