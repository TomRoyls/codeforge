import type { SkipNode2, SkipList2Options } from './types.js'
import { DEFAULT_SKIPLIST2_OPTIONS } from './types.js'

export class SkipList2<T> {
  private header: SkipNode2<T>
  private maxLevel: number
  private probability: number
  private level: number = 0
  private _size: number = 0

  constructor(options?: Partial<SkipList2Options>) {
    const opts: SkipList2Options = { ...DEFAULT_SKIPLIST2_OPTIONS, ...options }
    this.maxLevel = opts.maxLevel
    this.probability = opts.probability
    this.header = this.createNode(0, null as T, this.maxLevel)
  }

  insert(key: number, value: T): void {
    const update: Array<SkipNode2<T> | null> = new Array(this.maxLevel).fill(null)
    let current: SkipNode2<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null && current.next[i]!.key < key) {
        current = current.next[i]!
      }
      update[i] = current
    }

    const nextNode = current.next[0] ?? null

    if (nextNode !== null && nextNode.key === key) {
      nextNode.value = value
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
      newNode.next[i] = updateNode.next[i] ?? null
      newNode.prev[i] = updateNode
      if (updateNode.next[i] != null) {
        updateNode.next[i]!.prev[i] = newNode
      }
      updateNode.next[i] = newNode
    }

    this._size++
  }

  search(key: number): T | undefined {
    let current: SkipNode2<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null && current.next[i]!.key < key) {
        current = current.next[i]!
      }
    }

    const found = current.next[0] ?? null
    if (found !== null && found.key === key) {
      return found.value
    }
    return undefined
  }

  delete(key: number): boolean {
    const update: Array<SkipNode2<T> | null> = new Array(this.maxLevel).fill(null)
    let current: SkipNode2<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null && current.next[i]!.key < key) {
        current = current.next[i]!
      }
      update[i] = current
    }

    const target = current.next[0] ?? null

    if (target === null || target.key !== key) {
      return false
    }

    for (let i = 0; i < this.level; i++) {
      const updateNode = update[i]
      if (updateNode == null) break
      if (updateNode.next[i] !== target) break
      updateNode.next[i] = target.next[i] ?? null
      if (target.next[i] != null) {
        target.next[i]!.prev[i] = updateNode
      }
    }

    while (this.level > 0 && this.header.next[this.level - 1] == null) {
      this.level--
    }

    this._size--
    return true
  }

  has(key: number): boolean {
    let current: SkipNode2<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null && current.next[i]!.key < key) {
        current = current.next[i]!
      }
    }
    const found = current.next[0] ?? null
    return found !== null && found.key === key
  }

  getMin(): { key: number; value: T } | undefined {
    const first = this.header.next[0] ?? null
    if (first !== null) {
      return { key: first.key, value: first.value }
    }
    return undefined
  }

  getMax(): { key: number; value: T } | undefined {
    if (this._size === 0) {
      return undefined
    }

    let current: SkipNode2<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null) {
        current = current.next[i]!
      }
    }
    return { key: current.key, value: current.value }
  }

  range(min: number, max: number): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = []
    let current: SkipNode2<T> = this.header

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null && current.next[i]!.key < min) {
        current = current.next[i]!
      }
    }

    let node = current.next[0] ?? null
    while (node !== null && node.key <= max) {
      result.push({ key: node.key, value: node.value })
      node = node.next[0] ?? null
    }

    return result
  }

  forEach(callback: (key: number, value: T) => void): void {
    let current = this.header.next[0] ?? null
    while (current !== null) {
      callback(current.key, current.value)
      current = current.next[0] ?? null
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

  toArray(): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = []
    let current = this.header.next[0] ?? null
    while (current !== null) {
      result.push({ key: current.key, value: current.value })
      current = current.next[0] ?? null
    }
    return result
  }

  containsRange(min: number, max: number): boolean {
    if (this._size === 0 || min > max) {
      return false
    }

    let current: SkipNode2<T> = this.header
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] != null && current.next[i]!.key < min) {
        current = current.next[i]!
      }
    }

    let node = current.next[0] ?? null
    let expected = min
    while (node !== null && node.key <= max && expected <= max) {
      if (node.key !== expected) {
        return false
      }
      expected++
      node = node.next[0] ?? null
    }

    return expected > max
  }

  private createNode(key: number, value: T, level: number): SkipNode2<T> {
    return {
      key,
      value,
      prev: new Array(level).fill(null),
      next: new Array(level).fill(null),
      level,
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

export { DEFAULT_SKIPLIST2_OPTIONS } from './types.js'
export type { SkipNode2, SkipList2Options } from './types.js'
