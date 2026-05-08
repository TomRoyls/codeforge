import type { SkipNode, SkipListOptions, SkipListStats } from './types.js'
import { DEFAULT_SKIP_LIST_OPTIONS } from './types.js'

export class SkipList<T> {
  private header: SkipNode<T>
  private maxLevel: number
  private probability: number
  private level: number = 0
  private _size: number = 0

  constructor(options?: Partial<SkipListOptions>) {
    const opts: SkipListOptions = { ...DEFAULT_SKIP_LIST_OPTIONS, ...options }
    this.maxLevel = opts.maxLevel
    this.probability = opts.probability
    this.header = this.createNode(0, null as T, this.maxLevel)
  }

  insert(key: number, value: T): void {
    const update: (SkipNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const next = current.forward[0] ?? null

    if (next !== null && next.key === key) {
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

    const newNode = this.createNode(key, value, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      newNode.forward[i] = updateNode.forward[i] ?? null
      updateNode.forward[i] = newNode
    }

    this._size++
  }

  search(key: number): T | undefined {
    let current: SkipNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
    }

    const found = current.forward[0] ?? null
    if (found !== null && found.key === key) {
      return found.value
    }
    return undefined
  }

  delete(key: number): boolean {
    const update: (SkipNode<T> | null)[] = new Array(this.maxLevel).fill(null)
    let current: SkipNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    const target = current.forward[0] ?? null

    if (target === null || target.key !== key) {
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

  has(key: number): boolean {
    let current: SkipNode<T> | null = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i]!.key < key) {
        current = current.forward[i]!
      }
    }
    const found = current.forward[0] ?? null
    return found !== null && found.key === key
  }

  getMin(): T | undefined {
    const first = this.header.forward[0] ?? null
    return first !== null ? first.value : undefined
  }

  getMax(): T | undefined {
    if (this._size === 0) {
      return undefined
    }

    let current: SkipNode<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null) {
        current = current.forward[i]!
      }
    }
    return current.value
  }

  range(min: number, max: number): T[] {
    const result: T[] = []
    let current: SkipNode<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] != null && current.forward[i]!.key < min) {
        current = current.forward[i]!
      }
    }

    let node = current.forward[0] ?? null
    while (node !== null && node.key <= max) {
      result.push(node.value)
      node = node.forward[0] ?? null
    }

    return result
  }

  forEach(callback: (value: T, key: number) => void): void {
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      callback(current.value, current.key)
      current = current.forward[0] ?? null
    }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.header = this.createNode(0, null as T, this.maxLevel)
    this.level = 0
    this._size = 0
  }

  toArray(): [number, T][] {
    const result: [number, T][] = []
    let current = this.header.forward[0] ?? null
    while (current !== null) {
      result.push([current.key, current.value])
      current = current.forward[0] ?? null
    }
    return result
  }

  getStats(): SkipListStats {
    return {
      size: this._size,
      maxLevel: this.maxLevel,
      currentLevel: this.level,
      nodeCount: this._size,
    }
  }

  private createNode(key: number, value: T, level: number): SkipNode<T> {
    return {
      key,
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

export { DEFAULT_SKIP_LIST_OPTIONS } from './types.js'
export type { SkipNode, SkipListOptions, SkipListStats } from './types.js'
