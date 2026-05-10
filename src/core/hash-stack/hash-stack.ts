import type { HashStackStats } from './types.js'

export class HashStack<T = unknown> {
  private items: T[] = []
  private itemSet: Set<T> = new Set()
  private _totalPushed: number = 0
  private _totalPopped: number = 0

  push(item: T): number {
    this.items.push(item)
    this.itemSet.add(item)
    this._totalPushed++
    return this.items.length
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined
    const value = this.items.pop()!
    this._totalPopped++
    this.rebuildSet()
    return value
  }

  peek(): T | undefined {
    if (this.items.length === 0) return undefined
    return this.items[this.items.length - 1]
  }

  has(item: T): boolean {
    return this.itemSet.has(item)
  }

  get size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  clear(): void {
    this.items = []
    this.itemSet.clear()
  }

  clone(): HashStack<T> {
    const result = new HashStack<T>()
    result.items = [...this.items]
    result.itemSet = new Set(this.itemSet)
    result._totalPushed = this._totalPushed
    result._totalPopped = this._totalPopped
    return result
  }

  toArray(): T[] {
    return [...this.items]
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]!
      callback(item, i)
    }
  }

  static from<T>(items: Iterable<T>): HashStack<T> {
    const stack = new HashStack<T>()
    for (const item of items) {
      stack.push(item)
    }
    return stack
  }

  reverse(): void {
    this.items.reverse()
  }

  containsAll(items: Iterable<T>): boolean {
    for (const item of items) {
      if (!this.itemSet.has(item)) return false
    }
    return true
  }

  removeAll(predicate: (item: T) => boolean): T[] {
    const removed: T[] = []
    const kept: T[] = []
    for (const item of this.items) {
      if (predicate(item)) {
        removed.push(item)
      } else {
        kept.push(item)
      }
    }
    this.items = kept
    this.rebuildSet()
    return removed
  }

  stats(): HashStackStats {
    return {
      size: this.items.length,
      isEmpty: this.items.length === 0,
      uniqueCount: this.itemSet.size,
      totalPushed: this._totalPushed,
      totalPopped: this._totalPopped,
    }
  }

  private rebuildSet(): void {
    this.itemSet = new Set(this.items)
  }
}

export type { HashStackStats } from './types.js'
