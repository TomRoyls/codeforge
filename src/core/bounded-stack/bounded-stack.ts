import type { BoundedStackOptions, BoundedStackStats } from './types.js'
import { DEFAULT_BOUNDED_STACK_OPTIONS } from './types.js'

export class BoundedStack<T = unknown> {
  private _capacity: number
  private _size: number = 0
  private _totalPushed: number = 0
  private _totalPopped: number = 0
  private _totalEvicted: number = 0
  private items: T[] = []

  constructor(options?: Partial<BoundedStackOptions>) {
    const resolved = { ...DEFAULT_BOUNDED_STACK_OPTIONS, ...options }
    this._capacity = Math.max(1, resolved.capacity)
  }

  push(value: T): T | undefined {
    let evicted: T | undefined
    if (this._size === this._capacity) {
      evicted = this.items.shift()
      this._size--
      this._totalEvicted++
    }
    this.items.push(value)
    this._size++
    this._totalPushed++
    return evicted
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.items.pop()!
    this._size--
    this._totalPopped++
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.items[this._size - 1]
  }

  peekBottom(): T | undefined {
    if (this._size === 0) return undefined
    return this.items[0]
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    this.items = []
    this._size = 0
  }

  clone(): BoundedStack<T> {
    const result = new BoundedStack<T>({ capacity: this._capacity })
    for (const item of this.items) {
      result.items.push(item)
    }
    result._size = this._size
    return result
  }

  toArray(): T[] {
    return [...this.items]
  }

  static from<T>(items: Iterable<T>, options?: Partial<BoundedStackOptions>): BoundedStack<T> {
    const resolved = { ...DEFAULT_BOUNDED_STACK_OPTIONS, ...options }
    const stack = new BoundedStack<T>({ capacity: resolved.capacity })
    for (const item of items) {
      stack.push(item)
    }
    return stack
  }

  contains(value: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.items[i] === value) {
        return true
      }
    }
    return false
  }

  indexOf(value: T): number {
    for (let i = this._size - 1; i >= 0; i--) {
      if (this.items[i] === value) {
        return this._size - 1 - i
      }
    }
    return -1
  }

  stats(): BoundedStackStats {
    return {
      capacity: this._capacity,
      size: this._size,
      isEmpty: this._size === 0,
      isFull: this._size === this._capacity,
      totalPushed: this._totalPushed,
      totalPopped: this._totalPopped,
      totalEvicted: this._totalEvicted,
      utilization: this._capacity === 0 ? 0 : this._size / this._capacity,
    }
  }
}

export { DEFAULT_BOUNDED_STACK_OPTIONS } from './types.js'
export type { BoundedStackOptions, BoundedStackStats } from './types.js'
