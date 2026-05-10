import type { IntervalSkipListOptions, IntervalSkipListStatistics, IntervalEntry, IntervalNode } from './types.js'
import { DEFAULT_INTERVAL_SKIPLIST_OPTIONS } from './types.js'

export class IntervalSkipList<T = undefined> {
  private header: IntervalNode<T>
  private maxLevel: number
  private probability: number
  private level: number = 0
  private _size: number = 0
  private stats = {
    inserts: 0,
    removes: 0,
    queries: 0,
  }

  constructor(options?: IntervalSkipListOptions) {
    const resolved = { ...DEFAULT_INTERVAL_SKIPLIST_OPTIONS, ...options }
    this.maxLevel = resolved.maxLevel
    this.probability = resolved.probability
    this.header = this.createNode(0, 0, undefined, this.maxLevel)
    this.header.maxHigh = -Infinity
  }

  insert(low: number, high: number, value?: T): void {
    if (low > high) return

    const update: (IntervalNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: IntervalNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null) {
        const next = current.forward[i]!
        if (next.low < low || (next.low === low && next.high < high)) {
          current = next
        } else {
          break
        }
      }
      update[i] = current
    }

    const newLevel = this.randomLevel()
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.header
      }
      this.level = newLevel
    }

    const newNode = this.createNode(low, high, value, newLevel)
    newNode.maxHigh = high

    for (let i = 0; i < newLevel; i++) {
      const updateNode = update[i]!
      if (updateNode === null) break
      newNode.forward[i] = updateNode.forward[i] ?? null
      updateNode.forward[i] = newNode
    }

    this.updateMaxHigh(newNode)
    this._size++
    this.stats.inserts++
  }

  remove(low: number, high: number): boolean {
    const update: (IntervalNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: IntervalNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null) {
        const next = current.forward[i]!
        if (next.low < low || (next.low === low && next.high < high)) {
          current = next
        } else {
          break
        }
      }
      update[i] = current
    }

    const target = current.forward[0]
    if (target === null || target === undefined || target.low !== low || target.high !== high) {
      return false
    }

    for (let i = 0; i < this.level; i++) {
      const updateNode = update[i]!
      if (updateNode === null) break
      if (updateNode.forward[i] !== target) continue
      updateNode.forward[i] = target.forward[i] ?? null
    }

    while (this.level > 0 && this.header.forward[this.level - 1] === null) {
      this.level--
    }

    this.recalcMaxHigh()
    this._size--
    this.stats.removes++
    return true
  }

  query(point: number): Array<IntervalEntry<T>> {
    this.stats.queries++
    const result: Array<IntervalEntry<T>> = []
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null && current.low <= point) {
      if (current.high >= point) {
        result.push(this.toEntry(current))
      }
      current = current.forward[0]
    }
    return result
  }

  queryRange(qLow: number, qHigh: number): Array<IntervalEntry<T>> {
    this.stats.queries++
    const result: Array<IntervalEntry<T>> = []
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null && current.low <= qHigh) {
      if (current.high >= qLow) {
        result.push(this.toEntry(current))
      }
      current = current.forward[0]
    }
    return result
  }

  contains(low: number, high: number): boolean {
    let current: IntervalNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null) {
        const next = current.forward[i]!
        if (next.low < low || (next.low === low && next.high < high)) {
          current = next
        } else {
          break
        }
      }
    }
    const target = current.forward[0]
    return target !== null && target !== undefined && target.low === low && target.high === high
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.header = this.createNode(0, 0, undefined, this.maxLevel)
    this.header.maxHigh = -Infinity
    this.level = 0
    this._size = 0
  }

  min(): IntervalEntry<T> | undefined {
    const first = this.header.forward[0]
    if (first === null || first === undefined) return undefined
    return this.toEntry(first)
  }

  max(): IntervalEntry<T> | undefined {
    if (this._size === 0) return undefined
    let current: IntervalNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null) {
        current = current.forward[i]!
      }
    }
    return this.toEntry(current)
  }

  overlaps(low: number, high: number): boolean {
    if (low > high) return false
    return this.queryRange(low, high).length > 0
  }

  cover(low: number, high: number): boolean {
    if (low > high) return false
    if (this._size === 0) return false

    const overlapping = this.queryRange(low, high)
    if (overlapping.length === 0) return false

    overlapping.sort((a, b) => a.low - b.low || a.high - b.high)

    if (overlapping[0]!.low > low) return false

    let covered = overlapping[0]!.high
    for (let i = 1; i < overlapping.length; i++) {
      if (overlapping[i]!.low > covered) return false
      if (overlapping[i]!.high > covered) {
        covered = overlapping[i]!.high
      }
    }

    return covered >= high
  }

  toArray(): Array<IntervalEntry<T>> {
    const result: Array<IntervalEntry<T>> = []
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null) {
      result.push(this.toEntry(current))
      current = current.forward[0]
    }
    return result
  }

  forEach(callback: (entry: IntervalEntry<T>, index: number) => void): void {
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    let index = 0
    while (current != null) {
      callback(this.toEntry(current), index)
      current = current.forward[0]
      index++
    }
  }

  *[Symbol.iterator](): Iterator<IntervalEntry<T>> {
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null) {
      yield this.toEntry(current)
      current = current.forward[0]
    }
  }

  getStatistics(): IntervalSkipListStatistics {
    const levelDistribution: Record<number, number> = {}
    let totalNodes = 0
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null) {
      const lvl = current.forward.length
      levelDistribution[lvl] = (levelDistribution[lvl] || 0) + 1
      totalNodes++
      current = current.forward[0]
    }

    const numLevels = this.level > 0 ? this.level : 1
    const avgNodesPerLevel = totalNodes > 0 ? totalNodes / numLevels : 0

    return {
      inserts: this.stats.inserts,
      removes: this.stats.removes,
      queries: this.stats.queries,
      maxLevel: this.level,
      levelDistribution,
      avgNodesPerLevel,
    }
  }

  toJSON(): { entries: Array<{ low: number; high: number; value?: T }>; options: { maxLevel: number; probability: number } } {
    const entries: Array<{ low: number; high: number; value?: T }> = []
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null) {
      const entry: { low: number; high: number; value?: T } = { low: current.low, high: current.high }
      if (current.value !== undefined) {
        entry.value = current.value
      }
      entries.push(entry)
      current = current.forward[0]
    }
    return { entries, options: { maxLevel: this.maxLevel, probability: this.probability } }
  }

  static fromJSON<T>(data: { entries: Array<{ low: number; high: number; value?: T }>; options?: { maxLevel?: number; probability?: number } }): IntervalSkipList<T> {
    const opts: IntervalSkipListOptions = {}
    if (data.options?.maxLevel !== undefined) opts.maxLevel = data.options.maxLevel
    if (data.options?.probability !== undefined) opts.probability = data.options.probability
    const list = new IntervalSkipList<T>(opts)
    for (const entry of data.entries) {
      list.insert(entry.low, entry.high, entry.value)
    }
    return list
  }

  private createNode(low: number, high: number, value: T | undefined, level: number): IntervalNode<T> {
    return {
      low,
      high,
      value,
      forward: new Array(level).fill(null),
      maxHigh: high,
    }
  }

  private randomLevel(): number {
    let lvl = 1
    while (Math.random() < this.probability && lvl < this.maxLevel) {
      lvl++
    }
    return lvl
  }

  private toEntry(node: IntervalNode<T>): IntervalEntry<T> {
    const entry: IntervalEntry<T> = { low: node.low, high: node.high }
    if (node.value !== undefined) {
      entry.value = node.value
    }
    return entry
  }

  private updateMaxHigh(insertedNode: IntervalNode<T>): void {
    const path: IntervalNode<T>[] = []
    let current: IntervalNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i] !== insertedNode) {
        current = current.forward[i]!
      }
      path.push(current)
    }

    for (const node of path) {
      const childMax = node.forward
        .filter((f): f is IntervalNode<T> => f !== null && f !== undefined)
        .reduce((max, f) => Math.max(max, f.maxHigh), node.high !== undefined && node !== this.header ? node.high : -Infinity)
      node.maxHigh = Math.max(node === this.header ? -Infinity : (node.high ?? -Infinity), childMax)
    }

    this.header.maxHigh = this.computeMaxHigh(this.header)
  }

  private computeMaxHigh(node: IntervalNode<T>): number {
    let max = node === this.header ? -Infinity : node.high
    for (let i = 0; i < node.forward.length; i++) {
      const f = node.forward[i]
      if (f != null) {
        max = Math.max(max, f.maxHigh)
      }
    }
    return max
  }

  private recalcMaxHigh(): void {
    const nodes: IntervalNode<T>[] = []
    let current: IntervalNode<T> | null | undefined = this.header.forward[0]
    while (current != null) {
      nodes.push(current)
      current = current.forward[0]
    }

    for (const node of nodes) {
      node.maxHigh = node.high
    }

    for (let lvl = 1; lvl < this.level; lvl++) {
      for (const node of nodes) {
        if (node.forward.length > lvl) {
          const f = node.forward[lvl]
          if (f != null) {
            node.maxHigh = Math.max(node.maxHigh, f.maxHigh)
          }
        }
      }
    }

    this.header.maxHigh = this.computeMaxHigh(this.header)
  }
}

export type { IntervalSkipListOptions, IntervalSkipListStatistics, IntervalEntry } from './types.js'
export { DEFAULT_INTERVAL_SKIPLIST_OPTIONS } from './types.js'
