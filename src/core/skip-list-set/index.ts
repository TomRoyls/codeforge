import type { SkipListSetOptions } from './types.js'
import { DEFAULT_SKIP_LIST_SET_OPTIONS } from './types.js'

interface SkipListNode<T> {
  value: T
  forward: (SkipListNode<T> | null)[]
  span: number[]
}

export class SkipListSet<T = number> {
  private head: SkipListNode<T>
  private _size: number = 0
  private _level: number = 1
  private _maxLevel: number
  private _comparator: (a: T, b: T) => number

  constructor(options?: SkipListSetOptions<T>) {
    const opts = { ...DEFAULT_SKIP_LIST_SET_OPTIONS, ...options }
    this._maxLevel = opts.maxLevel
    this._comparator = opts.comparator
    this.head = this.createSentinel()
  }

  private createSentinel(): SkipListNode<T> {
    return {
      value: null as T,
      forward: new Array<SkipListNode<T> | null>(this._maxLevel).fill(null),
      span: new Array<number>(this._maxLevel).fill(0),
    }
  }

  private createNode(value: T, level: number): SkipListNode<T> {
    return {
      value,
      forward: new Array<SkipListNode<T> | null>(level).fill(null),
      span: new Array<number>(level).fill(0),
    }
  }

  private randomLevel(): number {
    let lvl = 1
    while (lvl < this._maxLevel && Math.random() < 0.5) {
      lvl++
    }
    return lvl
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

  add(value: T): boolean {
    const update: (SkipListNode<T> | null)[] = new Array(this._maxLevel).fill(null)
    const rank: number[] = new Array(this._maxLevel).fill(0)
    let current: SkipListNode<T> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      rank[i] = i === this._level - 1 ? 0 : (rank[i + 1] ?? 0)
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        rank[i] = (rank[i] ?? 0) + (current.span[i] ?? 0)
        current = f
      }
      update[i] = current
    }

    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) === 0) {
      return false
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

    const newNode = this.createNode(value, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const u = update[i]!
      newNode.forward[i] = u.forward[i] ?? null
      u.forward[i] = newNode

      newNode.span[i] = (u.span[i] ?? 0) - ((rank[0] ?? 0) - (rank[i] ?? 0))
      u.span[i] = ((rank[0] ?? 0) - (rank[i] ?? 0)) + 1
    }

    for (let i = newLevel; i < this._level; i++) {
      const u = update[i]!
      if (u.span[i] !== undefined) {
        u.span[i] = (u.span[i] ?? 0) + 1
      }
    }

    this._size++
    return true
  }

  delete(value: T): boolean {
    const update: (SkipListNode<T> | null)[] = new Array(this._maxLevel).fill(null)
    let current: SkipListNode<T> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        current = f
      }
      update[i] = current
    }

    const target = (update[0]?.forward[0] ?? null) as SkipListNode<T> | null
    if (target === null || this._comparator(target.value, value) !== 0) {
      return false
    }

    for (let i = 0; i < this._level; i++) {
      const u = update[i]!
      if (u.forward[i] === target) {
        u.span[i] = (u.span[i] ?? 0) + (target.span[i] ?? 0) - 1
        u.forward[i] = target.forward[i] ?? null
      } else {
        if (u.span[i] !== undefined) {
          u.span[i] = (u.span[i] ?? 0) - 1
        }
      }
    }

    while (this._level > 1 && this.head.forward[this._level - 1] === null) {
      this._level--
    }

    this._size--
    return true
  }

  has(value: T): boolean {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) > 0) break
        if (this._comparator(f.value, value) === 0) return true
        current = f
      }
    }
    return false
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    let current: SkipListNode<T> = this.head
    let remaining = index + 1
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && (current.span[i] ?? 0) <= remaining) {
        remaining -= current.span[i] ?? 0
        current = current.forward[i]!
      }
    }
    return current.value
  }

  indexOf(value: T): number {
    let current: SkipListNode<T> = this.head
    let rank = 0
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        rank += current.span[i] ?? 0
        current = f
      }
    }
    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) === 0) {
      return rank
    }
    return -1
  }

  floor(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) > 0) break
        current = f
      }
    }
    if (current === this.head) return undefined
    const c = this._comparator(current.value, value)
    if (c <= 0) return current.value
    return undefined
  }

  ceiling(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        current = f
      }
    }
    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) >= 0) {
      return next.value
    }
    return undefined
  }

  lower(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        current = f
      }
    }
    if (current === this.head) return undefined
    if (this._comparator(current.value, value) < 0) return current.value
    return undefined
  }

  higher(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) > 0) break
        current = f
      }
    }
    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) > 0) {
      return next.value
    }
    return undefined
  }

  *range(lo: T, hi: T): Generator<T, void, unknown> {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, lo) >= 0) break
        current = f
      }
    }
    let node = current.forward[0] ?? null
    while (node !== null && this._comparator(node.value, lo) < 0) {
      node = node.forward[0] ?? null
    }
    while (node !== null && this._comparator(node.value, hi) <= 0) {
      yield node.value
      node = node.forward[0] ?? null
    }
  }

  min(): T | undefined {
    const first = this.head.forward[0]
    return first !== null && first !== undefined ? first.value : undefined
  }

  max(): T | undefined {
    if (this._size === 0) return undefined
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] !== null) {
        current = current.forward[i]!
      }
    }
    return current.value
  }

  toArray(): T[] {
    const result: T[] = []
    let node = this.head.forward[0]
    while (node !== null && node !== undefined) {
      result.push(node.value)
      node = node.forward[0]
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let node = this.head.forward[0]
    let idx = 0
    while (node !== null && node !== undefined) {
      callback(node.value, idx)
      node = node.forward[0]
      idx++
    }
  }

  clear(): void {
    this.head = this.createSentinel()
    this._size = 0
    this._level = 1
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
    let node = this.head.forward[0]
    while (node !== null && node !== undefined) {
      yield node.value
      node = node.forward[0]
    }
  }

  values(): Generator<T, void, unknown> {
    return this[Symbol.iterator]()
  }

  toString(): string {
    return `SkipListSet({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SkipListSet', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }
}
