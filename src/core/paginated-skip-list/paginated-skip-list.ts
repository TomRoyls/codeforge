import type {
  PaginatedSkipListOptions,
  PageInfo,
  CursorPage,
  RangePage,
  SkipNode,
} from './types.js'
import {
  DEFAULT_MAX_LEVEL,
  DEFAULT_PROBABILITY,
} from './types.js'

export class PaginatedSkipList<T> {
  private header: SkipNode<T>
  private maxLevel: number
  private probability: number
  private compare: (a: T, b: T) => number
  private level: number = 0
  private _size: number = 0

  constructor(options?: PaginatedSkipListOptions<T>) {
    this.maxLevel = options?.maxLevel ?? DEFAULT_MAX_LEVEL
    this.probability = options?.probability ?? DEFAULT_PROBABILITY
    this.compare = options?.comparator ?? createDefaultComparator<T>()
    this.header = this.createNode(null as T, this.maxLevel)
    if (options?.initialValues) {
      for (const v of options.initialValues) {
        this.insert(v)
      }
    }
  }

  insert(value: T): void {
    const update: (SkipNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.value, value) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const next = current.forward[0] ?? null

    if (next !== null && this.compare(next.value, value) === 0) {
      next.value = value
      return
    }

    const newLevel = this.randomLevel()
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.header
      }
      this.level = newLevel
    }

    const newNode = this.createNode(value, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      newNode.forward[i] = updateNode.forward[i] ?? null
      updateNode.forward[i] = newNode
    }

    this._size++
  }

  remove(value: T): boolean {
    const update: (SkipNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.value, value) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const target = current.forward[0] ?? null

    if (target === null || this.compare(target.value, value) !== 0) {
      return false
    }

    for (let i = 0; i < this.level; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      if (updateNode.forward[i] !== target) break
      updateNode.forward[i] = target.forward[i] ?? null
    }

    while (this.level > 0 && this.header.forward[this.level - 1] == null) {
      this.level--
    }

    this._size--
    return true
  }

  contains(value: T): boolean {
    const node = this.findNode(value)
    return node !== null
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.header = this.createNode(null as T, this.maxLevel)
    this.level = 0
    this._size = 0
  }

  getPage(pageNumber: number, pageSize: number): PageInfo<T> {
    const totalItems = this._size
    const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0

    if (pageNumber < 1 || pageSize <= 0 || totalItems === 0) {
      return {
        items: [],
        pageNumber,
        pageSize,
        totalItems,
        totalPages,
        hasNext: false,
        hasPrev: false,
      }
    }

    const startIndex = (pageNumber - 1) * pageSize
    if (startIndex >= totalItems) {
      return {
        items: [],
        pageNumber,
        pageSize,
        totalItems,
        totalPages,
        hasNext: false,
        hasPrev: pageNumber > 1,
      }
    }

    const items = this.collectItems(startIndex, pageSize)
    return {
      items,
      pageNumber,
      pageSize,
      totalItems,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
    }
  }

  getCursorPage(cursor: T | null, pageSize: number): CursorPage<T> {
    if (pageSize <= 0) {
      return { items: [], cursor: null, hasMore: false }
    }

    let startNode: SkipNode<T>

    if (cursor == null) {
      startNode = this.header
    } else {
      const found = this.findNode(cursor)
      if (found == null) {
        startNode = this.findInsertPosition(cursor)
      } else {
        startNode = found
      }
    }

    const items: T[] = []
    let current = startNode.forward[0]
    const totalToCollect = pageSize + 1

    while (current != null && items.length < totalToCollect) {
      items.push(current.value)
      current = current.forward[0]
    }

    const hasMore = items.length > pageSize
    const resultItems = hasMore ? items.slice(0, pageSize) : items
    const nextCursor = hasMore ? resultItems[resultItems.length - 1]! : null

    return {
      items: resultItems,
      cursor: nextCursor,
      hasMore,
    }
  }

  getRange(start: T, end: T): T[] {
    const result: T[] = []
    if (this.compare(start, end) > 0) {
      return result
    }

    let current: SkipNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.value, start) < 0) {
        current = current.forward[i]!
      }
    }

    let node = current.forward[0]
    while (node != null && this.compare(node.value, end) <= 0) {
      result.push(node.value)
      node = node.forward[0]
    }

    return result
  }

  getRangePage(start: T, end: T, pageNumber: number, pageSize: number): RangePage<T> {
    const allInRange = this.getRange(start, end)
    const totalInRange = allInRange.length

    if (pageNumber < 1 || pageSize <= 0 || totalInRange === 0) {
      return { items: [], rangeStart: start, rangeEnd: end }
    }

    const startIdx = (pageNumber - 1) * pageSize
    if (startIdx >= totalInRange) {
      return { items: [], rangeStart: start, rangeEnd: end }
    }

    const items = allInRange.slice(startIdx, startIdx + pageSize)
    return { items, rangeStart: start, rangeEnd: end }
  }

  getMin(): T | undefined {
    const first = this.header.forward[0]
    return first != null ? first.value : undefined
  }

  getMax(): T | undefined {
    if (this._size === 0) return undefined

    let current: SkipNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null) {
        current = current.forward[i]!
      }
    }
    return current.value
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.header.forward[0]
    while (current != null) {
      result.push(current.value)
      current = current.forward[0]
    }
    return result
  }

  atIndex(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.collectItems(index, 1)[0]
  }

  indexOf(value: T): number {
    let idx = 0
    let current = this.header.forward[0]
    while (current != null) {
      const cmp = this.compare(current.value, value)
      if (cmp === 0) return idx
      if (cmp > 0) return -1
      idx++
      current = current.forward[0]
    }
    return -1
  }

  rank(value: T): number {
    if (!this.contains(value)) return -1
    return this.indexOf(value)
  }

  findByRank(rank: number): T | undefined {
    if (rank < 0 || rank >= this._size) return undefined
    return this.atIndex(rank)
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    let current = this.header.forward[0]
    while (current != null) {
      callback(current.value, idx)
      idx++
      current = current.forward[0]
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.header.forward[0]
    while (current != null) {
      yield current.value
      current = current.forward[0]
    }
  }

  clone(): PaginatedSkipList<T> {
    const cloned = new PaginatedSkipList<T>({
      maxLevel: this.maxLevel,
      probability: this.probability,
      comparator: this.compare,
    })
    let current = this.header.forward[0]
    while (current != null) {
      cloned.insert(current.value)
      current = current.forward[0]
    }
    return cloned
  }

  merge(other: PaginatedSkipList<T>): PaginatedSkipList<T> {
    const result = this.clone()
    let current = other.header.forward[0]
    while (current != null) {
      result.insert(current.value)
      current = current.forward[0]
    }
    return result
  }

  private findNode(value: T): SkipNode<T> | null {
    let current: SkipNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.value, value) < 0) {
        current = current.forward[i]!
      }
    }
    const found = current.forward[0]
    if (found != null && this.compare(found.value, value) === 0) {
      return found
    }
    return null
  }

  private findInsertPosition(value: T): SkipNode<T> {
    let current: SkipNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.value, value) < 0) {
        current = current.forward[i]!
      }
    }
    return current
  }

  private collectItems(startIndex: number, count: number): T[] {
    const result: T[] = []

    let current: SkipNode<T> | null = this.header.forward[0] ?? null

    for (let i = 0; i < startIndex && current != null; i++) {
      current = current.forward[0] ?? null
    }

    while (current != null && result.length < count) {
      result.push(current.value)
      current = current.forward[0] ?? null
    }

    return result
  }

  private createNode(value: T, level: number): SkipNode<T> {
    return {
      value,
      forward: new Array(level).fill(null),
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

function createDefaultComparator<T>(): (a: T, b: T) => number {
  return (a: T, b: T): number => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }
}

export {
  DEFAULT_MAX_LEVEL,
  DEFAULT_PROBABILITY,
} from './types.js'
export type {
  PaginatedSkipListOptions,
  PageInfo,
  CursorPage,
  RangePage,
  SkipNode,
} from './types.js'
