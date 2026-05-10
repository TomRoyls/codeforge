import type { SkipQueueNode, SkipQueueOptions, SkipQueueStats } from './types.js'

const DEFAULT_MAX_LEVEL = 16
const DEFAULT_PROBABILITY = 0.5
const DEFAULT_COMPARATOR = (a: number, b: number): number => a - b
const DEFAULT_IDENTITY = <T>(item: T): string | number => {
  if (typeof item === 'object' && item !== null) {
    return JSON.stringify(item)
  }
  return item as string | number
}

export class SkipQueue<T> {
  private header: SkipQueueNode<T>
  private maxLevel: number
  private probability: number
  private compare: (a: number, b: number) => number
  private identity: (item: T) => string | number
  private level: number = 0
  private _size: number = 0
  private itemMap: Map<string | number, { item: T; priority: number; node: SkipQueueNode<T> }> = new Map()

  constructor(options?: SkipQueueOptions<T>) {
    this.maxLevel = options?.maxLevel ?? DEFAULT_MAX_LEVEL
    this.probability = options?.probability ?? DEFAULT_PROBABILITY
    this.compare = options?.comparator ?? DEFAULT_COMPARATOR
    this.identity = options?.identity ?? DEFAULT_IDENTITY
    this.header = this.createNode(null as T, 0, this.maxLevel)
  }

  enqueue(item: T, priority: number): void {
    const id = this.identity(item)

    if (this.itemMap.has(id)) {
      this.remove(item)
    }

    const update: (SkipQueueNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipQueueNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.priority, priority) < 0) {
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

    const newNode = this.createNode(item, priority, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      newNode.forward[i] = updateNode.forward[i] ?? null
      updateNode.forward[i] = newNode
    }

    this._size++
    this.itemMap.set(id, { item, priority, node: newNode })
  }

  dequeue(): T | undefined {
    const first = this.header.forward[0] ?? null
    if (first === null) return undefined

    const id = this.identity(first.item)
    this.itemMap.delete(id)

    for (let i = 0; i < this.level; i++) {
      const headerFwd = this.header.forward[i]
      if (headerFwd !== first) break
      this.header.forward[i] = first.forward[i] ?? null
    }

    while (this.level > 0 && this.header.forward[this.level - 1] == null) {
      this.level--
    }

    this._size--
    return first.item
  }

  peek(): T | undefined {
    const first = this.header.forward[0] ?? null
    return first !== null ? first.item : undefined
  }

  peekPriority(): number | undefined {
    const first = this.header.forward[0] ?? null
    return first !== null ? first.priority : undefined
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
    this.itemMap.clear()
  }

  clone(): SkipQueue<T> {
    const result = new SkipQueue<T>({
      maxLevel: this.maxLevel,
      probability: this.probability,
      comparator: this.compare,
      identity: this.identity,
    })
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      result.enqueue(current.item, current.priority)
      current = current.forward[0] ?? null
    }
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      result.push(current.item)
      current = current.forward[0] ?? null
    }
    return result
  }

  toSortedArray(): T[] {
    return this.toArray()
  }

  decreaseKey(item: T, newPriority: number): void {
    const id = this.identity(item)
    const entry = this.itemMap.get(id)
    if (entry == null) return

    const currentPriority = entry.priority
    if (this.compare(newPriority, currentPriority) >= 0) return

    this.remove(item)
    this.enqueue(item, newPriority)
  }

  changePriority(item: T, newPriority: number): void {
    const id = this.identity(item)
    if (!this.itemMap.has(id)) return

    this.remove(item)
    this.enqueue(item, newPriority)
  }

  remove(item: T): boolean {
    const id = this.identity(item)
    const entry = this.itemMap.get(id)
    if (entry == null) return false

    const target = entry.node
    const priority = target.priority

    const update: (SkipQueueNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipQueueNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && this.compare(current.forward[i]!.priority, priority) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    let found = current.forward[0] ?? null
    while (found !== null && found.priority === priority && this.identity(found.item) !== id) {
      current = found
      for (let i = 0; i < this.level; i++) {
        const u = update[i]
        if (u != null && u.forward[i] === found) {
          update[i] = found
        } else if (u != null && u.forward[i] != null && this.compare(u.forward[i]!.priority, priority) <= 0) {
          update[i] = u.forward[i]!
        }
      }
      found = found.forward[0] ?? null
    }

    if (found === null || this.identity(found.item) !== id) {
      this.itemMap.delete(id)
      this._size--
      return true
    }

    for (let i = 0; i < this.level; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      if (updateNode.forward[i] !== found) break
      updateNode.forward[i] = found.forward[i] ?? null
    }

    while (this.level > 0 && this.header.forward[this.level - 1] == null) {
      this.level--
    }

    this.itemMap.delete(id)
    this._size--
    return true
  }

  contains(item: T): boolean {
    const id = this.identity(item)
    return this.itemMap.has(id)
  }

  static from<V>(items: Array<{ item: V; priority: number }>, options?: SkipQueueOptions<V>): SkipQueue<V> {
    const queue = new SkipQueue<V>(options)
    for (const entry of items) {
      queue.enqueue(entry.item, entry.priority)
    }
    return queue
  }

  stats(): SkipQueueStats {
    const nodeLevels: number[] = new Array(this.maxLevel).fill(0)
    let current: SkipQueueNode<T> | null = this.header.forward[0]!
    while (current !== null) {
      const fwd: (SkipQueueNode<T> | null)[] = (current as SkipQueueNode<T>).forward
      if (fwd.length < nodeLevels.length) {
        nodeLevels[fwd.length] = (nodeLevels[fwd.length] ?? 0) + 1
      }
      current = fwd[0] ?? null
    }

    return {
      size: this._size,
      maxLevel: this.maxLevel,
      currentLevel: this.level,
      probability: this.probability,
      nodeLevels,
    }
  }

  private createNode(item: T, priority: number, level: number): SkipQueueNode<T> {
    return {
      item,
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

export type { SkipQueueNode, SkipQueueOptions, SkipQueueStats } from './types.js'
