import type { SkipListQueueOptions, SkipListQueueStatistics, SkipListNode } from './types.js'
import { DEFAULT_SKIP_LIST_QUEUE_OPTIONS } from './types.js'

export class SkipListQueue<T> {
  private header: SkipListNode<T>
  private maxLevel: number
  private probability: number
  private comparator: (a: number, b: number) => number
  private level: number = 0
  private _size: number = 0
  private valueMap: Map<T, SkipListNode<T>> = new Map()
  private stats: SkipListQueueStatistics = {
    enqueues: 0,
    dequeues: 0,
    removals: 0,
    updates: 0,
    maxLevel: 0,
    totalNodesCreated: 0,
  }

  constructor(options?: SkipListQueueOptions) {
    const resolved = { ...DEFAULT_SKIP_LIST_QUEUE_OPTIONS, ...options }
    this.maxLevel = resolved.maxLevel
    this.probability = resolved.probability
    this.comparator = resolved.comparator
    this.header = this.createNode(null as T, 0, this.maxLevel)
  }

  enqueue(value: T, priority: number): boolean {
    if (this.valueMap.has(value)) {
      return false
    }

    const update: (SkipListNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipListNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.priority, priority) < 0) {
        current = current.forward[i]!
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

    const newNode = this.createNode(value, priority, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const updateNode = update[i]
      if (updateNode === null) break
      newNode.forward[i] = updateNode.forward[i]
      updateNode.forward[i] = newNode
    }

    this._size++
    this.valueMap.set(value, newNode)
    this.stats.enqueues++
    this.stats.totalNodesCreated++
    if (newLevel > this.stats.maxLevel) {
      this.stats.maxLevel = newLevel
    }

    return true
  }

  dequeue(): T | undefined {
    const first = this.header.forward[0]
    if (first === null) {
      return undefined
    }
    const value = first.value

    for (let i = 0; i < this.level; i++) {
      const headerFwd = this.header.forward[i]
      if (headerFwd !== first) break
      this.header.forward[i] = first.forward[i]
    }

    while (this.level > 0 && this.header.forward[this.level - 1] === null) {
      this.level--
    }

    this._size--
    this.valueMap.delete(value)
    this.stats.dequeues++
    return value
  }

  peek(): T | undefined {
    const first = this.header.forward[0]
    return first !== null ? first.value : undefined
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.header = this.createNode(null as T, 0, this.maxLevel)
    this.level = 0
    this._size = 0
    this.valueMap.clear()
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.header.forward[0]
    while (current !== null) {
      result.push(current.value)
      current = current.forward[0]
    }
    return result
  }

  forEach(callback: (value: T, priority: number, index: number) => void): void {
    let current = this.header.forward[0]
    let index = 0
    while (current !== null) {
      callback(current.value, current.priority, index)
      current = current.forward[0]
      index++
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.header.forward[0]
    while (current !== null) {
      yield current.value
      current = current.forward[0]
    }
  }

  contains(value: T): boolean {
    return this.valueMap.has(value)
  }

  remove(value: T): boolean {
    const node = this.valueMap.get(value)
    if (node === undefined) {
      return false
    }

    const update: (SkipListNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipListNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i] !== node) {
        const nextNode = current.forward[i]!
        const cmp = this.comparator(nextNode.priority, node.priority)
        if (cmp < 0) {
          current = nextNode
        } else if (cmp === 0 && nextNode !== node) {
          current = nextNode
        } else {
          break
        }
      }
      update[i] = current
    }

    for (let i = 0; i < this.level; i++) {
      const updateNode = update[i]
      if (updateNode === null) break
      if (updateNode.forward[i] !== node) continue
      updateNode.forward[i] = node.forward[i]
    }

    while (this.level > 0 && this.header.forward[this.level - 1] === null) {
      this.level--
    }

    this._size--
    this.valueMap.delete(value)
    this.stats.removals++
    return true
  }

  updatePriority(value: T, newPriority: number): boolean {
    const node = this.valueMap.get(value)
    if (node === undefined) {
      return false
    }

    if (node.priority === newPriority) {
      return true
    }

    this.remove(value)
    this.enqueue(value, newPriority)
    this.stats.updates++
    return true
  }

  getPriority(value: T): number | undefined {
    const node = this.valueMap.get(value)
    return node !== undefined ? node.priority : undefined
  }

  findByPriority(priority: number): T[] {
    const result: T[] = []
    let current: SkipListNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.priority, priority) < 0) {
        current = current.forward[i]!
      }
    }

    let node = current.forward[0]
    while (node !== null && this.comparator(node.priority, priority) === 0) {
      result.push(node.value)
      node = node.forward[0]
    }

    return result
  }

  rangeByPriority(min: number, max: number): T[] {
    const result: T[] = []
    const startBound = this.comparator(0, 1) < 0 ? min : max
    let current: SkipListNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.priority, startBound) < 0) {
        current = current.forward[i]!
      }
    }

    let node = current.forward[0]
    while (node !== null && node.priority >= min && node.priority <= max) {
      result.push(node.value)
      node = node.forward[0]
    }

    return result
  }

  getStatistics(): SkipListQueueStatistics {
    return { ...this.stats, maxLevel: Math.max(this.stats.maxLevel, this.level) }
  }

  private createNode(value: T, priority: number, level: number): SkipListNode<T> {
    return {
      value,
      priority,
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

export type { SkipListQueueOptions, SkipListQueueStatistics } from './types.js'
export { DEFAULT_SKIP_LIST_QUEUE_OPTIONS } from './types.js'
