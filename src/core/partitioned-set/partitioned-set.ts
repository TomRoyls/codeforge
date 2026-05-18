import type { PartitionedSetOptions, PartitionedSetJSON, PartitionedSetStatistics } from './types.js'
import { DEFAULT_PARTITIONED_SET_OPTIONS } from './types.js'

export class PartitionedSet<T = unknown> {
  private parent: Map<T, T> = new Map()
  private rank: Map<T, number> = new Map()
  private _size: number = 0
  private _partitionCount: number = 0
  private _trackStatistics: boolean
  private _stats: PartitionedSetStatistics = {
    makeSetCalls: 0,
    findCalls: 0,
    unionCalls: 0,
    successfulUnions: 0,
    pathCompressions: 0,
    maxRank: 0,
  }

  constructor()
  constructor(options: Partial<PartitionedSetOptions>)
  constructor(options?: Partial<PartitionedSetOptions>) {
    const opts: Required<PartitionedSetOptions> = { ...DEFAULT_PARTITIONED_SET_OPTIONS, ...options }
    this._trackStatistics = opts.trackStatistics
  }

  makeSet(element: T): void {
    if (this.parent.has(element)) return
    this.parent.set(element, element)
    this.rank.set(element, 0)
    this._size++
    this._partitionCount++
    if (this._trackStatistics) {
      this._stats.makeSetCalls++
    }
  }

  find(element: T): T | undefined {
    if (!this.parent.has(element)) return undefined
    if (this._trackStatistics) {
      this._stats.findCalls++
    }
    return this.findRoot(element)
  }

  union(a: T, b: T): boolean {
    if (this._trackStatistics) {
      this._stats.unionCalls++
    }
    if (!this.parent.has(a) || !this.parent.has(b)) return false

    const rootA = this.findRoot(a)
    const rootB = this.findRoot(b)

    if (rootA === rootB) return false

    const rankA = this.rank.get(rootA)!
    const rankB = this.rank.get(rootB)!

    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
    } else {
      this.parent.set(rootB, rootA)
      const newRank = rankA + 1
      this.rank.set(rootA, newRank)
      if (this._trackStatistics && newRank > this._stats.maxRank) {
        this._stats.maxRank = newRank
      }
    }

    this._partitionCount--
    if (this._trackStatistics) {
      this._stats.successfulUnions++
    }
    return true
  }

  connected(a: T, b: T): boolean {
    if (!this.parent.has(a) || !this.parent.has(b)) return false
    return this.findRoot(a) === this.findRoot(b)
  }

  has(element: T): boolean {
    return this.parent.has(element)
  }

  get size(): number {
    return this._size
  }

  get partitionCount(): number {
    return this._partitionCount
  }

  getPartition(element: T): T[] {
    if (!this.parent.has(element)) return []
    const root = this.findRoot(element)
    const result: T[] = []
    this.parent.forEach((_, el) => {
      if (this.findRoot(el) === root) {
        result.push(el)
      }
    })
    return result
  }

  getPartitions(): T[][] {
    const rootMap: Map<T, T[]> = new Map()
    this.parent.forEach((_, el) => {
      const root = this.findRoot(el)
      if (!rootMap.has(root)) {
        rootMap.set(root, [])
      }
      rootMap.get(root)!.push(el)
    })
    return [...rootMap.values()]
  }

  getPartitionSize(element: T): number {
    if (!this.parent.has(element)) return 0
    const root = this.findRoot(element)
    let count = 0
    this.parent.forEach((_, el) => {
      if (this.findRoot(el) === root) count++
    })
    return count
  }

  clear(): void {
    this.parent.clear()
    this.rank.clear()
    this._size = 0
    this._partitionCount = 0
    this._stats = {
      makeSetCalls: 0,
      findCalls: 0,
      unionCalls: 0,
      successfulUnions: 0,
      pathCompressions: 0,
      maxRank: 0,
    }
  }

  toArray(): T[] {
    return Array.from(this.parent.keys())
  }

  forEach(callback: (element: T, index: number) => void): void {
    let index = 0
    this.parent.forEach((_, el) => {
      callback(el, index++)
    })
  }

  *[Symbol.iterator](): Iterator<T> {
    const elements = Array.from(this.parent.keys())
    for (const el of elements) {
      yield el
    }
  }

  remove(element: T): boolean {
    if (!this.parent.has(element)) return false

    const children: T[] = []
    this.parent.forEach((parent, el) => {
      if (el !== element && parent === element) {
        children.push(el)
      }
    })

    if (children.length === 0) {
      this.parent.delete(element)
      this.rank.delete(element)
      this._size--
      this._partitionCount--
      return true
    }

    const newParent = children[0]!
    this.parent.set(newParent, newParent)

    const elementRank = this.rank.get(element)!
    this.rank.set(newParent, elementRank)

    for (const child of children) {
      if (child !== newParent) {
        this.parent.set(child, newParent)
      }
    }

    this.parent.forEach((parent, el) => {
      if (el !== element && parent === element) {
        this.parent.set(el, newParent)
      }
    })

    this.parent.delete(element)
    this.rank.delete(element)
    this._size--
    this._partitionCount--
    return true
  }

  getStatistics(): PartitionedSetStatistics {
    return { ...this._stats }
  }

  toJSON(): PartitionedSetJSON<T> {
    const elements: T[] = Array.from(this.parent.keys())
    const parentArr: number[] = []
    const rankArr: number[] = []
    const indexMap: Map<T, number> = new Map()
    for (let i = 0; i < elements.length; i++) {
      indexMap.set(elements[i]!, i)
    }
    for (const el of elements) {
      const p = this.parent.get(el)!
      parentArr.push(indexMap.get(p)!)
      rankArr.push(this.rank.get(el)!)
    }
    return {
      elements,
      parent: parentArr,
      rank: rankArr,
      partitionCount: this._partitionCount,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T>(data: PartitionedSetJSON<T>): PartitionedSet<T> {
    const set = new PartitionedSet<T>()
    set._size = data.elements.length
    set._partitionCount = data.partitionCount
    set._stats = { ...data.statistics }
    for (let i = 0; i < data.elements.length; i++) {
      const el = data.elements[i]!
      set.parent.set(el, el)
    }
    for (let i = 0; i < data.elements.length; i++) {
      const el = data.elements[i]!
      const parentIdx = data.parent[i]!
      set.parent.set(el, data.elements[parentIdx]!)
      set.rank.set(el, data.rank[i]!)
    }
    return set
  }

  private findRoot(element: T): T {
    let current = element
    let compressions = 0
    while (this.parent.get(current) !== current) {
      current = this.parent.get(current)!
      compressions++
    }
    if (compressions > 1) {
      let node = element
      while (this.parent.get(node) !== current) {
        const next = this.parent.get(node)!
        this.parent.set(node, current)
        node = next
      }
      if (this._trackStatistics) {
        this._stats.pathCompressions += compressions - 1
      }
    }
    return current
  }
}

export { DEFAULT_PARTITIONED_SET_OPTIONS } from './types.js'
export type { PartitionedSetOptions, PartitionedSetJSON, PartitionedSetStatistics } from './types.js'
