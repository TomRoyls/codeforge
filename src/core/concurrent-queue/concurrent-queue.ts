import type { ConcurrentQueueOptions, ConcurrentQueueStats } from './types.js'
import { DEFAULT_CONCURRENT_QUEUE_OPTIONS } from './types.js'

interface Node<T> {
  value: T
  next: Node<T> | null
}

export class ConcurrentQueue<T = unknown> {
  private head: Node<T> | null = null
  private tail: Node<T> | null = null
  private priorityHead: Node<T> | null = null
  private priorityTail: Node<T> | null = null
  private _size: number = 0
  private options: ConcurrentQueueOptions
  private _totalEnqueued: number = 0
  private _totalDequeued: number = 0
  private _totalRejected: number = 0
  private _priorityCount: number = 0

  constructor(options?: Partial<ConcurrentQueueOptions>) {
    this.options = { ...DEFAULT_CONCURRENT_QUEUE_OPTIONS, ...options }
  }

  enqueue(item: T): boolean {
    if (this._size >= this.options.maxSize) {
      this._totalRejected++
      return false
    }
    const node: Node<T> = { value: item, next: null }
    if (this.tail === null) {
      this.head = node
      this.tail = node
    } else {
      this.tail.next = node
      this.tail = node
    }
    this._size++
    this._totalEnqueued++
    return true
  }

  dequeue(): T | undefined {
    if (this.priorityHead !== null) {
      const node = this.priorityHead
      this.priorityHead = node.next
      if (this.priorityHead === null) {
        this.priorityTail = null
      }
      this._size--
      this._priorityCount--
      this._totalDequeued++
      return node.value
    }
    if (this.head === null) {
      return undefined
    }
    const node = this.head
    this.head = node.next
    if (this.head === null) {
      this.tail = null
    }
    this._size--
    this._totalDequeued++
    return node.value
  }

  peek(): T | undefined {
    if (this.priorityHead !== null) {
      return this.priorityHead.value
    }
    if (this.head === null) {
      return undefined
    }
    return this.head.value
  }

  enqueuePriority(item: T): void {
    const node: Node<T> = { value: item, next: this.priorityHead }
    this.priorityHead = node
    if (this.priorityTail === null) {
      this.priorityTail = node
    }
    this._size++
    this._priorityCount++
    this._totalEnqueued++
  }

  enqueueBatch(items: T[]): number {
    let count = 0
    for (const item of items) {
      if (this.enqueue(item)) {
        count++
      }
    }
    return count
  }

  dequeueBatch(count: number): T[] {
    const result: T[] = []
    const toDequeue = Math.min(count, this._size)
    for (let i = 0; i < toDequeue; i++) {
      const item = this.dequeue()
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size >= this.options.maxSize
  }

  clear(): void {
    this.head = null
    this.tail = null
    this.priorityHead = null
    this.priorityTail = null
    this._size = 0
    this._priorityCount = 0
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.priorityHead
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    current = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  clone(): ConcurrentQueue<T> {
    const cloned = new ConcurrentQueue<T>({ maxSize: this.options.maxSize })
    let current = this.head
    while (current !== null) {
      cloned.enqueue(current.value)
      current = current.next
    }
    const priorityItems: T[] = []
    current = this.priorityHead
    while (current !== null) {
      priorityItems.push(current.value)
      current = current.next
    }
    for (let i = priorityItems.length - 1; i >= 0; i--) {
      cloned.enqueuePriority(priorityItems[i]!)
    }
    return cloned
  }

  drain(): T[] {
    const result = this.toArray()
    this.clear()
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    let index = 0
    let current = this.priorityHead
    while (current !== null) {
      callback(current.value, index++)
      current = current.next
    }
    current = this.head
    while (current !== null) {
      callback(current.value, index++)
      current = current.next
    }
  }

  filter(predicate: (item: T) => boolean): T[] {
    const result: T[] = []
    this.forEach((item) => {
      if (predicate(item)) {
        result.push(item)
      }
    })
    return result
  }

  remove(predicate: (item: T) => boolean): number {
    let removed = 0
    const newPriorityHead = this.removeFromList(this.priorityHead, (node) => {
      this.priorityTail = node
    }, (count) => {
      removed += count
      this._priorityCount -= count
    }, predicate, true)
    this.priorityHead = newPriorityHead
    if (this.priorityHead === null) {
      this.priorityTail = null
    }

    const newHead = this.removeFromList(this.head, (node) => {
      this.tail = node
    }, (count) => {
      removed += count
    }, predicate, false)
    this.head = newHead
    if (this.head === null) {
      this.tail = null
    }

    this._size -= removed
    return removed
  }

  private removeFromList(
    listHead: Node<T> | null,
    setTail: (node: Node<T> | null) => void,
    onRemoved: (count: number) => void,
    predicate: (item: T) => boolean,
    isPriority: boolean,
  ): Node<T> | null {
    let removed = 0
    let current = listHead
    let prev: Node<T> | null = null
    let newHead: Node<T> | null = listHead

    while (current !== null) {
      if (predicate(current.value)) {
        removed++
        if (prev === null) {
          newHead = current.next
        } else {
          prev.next = current.next
        }
        if (current.next === null) {
          setTail(prev)
        }
        current = current.next
      } else {
        prev = current
        current = current.next
      }
    }

    if (removed > 0) {
      onRemoved(removed)
    }

    void isPriority
    return newHead
  }

  contains(item: T): boolean {
    let current = this.priorityHead
    while (current !== null) {
      if (current.value === item) {
        return true
      }
      current = current.next
    }
    current = this.head
    while (current !== null) {
      if (current.value === item) {
        return true
      }
      current = current.next
    }
    return false
  }

  [Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    let index = 0
    return {
      next(): IteratorResult<T> {
        if (index >= items.length) {
          return { value: undefined, done: true }
        }
        return { value: items[index++]!, done: false }
      },
    }
  }

  getStats(): ConcurrentQueueStats {
    return {
      size: this._size,
      isEmpty: this._size === 0,
      isFull: this._size >= this.options.maxSize,
      maxSize: this.options.maxSize,
      totalEnqueued: this._totalEnqueued,
      totalDequeued: this._totalDequeued,
      totalRejected: this._totalRejected,
      priorityCount: this._priorityCount,
    }
  }
}

export { DEFAULT_CONCURRENT_QUEUE_OPTIONS } from './types.js'
export type { ConcurrentQueueOptions, ConcurrentQueueStats } from './types.js'
