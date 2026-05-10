import type { LockFreeQueueOptions, LockFreeQueueJSON, LockFreeQueueStatistics } from './types.js'
import { DEFAULT_LOCK_FREE_QUEUE_OPTIONS } from './types.js'

interface VersionedPointer<T> {
  node: QueueNode<T> | null
  version: number
}

class QueueNode<T> {
  value: T
  next: QueueNode<T> | null
  constructor(value: T) {
    this.value = value
    this.next = null
  }
}

export class LockFreeQueue<T = unknown> {
  private head: VersionedPointer<T>
  private tail: VersionedPointer<T>
  private _size: number = 0
  private _options: Required<LockFreeQueueOptions>
  private _stats: LockFreeQueueStatistics = {
    enqueues: 0,
    dequeues: 0,
    casFailures: 0,
    maxSize: 0,
    totalSpinAttempts: 0,
    currentSize: 0,
  }

  constructor(options?: LockFreeQueueOptions) {
    this._options = { ...DEFAULT_LOCK_FREE_QUEUE_OPTIONS, ...options }
    const sentinel = new QueueNode<T | null>(null) as QueueNode<T>
    this.head = { node: sentinel, version: 0 }
    this.tail = { node: sentinel, version: 0 }
  }

  enqueue(value: T): void {
    const newNode = new QueueNode(value)
    let spinAttempts = 0
    let success = false
    while (!success) {
      spinAttempts++
      const tailSnapshot = { ...this.tail }
      const next = tailSnapshot.node!.next
      if (tailSnapshot.version === this.tail.version && tailSnapshot.node === this.tail.node) {
        if (next === null) {
          if (this.simulateCasFailure()) {
            if (this._options.trackStatistics) {
              this._stats.casFailures++
            }
            continue
          }
          tailSnapshot.node!.next = newNode
          success = true
        } else {
          this.casTail(tailSnapshot, { node: next, version: tailSnapshot.version + 1 })
        }
      }
    }
    this.casTail(
      { node: this.tail.node, version: this.tail.version },
      { node: newNode, version: this.tail.version + 1 },
    )
    this._size++
    if (this._options.trackStatistics) {
      this._stats.enqueues++
      this._stats.currentSize = this._size
      if (this._size > this._stats.maxSize) {
        this._stats.maxSize = this._size
      }
      this._stats.totalSpinAttempts += spinAttempts
    }
  }

  dequeue(): T | undefined {
    let spinAttempts = 0
    while (true) {
      spinAttempts++
      const headSnapshot = { ...this.head }
      const tailSnapshot = { ...this.tail }
      const next = headSnapshot.node!.next
      if (headSnapshot.version === this.head.version && headSnapshot.node === this.head.node) {
        if (headSnapshot.node === tailSnapshot.node) {
          if (next === null) {
            if (this._options.trackStatistics) {
              this._stats.totalSpinAttempts += spinAttempts
            }
            return undefined
          }
          this.casTail(tailSnapshot, { node: next, version: tailSnapshot.version + 1 })
        } else {
          if (next === null) {
            if (this._options.trackStatistics) {
              this._stats.totalSpinAttempts += spinAttempts
            }
            return undefined
          }
          const value = next.value
          if (this.simulateCasFailure()) {
            if (this._options.trackStatistics) {
              this._stats.casFailures++
            }
            continue
          }
          this.casHead(headSnapshot, { node: next, version: headSnapshot.version + 1 })
          this._size--
          if (this._options.trackStatistics) {
            this._stats.dequeues++
            this._stats.currentSize = this._size
            this._stats.totalSpinAttempts += spinAttempts
          }
          return value
        }
      }
    }
  }

  peek(): T | undefined {
    const next = this.head.node!.next
    if (next === null) {
      return undefined
    }
    return next.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    const sentinel = new QueueNode<T | null>(null) as QueueNode<T>
    this.head = { node: sentinel, version: this.head.version + 1 }
    this.tail = { node: sentinel, version: this.tail.version + 1 }
    this._size = 0
    if (this._options.trackStatistics) {
      this._stats.currentSize = 0
    }
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head.node!.next
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head.node!.next
    let index = 0
    while (current !== null) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head.node!.next
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  contains(value: T): boolean {
    let current = this.head.node!.next
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

  enqueueMany(values: Iterable<T>): void {
    for (const value of values) {
      this.enqueue(value)
    }
  }

  tryDequeue(): { success: boolean; value: T | undefined } {
    if (this.isEmpty) {
      return { success: false, value: undefined }
    }
    const value = this.dequeue()
    if (value === undefined) {
      return { success: false, value: undefined }
    }
    return { success: true, value }
  }

  getStatistics(): LockFreeQueueStatistics {
    if (!this._options.trackStatistics) {
      return {
        enqueues: 0,
        dequeues: 0,
        casFailures: 0,
        maxSize: 0,
        totalSpinAttempts: 0,
        currentSize: this._size,
      }
    }
    return { ...this._stats, currentSize: this._size }
  }

  toJSON(): LockFreeQueueJSON<T> {
    return {
      items: this.toArray(),
      options: { ...this._options },
      statistics: this.getStatistics(),
    }
  }

  static fromJSON<T>(data: LockFreeQueueJSON<T>): LockFreeQueue<T> {
    const queue = new LockFreeQueue<T>(data.options)
    for (const item of data.items) {
      queue.enqueue(item)
    }
    return queue
  }

  private casHead(expected: VersionedPointer<T>, desired: VersionedPointer<T>): boolean {
    if (this.head.version === expected.version && this.head.node === expected.node) {
      this.head = desired
      return true
    }
    return false
  }

  private casTail(expected: VersionedPointer<T>, desired: VersionedPointer<T>): boolean {
    if (this.tail.version === expected.version && this.tail.node === expected.node) {
      this.tail = desired
      return true
    }
    return false
  }

  private simulateCasFailure(): boolean {
    if (!this._options.simulateCasFailures) {
      return false
    }
    return Math.random() < 0.1
  }
}

export { DEFAULT_LOCK_FREE_QUEUE_OPTIONS } from './types.js'
export type { LockFreeQueueOptions, LockFreeQueueJSON, LockFreeQueueStatistics } from './types.js'
