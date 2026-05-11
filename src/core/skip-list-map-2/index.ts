import type { SkipListMapOptions } from './types.js'
import { DEFAULT_SKIP_LIST_MAP_OPTIONS } from './types.js'

interface SkipListNode<K, V> {
  key: K
  value: V
  forward: (SkipListNode<K, V> | null)[]
  span: number[]
}

export class SkipListMap<K = unknown, V = unknown> {
  private head: SkipListNode<K, V>
  private _size: number = 0
  private _level: number = 1
  private _maxLevel: number
  private _probability: number
  private _comparator: (a: K, b: K) => number

  constructor(options?: SkipListMapOptions<K>) {
    const opts = { ...DEFAULT_SKIP_LIST_MAP_OPTIONS, ...options }
    this._maxLevel = opts.maxLevel
    this._probability = opts.probability
    this._comparator = opts.comparator
    this.head = this.createSentinel()
  }

  private createSentinel(): SkipListNode<K, V> {
    return {
      key: undefined as K,
      value: undefined as V,
      forward: new Array<SkipListNode<K, V> | null>(this._maxLevel).fill(null),
      span: new Array<number>(this._maxLevel).fill(0),
    }
  }

  private randomLevel(): number {
    let lvl = 1
    while (lvl < this._maxLevel && Math.random() < this._probability) {
      lvl++
    }
    return lvl
  }

  private fwd(node: SkipListNode<K, V>, level: number): SkipListNode<K, V> | null {
    return node.forward[level] ?? null
  }

  private spanAt(node: SkipListNode<K, V>, level: number): number {
    return node.span[level] ?? 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  set(key: K, value: V): void {
    const update: SkipListNode<K, V>[] = new Array(this._maxLevel)
    const rank: number[] = new Array(this._maxLevel).fill(0)
    let current: SkipListNode<K, V> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      rank[i] = i === this._level - 1 ? 0 : (rank[i + 1] ?? 0)
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        rank[i]! += this.spanAt(current, i)!
        current = next
      }
      update[i] = current
    }

    const existing = this.fwd(current, 0)
    if (existing !== null && this._comparator(existing.key, key) === 0) {
      existing.value = value
      return
    }

    const newLevel = this.randomLevel()
    if (newLevel > this._level) {
      for (let i = this._level; i < newLevel; i++) {
        rank[i] = 0
        update[i] = this.head
        this.head.span[i] = this._size
      }
      this._level = newLevel
    }

    const newNode: SkipListNode<K, V> = {
      key,
      value,
      forward: new Array<SkipListNode<K, V> | null>(this._maxLevel).fill(null),
      span: new Array<number>(this._maxLevel).fill(0),
    }

    const rank0 = rank[0]
    for (let i = 0; i < newLevel; i++) {
      const upd = update[i]!
      newNode.forward[i] = this.fwd(upd, i)
      upd.forward[i] = newNode

      newNode.span[i] = this.spanAt(upd, i)! - ((rank0 ?? 0) - (rank[i] ?? 0))
      upd.span[i] = ((rank0 ?? 0) - (rank[i] ?? 0)) + 1
    }

    for (let i = newLevel; i < this._level; i++) {
      update[i]!.span[i] = this.spanAt(update[i]!, i) + 1
    }

    this._size++
  }

  get(key: K): V | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        current = next
      }
    }
    const result = this.fwd(current, 0)
    if (result !== null && this._comparator(result.key, key) === 0) {
      return result.value
    }
    return undefined
  }

  has(key: K): boolean {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        current = next
      }
    }
    const result = this.fwd(current, 0)
    return result !== null && this._comparator(result.key, key) === 0
  }

  delete(key: K): boolean {
    const update: SkipListNode<K, V>[] = new Array(this._maxLevel)
    let current: SkipListNode<K, V> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        current = next
      }
      update[i] = current
    }

    const target = this.fwd(current, 0)
    if (target === null || this._comparator(target.key, key) !== 0) {
      return false
    }

    for (let i = 0; i < this._level; i++) {
      const upd = update[i]!
      if (this.fwd(upd, i) === target) {
        upd.span[i] = this.spanAt(upd, i) + this.spanAt(target, i) - 1
        upd.forward[i] = this.fwd(target, i)
      } else {
        upd.span[i] = this.spanAt(upd, i) - 1
      }
    }

    while (this._level > 1 && this.fwd(this.head, this._level - 1) === null) {
      this._level--
    }

    this._size--
    return true
  }

  clear(): void {
    this.head = this.createSentinel()
    this._size = 0
    this._level = 1
  }

  min(): K | undefined {
    const first = this.fwd(this.head, 0)
    return first !== null ? first.key : undefined
  }

  max(): K | undefined {
    if (this._size === 0) return undefined
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (this.fwd(current, i) !== null) {
        current = this.fwd(current, i)!
      }
    }
    return current.key
  }

  minEntry(): [K, V] | undefined {
    const first = this.fwd(this.head, 0)
    return first !== null ? [first.key, first.value] : undefined
  }

  maxEntry(): [K, V] | undefined {
    if (this._size === 0) return undefined
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (this.fwd(current, i) !== null) {
        current = this.fwd(current, i)!
      }
    }
    return [current.key, current.value]
  }

  floor(key: K): K | undefined {
    const entry = this.floorEntry(key)
    return entry !== undefined ? entry[0] : undefined
  }

  floorEntry(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) > 0) break
        current = next
      }
    }
    if (current !== this.head && this._comparator(current.key, key) <= 0) {
      return [current.key, current.value]
    }
    return undefined
  }

  ceiling(key: K): K | undefined {
    const entry = this.ceilingEntry(key)
    return entry !== undefined ? entry[0] : undefined
  }

  ceilingEntry(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        current = next
      }
    }
    const result = this.fwd(current, 0)
    return result !== null ? [result.key, result.value] : undefined
  }

  lower(key: K): K | undefined {
    const entry = this.lowerEntry(key)
    return entry !== undefined ? entry[0] : undefined
  }

  lowerEntry(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        current = next
      }
    }
    if (current !== this.head) {
      return [current.key, current.value]
    }
    return undefined
  }

  higher(key: K): K | undefined {
    const entry = this.higherEntry(key)
    return entry !== undefined ? entry[0] : undefined
  }

  higherEntry(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) > 0) break
        current = next
      }
    }
    const result = this.fwd(current, 0)
    return result !== null ? [result.key, result.value] : undefined
  }

  range(lo: K, hi: K): IterableIterator<[K, V]> {
    return this.rangeEntries(lo, hi)
  }

  *rangeEntries(lo: K, hi: K): IterableIterator<[K, V]> {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, lo) >= 0) break
        current = next
      }
    }
    let node = this.fwd(current, 0)
    while (node !== null && this._comparator(node.key, hi) <= 0) {
      yield [node.key, node.value]
      node = this.fwd(node, 0)
    }
  }

  indexOf(key: K): number {
    let current: SkipListNode<K, V> = this.head
    let rank = 0
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const next = this.fwd(current, i)!
        if (next === null || this._comparator(next.key, key) >= 0) break
        rank += this.spanAt(current, i)
        current = next
      }
    }
    rank += this.spanAt(current, 0)
    const found = this.fwd(current, 0)
    if (found !== null && this._comparator(found.key, key) === 0) {
      return rank - 1
    }
    return -1
  }

  at(index: number): [K, V] | undefined {
    if (index < 0 || index >= this._size) return undefined
    let current: SkipListNode<K, V> = this.head
    let remaining = index + 1
    for (let i = this._level - 1; i >= 0; i--) {
      while (this.fwd(current, i) !== null && remaining > this.spanAt(current, i)) {
        remaining -= this.spanAt(current, i)
        current = this.fwd(current, i)!
      }
    }
    const result = this.fwd(current, 0)
    if (result !== null) {
      return [result.key, result.value]
    }
    return undefined
  }

  *keys(): IterableIterator<K> {
    let current: SkipListNode<K, V> | null = this.fwd(this.head, 0)
    while (current !== null) {
      yield current.key
      current = this.fwd(current, 0)
    }
  }

  *values(): IterableIterator<V> {
    let current: SkipListNode<K, V> | null = this.fwd(this.head, 0)
    while (current !== null) {
      yield current.value
      current = this.fwd(current, 0)
    }
  }

  *entries(): IterableIterator<[K, V]> {
    let current: SkipListNode<K, V> | null = this.fwd(this.head, 0)
    while (current !== null) {
      yield [current.key, current.value]
      current = this.fwd(current, 0)
    }
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    let current: SkipListNode<K, V> | null = this.fwd(this.head, 0)
    while (current !== null) {
      result.push([current.key, current.value])
      current = this.fwd(current, 0)
    }
    return result
  }

  forEach(callback: (value: V, key: K, map: SkipListMap<K, V>) => void): void {
    let current: SkipListNode<K, V> | null = this.fwd(this.head, 0)
    while (current !== null) {
      callback(current.value, current.key, this)
      current = this.fwd(current, 0)
    }
  }

  *[Symbol.iterator](): Generator<[K, V], void, unknown> {
    let current: SkipListNode<K, V> | null = this.fwd(this.head, 0)
    while (current !== null) {
      yield [current.key, current.value]
      current = this.fwd(current, 0)
    }
  }
}

export type { SkipListMapOptions }
