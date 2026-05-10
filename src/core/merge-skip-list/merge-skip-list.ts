import {
  type MergeSkipListOptions,
  type MergeSkipListStatistics,
  type SkipNode,
  DEFAULT_MERGE_SKIP_LIST_OPTIONS,
} from './types.js'

export class MergeSkipList {
  private header: SkipNode
  private level: number
  private _size: number
  private readonly maxLevel: number
  private readonly probability: number
  private stats: { inserts: number; deletes: number; searches: number; merges: number }

  constructor(options?: MergeSkipListOptions) {
    const opts = { ...DEFAULT_MERGE_SKIP_LIST_OPTIONS, ...options }
    this.maxLevel = opts.maxLevel
    this.probability = opts.probability
    this.level = 0
    this._size = 0
    this.header = this.createNode(Infinity, undefined, this.maxLevel + 1)
    this.stats = { inserts: 0, deletes: 0, searches: 0, merges: 0 }
  }

  private createNode(key: number, value: number | undefined, level: number): SkipNode {
    return { key, value, forward: new Array<SkipNode | null>(level).fill(null) }
  }

  private randomLevel(): number {
    let lvl = 0
    while (Math.random() < this.probability && lvl < this.maxLevel) {
      lvl++
    }
    return lvl
  }

  insert(key: number, value?: number): void {
    const update: (SkipNode | null)[] = new Array(this.maxLevel + 1).fill(null)
    let current = this.header

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i]! && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const target = current.forward[0]

    if (target && target.key === key) {
      target.value = value
      this.stats.inserts++
      return
    }

    const newLevel = this.randomLevel()
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.header
      }
      this.level = newLevel
    }

    const newNode = this.createNode(key, value, newLevel + 1)
    for (let i = 0; i <= newLevel; i++) {
      const updateNode = update[i]!
      newNode.forward[i] = updateNode.forward[i]
      updateNode.forward[i] = newNode
    }

    this._size++
    this.stats.inserts++
  }

  delete(key: number): boolean {
    const update: (SkipNode | null)[] = new Array(this.maxLevel + 1).fill(null)
    let current = this.header

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i]! && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const target = current.forward[0]

    if (!target || target.key !== key) {
      this.stats.deletes++
      return false
    }

    for (let i = 0; i <= this.level; i++) {
      const updateNode = update[i]!
      if (updateNode.forward[i] !== target) break
      updateNode.forward[i] = target.forward[i]
    }

    while (this.level > 0 && !this.header.forward[this.level]) {
      this.level--
    }

    this._size--
    this.stats.deletes++
    return true
  }

  search(key: number): number | undefined {
    this.stats.searches++
    let current = this.header
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i]! && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
    }
    const target = current.forward[0]
    if (target && target.key === key) {
      return target.value
    }
    return undefined
  }

  has(key: number): boolean {
    let current = this.header
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i]! && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
    }
    const target = current.forward[0]
    return target !== null && target !== undefined && target.key === key
  }

  findMin(): [number, number | undefined] | undefined {
    const first = this.header.forward[0]
    if (!first) return undefined
    return [first.key, first.value]
  }

  findMax(): [number, number | undefined] | undefined {
    let current = this.header
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i]!) {
        current = current.forward[i]!
      }
    }
    if (current === this.header) return undefined
    return [current.key, current.value]
  }

  merge(other: MergeSkipList): void {
    for (const [key, value] of other) {
      this.insert(key, value)
    }
    this.stats.merges++
  }

  rangeQuery(min: number, max: number): [number, number | undefined][] {
    let current = this.header
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i]! && current.forward[i]!.key < min) {
        current = current.forward[i]!
      }
    }
    const start = current.forward[0]
    const result: [number, number | undefined][] = []
    let node = start
    while (node && node.key <= max) {
      result.push([node.key, node.value])
      node = node.forward[0]
    }
    return result
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.level = 0
    this._size = 0
    this.header = this.createNode(Infinity, undefined, this.maxLevel + 1)
  }

  toArray(): [number, number | undefined][] {
    const result: [number, number | undefined][] = []
    let current = this.header.forward[0]
    while (current) {
      result.push([current.key, current.value])
      current = current.forward[0]
    }
    return result
  }

  forEach(callback: (key: number, value: number | undefined) => void): void {
    let current = this.header.forward[0]
    while (current) {
      callback(current.key, current.value)
      current = current.forward[0]
    }
  }

  *[Symbol.iterator](): Iterator<[number, number | undefined]> {
    let current = this.header.forward[0]
    while (current) {
      yield [current.key, current.value]
      current = current.forward[0]
    }
  }

  getLevel(): number {
    return this.level
  }

  getStatistics(): MergeSkipListStatistics {
    return {
      inserts: this.stats.inserts,
      deletes: this.stats.deletes,
      searches: this.stats.searches,
      merges: this.stats.merges,
      level: this.level,
    }
  }
}
