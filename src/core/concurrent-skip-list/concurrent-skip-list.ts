import type { SkipNode, ConcurrentSkipListOptions, ConcurrentSkipListStats } from './types.js'
import { DEFAULT_PROBABILITY, DEFAULT_MAX_LEVEL, DEFAULT_COMPARATOR } from './types.js'

export class ConcurrentSkipList<K, V> {
  private header: SkipNode<K, V>
  private maxLevel: number
  private probability: number
  private comparator: (a: K, b: K) => number
  private level: number = 0
  private _size: number = 0

  constructor(options?: ConcurrentSkipListOptions<K>) {
    this.maxLevel = options?.maxLevel ?? DEFAULT_MAX_LEVEL
    this.probability = options?.probability ?? DEFAULT_PROBABILITY
    this.comparator = options?.comparator ?? DEFAULT_COMPARATOR
    this.header = this.createNode(null as K, null as V, this.maxLevel)
  }

  insert(key: K, value: V): void {
    const update: (SkipNode<K, V> | null)[] = new Array(this.maxLevel).fill(null)
    const rank: number[] = new Array(this.maxLevel).fill(0)
    let current: SkipNode<K, V> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      rank[i] = i === this.level - 1 ? 0 : rank[i + 1]!
      while (current.forward[i] != null && this.comparator(current.forward[i]!.key, key) < 0) {
        rank[i]! += current.span[i]!
        current = current.forward[i]!
      }
      update[i] = current
    }

    const next = current.forward[0] ?? null

    if (next !== null && this.comparator(next.key, key) === 0) {
      next.value = value
      return
    }

    const newLevel = this.randomLevel()
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        rank[i] = 0
        update[i] = this.header
        this.header.span[i] = this._size
      }
      this.level = newLevel
    }

    const newNode = this.createNode(key, value, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      newNode.forward[i] = (updateNode.forward[i] as SkipNode<K, V> | null) ?? null
      updateNode.forward[i] = newNode

      newNode.span[i] = updateNode.span[i]! - (rank[0]! - rank[i]!)
      updateNode.span[i] = (rank[0]! - rank[i]!) + 1
    }

    for (let i = newLevel; i < this.level; i++) {
      const updateNode = update[i]
      if (updateNode != null) {
        updateNode.span[i]!++
      }
    }

    this._size++
  }

  delete(key: K): boolean {
    const update: (SkipNode<K, V> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipNode<K, V> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const target = current.forward[0] ?? null

    if (target === null || this.comparator(target.key, key) !== 0) {
      return false
    }

    for (let i = 0; i < this.level; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      if (updateNode.forward[i] === target) {
        updateNode.span[i] = updateNode.span[i]! + target.span[i]! - 1
        updateNode.forward[i] = target.forward[i] ?? null
      } else {
        updateNode.span[i]!--
      }
    }

    while (this.level > 0 && this.header.forward[this.level - 1] == null) {
      this.level--
    }

    this._size--
    return true
  }

  search(key: K): V | undefined {
    let current: SkipNode<K, V> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
    }

    const found = current.forward[0] ?? null
    if (found !== null && this.comparator(found.key, key) === 0) {
      return found.value
    }
    return undefined
  }

  contains(key: K): boolean {
    return this.search(key) !== undefined
  }

  min(): [K, V] | undefined {
    const first = this.header.forward[0] ?? null
    return first !== null ? [first.key, first.value] : undefined
  }

  max(): [K, V] | undefined {
    if (this._size === 0) return undefined
    let current: SkipNode<K, V> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null) {
        current = current.forward[i]!
      }
    }
    return [current.key, current.value]
  }

  rangeQuery(lo: K, hi: K): [K, V][] {
    const result: [K, V][] = []
    if (this.comparator(lo, hi) > 0) return result

    let current: SkipNode<K, V> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.comparator(current.forward[i]!.key, lo) < 0) {
        current = current.forward[i]!
      }
    }

    let node = current.forward[0] ?? null
    while (node !== null && this.comparator(node.key, hi) <= 0) {
      result.push([node.key, node.value])
      node = node.forward[0] ?? null
    }

    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      callback(current.value, current.key)
      current = current.forward[0] ?? null
    }
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      result.push([current.key, current.value])
      current = current.forward[0] ?? null
    }
    return result
  }

  get size(): number {
    return this._size
  }

  height(): number {
    return this.level
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.header = this.createNode(null as K, null as V, this.maxLevel)
    this.level = 0
    this._size = 0
  }

  clone(): ConcurrentSkipList<K, V> {
    const result = new ConcurrentSkipList<K, V>({
      maxLevel: this.maxLevel,
      probability: this.probability,
      comparator: this.comparator,
    })
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      result.insert(current.key, current.value)
      current = current.forward[0] ?? null
    }
    return result
  }

  static from<K, V>(entries: [K, V][], options?: ConcurrentSkipListOptions<K>): ConcurrentSkipList<K, V> {
    const list = new ConcurrentSkipList<K, V>(options)
    for (const [key, value] of entries) {
      list.insert(key, value)
    }
    return list
  }

  getRank(key: K): number {
    let rank = 0
    let current: SkipNode<K, V> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.comparator(current.forward[i]!.key, key) <= 0) {
        rank += current.span[i]!
        current = current.forward[i]!
      }
      if (current !== this.header && this.comparator(current.key, key) === 0) {
        return rank - 1
      }
    }

    return -1
  }

  atIndex(index: number): [K, V] | undefined {
    if (index < 0 || index >= this._size) return undefined

    let pos = index + 1
    let current: SkipNode<K, V> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && current.span[i]! <= pos) {
        pos -= current.span[i]!
        current = current.forward[i]!
      }
    }

    if (current !== this.header) {
      return [current.key, current.value]
    }
    return undefined
  }

  stats(): ConcurrentSkipListStats {
    const levelDistribution = new Array(this.level).fill(0)
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      const lvl = current.forward.length
      for (let i = 0; i < lvl && i < this.level; i++) {
        if (current.forward[i] !== undefined) {
          levelDistribution[i]!++
        }
      }
      levelDistribution[0] = (levelDistribution[0] ?? 0)
      current = current.forward[0] ?? null
    }

    const nodeCounts = new Array(this.level).fill(0)
    for (let i = 0; i < this.level; i++) {
      let node = this.header.forward[i]
      while (node != null) {
        nodeCounts[i]!++
        node = node.forward[i]
      }
    }

    return {
      size: this._size,
      height: this.level,
      maxLevel: this.maxLevel,
      probability: this.probability,
      nodeCount: this._size,
      levelDistribution: nodeCounts,
    }
  }

  private createNode(key: K, value: V, level: number): SkipNode<K, V> {
    return {
      key,
      value,
      forward: new Array(level).fill(null),
      span: new Array(level).fill(0),
    }
  }

  private randomLevel(): number {
    let lvl = 1
    while (Math.random() < this.probability && lvl < this.maxLevel) {
      lvl++
    }
    return lvl
  }
}

export type { SkipNode, ConcurrentSkipListOptions, ConcurrentSkipListStats } from './types.js'
