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
  private _comparator: (a: K, b: K) => number

  constructor(options?: SkipListMapOptions<K>) {
    const opts = { ...DEFAULT_SKIP_LIST_MAP_OPTIONS, ...options }
    this._maxLevel = opts.maxLevel
    this._comparator = opts.comparator
    this.head = this.createSentinel()
  }

  private createSentinel(): SkipListNode<K, V> {
    return {
      key: null as K,
      value: null as V,
      forward: new Array<SkipListNode<K, V> | null>(this._maxLevel).fill(null),
      span: new Array<number>(this._maxLevel).fill(0),
    }
  }

  private randomLevel(): number {
    let lvl = 1
    while (lvl < this._maxLevel && Math.random() < 0.5) {
      lvl++
    }
    return lvl
  }

  private getForward(node: SkipListNode<K, V>, level: number): SkipListNode<K, V> | null {
    return node.forward[level] ?? null
  }

  private getSpan(node: SkipListNode<K, V>, level: number): number {
    return node.span[level] ?? 0
  }

  private setForward(node: SkipListNode<K, V>, level: number, value: SkipListNode<K, V> | null): void {
    node.forward[level] = value
  }

  private setSpan(node: SkipListNode<K, V>, level: number, value: number): void {
    node.span[level] = value
  }

  get maxLevel(): number {
    return this._maxLevel
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  set(key: K, value: V): void {
    const update: (SkipListNode<K, V> | null)[] = new Array(this._maxLevel).fill(null)
    const rank: number[] = new Array(this._maxLevel).fill(0)
    let current: SkipListNode<K, V> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      rank[i] = i === this._level - 1 ? 0 : (rank[i + 1] ?? 0)
      let ri = rank[i] ?? 0
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        ri += this.getSpan(current, i)
        current = f
      }
      rank[i] = ri
      update[i] = current
    }

    const existingNode = this.getForward(current, 0)
    if (existingNode !== null && this._comparator(existingNode.key, key) === 0) {
      existingNode.value = value
      return
    }

    const newLevel = this.randomLevel()
    if (newLevel > this._level) {
      for (let i = this._level; i < newLevel; i++) {
        rank[i] = 0
        update[i] = this.head
        this.setSpan(this.head, i, this._size)
      }
      this._level = newLevel
    }

    const newNode: SkipListNode<K, V> = {
      key,
      value,
      forward: new Array<SkipListNode<K, V> | null>(this._maxLevel).fill(null),
      span: new Array<number>(this._maxLevel).fill(0),
    }

    const rank0 = rank[0] ?? 0
    for (let i = 0; i < newLevel; i++) {
      const upd = update[i]!
      this.setForward(newNode, i, this.getForward(upd, i))
      this.setForward(upd, i, newNode)

      const ri = rank[i] ?? 0
      this.setSpan(newNode, i, this.getSpan(upd, i) - (rank0 - ri))
      this.setSpan(upd, i, (rank0 - ri) + 1)
    }

    for (let i = newLevel; i < this._level; i++) {
      const upd = update[i]!
      this.setSpan(upd, i, this.getSpan(upd, i) + 1)
    }

    this._size++
  }

  get(key: K): V | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        current = f
      }
    }
    const result = this.getForward(current, 0)
    if (result !== null && this._comparator(result.key, key) === 0) {
      return result.value
    }
    return undefined
  }

  has(key: K): boolean {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        current = f
      }
    }
    const result = this.getForward(current, 0)
    return result !== null && this._comparator(result.key, key) === 0
  }

  delete(key: K): boolean {
    const update: (SkipListNode<K, V> | null)[] = new Array(this._maxLevel).fill(null)
    let current: SkipListNode<K, V> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        current = f
      }
      update[i] = current
    }

    const target = this.getForward(current, 0)
    if (target === null || this._comparator(target.key, key) !== 0) {
      return false
    }

    for (let i = 0; i < this._level; i++) {
      const upd = update[i]!
      if (this.getForward(upd, i) === target) {
        this.setSpan(upd, i, this.getSpan(upd, i) + this.getSpan(target, i) - 1)
        this.setForward(upd, i, this.getForward(target, i))
      } else {
        this.setSpan(upd, i, this.getSpan(upd, i) - 1)
      }
    }

    while (this._level > 1 && this.getForward(this.head, this._level - 1) === null) {
      this._level--
    }

    this._size--
    return true
  }

  min(): K | undefined {
    const first = this.getForward(this.head, 0)
    return first !== null ? first.key : undefined
  }

  minEntry(): [K, V] | undefined {
    const first = this.getForward(this.head, 0)
    return first !== null ? [first.key, first.value] : undefined
  }

  max(): K | undefined {
    if (this._size === 0) return undefined
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (this.getForward(current, i) !== null) {
        current = this.getForward(current, i)!
      }
    }
    return current.key
  }

  maxEntry(): [K, V] | undefined {
    if (this._size === 0) return undefined
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (this.getForward(current, i) !== null) {
        current = this.getForward(current, i)!
      }
    }
    return [current.key, current.value]
  }

  lowerBound(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        current = f
      }
    }
    const result = this.getForward(current, 0)
    return result !== null ? [result.key, result.value] : undefined
  }

  upperBound(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) > 0) break
        current = f
      }
    }
    const result = this.getForward(current, 0)
    return result !== null ? [result.key, result.value] : undefined
  }

  rank(key: K): number {
    let current: SkipListNode<K, V> = this.head
    let r = 0
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        r += this.getSpan(current, i)
        current = f
      }
    }
    r += this.getSpan(current, 0)
    const found = this.getForward(current, 0)
    if (found !== null && this._comparator(found.key, key) === 0) {
      return r
    }
    return -1
  }

  select(k: number): [K, V] | undefined {
    if (k < 1 || k > this._size) return undefined
    let current: SkipListNode<K, V> = this.head
    let remaining = k
    for (let i = this._level - 1; i >= 0; i--) {
      while (this.getForward(current, i) !== null && remaining > this.getSpan(current, i)) {
        remaining -= this.getSpan(current, i)
        current = this.getForward(current, i)!
      }
    }
    const result = this.getForward(current, 0)
    if (result !== null) {
      return [result.key, result.value]
    }
    return undefined
  }

  clear(): void {
    this.head = this.createSentinel()
    this._size = 0
    this._level = 1
  }

  *keys(): IterableIterator<K> {
    let current: SkipListNode<K, V> | null = this.getForward(this.head, 0)
    while (current !== null) {
      yield current.key
      current = this.getForward(current, 0)
    }
  }

  *values(): IterableIterator<V> {
    let current: SkipListNode<K, V> | null = this.getForward(this.head, 0)
    while (current !== null) {
      yield current.value
      current = this.getForward(current, 0)
    }
  }

  *entries(): IterableIterator<[K, V]> {
    let current: SkipListNode<K, V> | null = this.getForward(this.head, 0)
    while (current !== null) {
      yield [current.key, current.value]
      current = this.getForward(current, 0)
    }
  }

  forEach(callback: (value: V, key: K, map: SkipListMap<K, V>) => void): void {
    let current: SkipListNode<K, V> | null = this.getForward(this.head, 0)
    while (current !== null) {
      callback(current.value, current.key, this)
      current = this.getForward(current, 0)
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    yield* this.entries()
  }

  clone(): SkipListMap<K, V> {
    const cloned = new SkipListMap<K, V>({
      maxLevel: this._maxLevel,
      comparator: this._comparator,
    })
    let current: SkipListNode<K, V> | null = this.getForward(this.head, 0)
    while (current !== null) {
      cloned.set(current.key, current.value)
      current = this.getForward(current, 0)
    }
    return cloned
  }

  static fromEntries<K, V>(
    entries: Iterable<[K, V]>,
    options?: SkipListMapOptions<K>,
  ): SkipListMap<K, V> {
    const map = new SkipListMap<K, V>(options)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  *rangeEntries(from: K, to: K): IterableIterator<[K, V]> {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f.key, from) >= 0) break
        current = f
      }
    }
    let next = this.getForward(current, 0)
    while (next !== null && this._comparator(next.key, to) <= 0) {
      yield [next.key, next.value]
      next = this.getForward(next, 0)
    }
  }

  floor(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) > 0) break
        current = f
      }
    }
    if (current !== this.head && this._comparator(current.key, key) <= 0) {
      return [current.key, current.value]
    }
    return undefined
  }

  ceil(key: K): [K, V] | undefined {
    return this.lowerBound(key)
  }

  predecessor(key: K): [K, V] | undefined {
    let current: SkipListNode<K, V> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = this.getForward(current, i)
        if (f === null || this._comparator(f!.key, key) >= 0) break
        current = f
      }
    }
    if (current === this.head) return undefined
    return [current.key, current.value]
  }

  successor(key: K): [K, V] | undefined {
    return this.upperBound(key)
  }
}

export type { SkipListMapOptions }
