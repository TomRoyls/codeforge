import type { LatchFreeStackOptions, LatchFreeStackStatistics } from './types.js'
import { DEFAULT_LATCH_FREE_STACK_OPTIONS } from './types.js'

interface StackNode<T> {
  value: T
  next: StackNode<T> | null
}

interface StackTop<T> {
  node: StackNode<T> | null
  version: number
}

interface SerializedStack<T> {
  values: T[]
  statistics: LatchFreeStackStatistics
}

export class LatchFreeStack<T = unknown> {
  private top: StackTop<T>
  private _size: number = 0
  private options: LatchFreeStackOptions
  private stats: LatchFreeStackStatistics
  private operationCasFailures: number = 0

  constructor(options?: Partial<LatchFreeStackOptions>) {
    this.options = { ...DEFAULT_LATCH_FREE_STACK_OPTIONS, ...options }
    this.top = { node: null, version: 0 }
    this.operationCasFailures = 0
    this.stats = {
      pushes: 0,
      pops: 0,
      casFailures: 0,
      maxSize: 0,
      currentSize: 0,
      totalSpinAttempts: 0,
    }
  }

  private casCompareAndSet(expectedNode: StackNode<T> | null, expectedVersion: number, newNode: StackNode<T> | null): boolean {
    if (this.top.node === expectedNode && this.top.version === expectedVersion) {
      if (this.operationCasFailures < this.options.simulateCasFailures) {
        this.operationCasFailures++
        if (this.options.trackStatistics) {
          this.stats.casFailures++
        }
        return false
      }
      this.top = { node: newNode, version: expectedVersion + 1 }
      return true
    }
    if (this.options.trackStatistics) {
      this.stats.casFailures++
    }
    return false
  }

  push(value: T): void {
    const newNode: StackNode<T> = { value, next: null }
    this.operationCasFailures = 0
    while (true) {
      if (this.options.trackStatistics) {
        this.stats.totalSpinAttempts++
      }
      const currentTop = this.top
      newNode.next = currentTop.node
      if (this.casCompareAndSet(currentTop.node, currentTop.version, newNode)) {
        this._size++
        if (this.options.trackStatistics) {
          this.stats.pushes++
          this.stats.currentSize = this._size
          if (this._size > this.stats.maxSize) {
            this.stats.maxSize = this._size
          }
        }
        return
      }
    }
  }

  pop(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this.operationCasFailures = 0
    while (true) {
      if (this.options.trackStatistics) {
        this.stats.totalSpinAttempts++
      }
      const currentTop = this.top
      if (currentTop.node === null) {
        return undefined
      }
      const newNext = currentTop.node.next
      if (this.casCompareAndSet(currentTop.node, currentTop.version, newNext)) {
        const value = currentTop.node.value
        this._size--
        if (this.options.trackStatistics) {
          this.stats.pops++
          this.stats.currentSize = this._size
        }
        return value
      }
    }
  }

  peek(): T | undefined {
    const currentTop = this.top
    if (currentTop.node === null) {
      return undefined
    }
    return currentTop.node.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.top = { node: null, version: this.top.version + 1 }
    this._size = 0
    if (this.options.trackStatistics) {
      this.stats.currentSize = 0
    }
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.top.node
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.top.node
    let index = 0
    while (current !== null) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  [Symbol.iterator](): Iterator<T> {
    const copy = this.toArray()
    let index = 0
    return {
      next(): IteratorResult<T> {
        if (index < copy.length) {
          return { value: copy[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  contains(value: T): boolean {
    let current = this.top.node
    while (current !== null) {
      if (current.value === value) {
        return true
      }
      current = current.next
    }
    return false
  }

  drain(): T[] {
    const result = this.toArray()
    this.clear()
    return result
  }

  pushMany(values: Iterable<T>): void {
    for (const value of values) {
      this.push(value)
    }
  }

  tryPop(): { success: boolean; value: T | undefined } {
    if (this._size === 0) {
      return { success: false, value: undefined }
    }
    const value = this.pop()
    if (value === undefined) {
      return { success: false, value: undefined }
    }
    return { success: true, value }
  }

  getStatistics(): LatchFreeStackStatistics {
    if (this.options.trackStatistics) {
      return { ...this.stats, currentSize: this._size }
    }
    return { ...this.stats }
  }

  toJSON(): SerializedStack<T> {
    return {
      values: this.toArray(),
      statistics: { ...this.stats, currentSize: this._size },
    }
  }

  static fromJSON<T>(data: SerializedStack<T>): LatchFreeStack<T> {
    const stack = new LatchFreeStack<T>({ trackStatistics: false })
    const values = [...data.values].reverse()
    for (const value of values) {
      stack.push(value)
    }
    stack._size = data.values.length
    if (data.statistics) {
      stack.stats = { ...data.statistics, currentSize: data.values.length }
    }
    return stack
  }
}

export { DEFAULT_LATCH_FREE_STACK_OPTIONS } from './types.js'
export type { LatchFreeStackOptions, LatchFreeStackStatistics } from './types.js'
