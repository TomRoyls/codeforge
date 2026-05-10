import type { SortedListOptions, SortedListJSON, SortedListStatistics } from './types.js'
import { DEFAULT_SORTED_LIST_OPTIONS } from './types.js'

class ListNode<T> {
  value: T
  prev: ListNode<T> | null = null
  next: ListNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}

export class SortedLinkedList<T = number> {
  private head: ListNode<T> | null = null
  private tail: ListNode<T> | null = null
  private _size: number = 0
  private _comparator: (a: T, b: T) => number
  private _stats: SortedListStatistics = {
    inserts: 0,
    removes: 0,
    finds: 0,
    merges: 0,
    maxSize: 0,
  }

  constructor(options?: SortedListOptions<T>) {
    const opts = { ...DEFAULT_SORTED_LIST_OPTIONS, ...options }
    this._comparator = opts.comparator as (a: T, b: T) => number
  }

  insert(value: T): void {
    const node = new ListNode(value)
    if (this.head === null) {
      this.head = node
      this.tail = node
    } else if (this._comparator(value, this.head.value) <= 0) {
      node.next = this.head
      this.head.prev = node
      this.head = node
    } else if (this._comparator(value, this.tail!.value) >= 0) {
      node.prev = this.tail
      this.tail!.next = node
      this.tail = node
    } else {
      let current = this.head
      while (current !== null && this._comparator(value, current.value) > 0) {
        current = current.next!
      }
      node.next = current
      node.prev = current.prev
      current.prev!.next = node
      current.prev = node
    }
    this._size++
    this._stats.inserts++
    if (this._size > this._stats.maxSize) {
      this._stats.maxSize = this._size
    }
  }

  remove(value: T): boolean {
    const node = this.findNode(value)
    if (node === null) return false
    this.removeNode(node)
    this._stats.removes++
    return true
  }

  removeAll(value: T): number {
    let count = 0
    let current = this.head
    while (current !== null) {
      const next = current.next
      if (this._comparator(current.value, value) === 0) {
        this.removeNode(current)
        count++
      } else if (count > 0) {
        break
      }
      current = next
    }
    this._stats.removes += count
    return count
  }

  has(value: T): boolean {
    this._stats.finds++
    return this.findNode(value) !== null
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const node = this.nodeAt(index)
    return node?.value
  }

  indexOf(value: T): number {
    this._stats.finds++
    let idx = 0
    let current = this.head
    while (current !== null) {
      if (this._comparator(current.value, value) === 0) return idx
      if (this._comparator(current.value, value) > 0) break
      current = current.next
      idx++
    }
    return -1
  }

  first(): T | undefined {
    return this.head?.value
  }

  last(): T | undefined {
    return this.tail?.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.head = null
    this.tail = null
    this._size = 0
    this._stats = {
      inserts: 0,
      removes: 0,
      finds: 0,
      merges: 0,
      maxSize: 0,
    }
  }

  toArray(): T[] {
    const arr: T[] = []
    let current = this.head
    while (current !== null) {
      arr.push(current.value)
      current = current.next
    }
    return arr
  }

  range(start: number, end: number): T[] {
    const result: T[] = []
    if (start < 0) start = 0
    if (end > this._size) end = this._size
    if (start >= end) return result

    let idx = 0
    let current = this.head
    while (current !== null && idx < end) {
      if (idx >= start) {
        result.push(current.value)
      }
      current = current.next
      idx++
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = []
    let idx = 0
    let current = this.head
    while (current !== null) {
      if (predicate(current.value, idx)) {
        result.push(current.value)
      }
      current = current.next
      idx++
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    let current = this.head
    while (current !== null) {
      callback(current.value, idx)
      current = current.next
      idx++
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  *reverseIterator(): Iterator<T> {
    let current = this.tail
    while (current !== null) {
      yield current.value
      current = current.prev
    }
  }

  count(value: T): number {
    this._stats.finds++
    let c = 0
    let current = this.head
    while (current !== null) {
      if (this._comparator(current.value, value) === 0) {
        c++
      } else if (c > 0) {
        break
      }
      if (this._comparator(current.value, value) > 0) break
      current = current.next
    }
    return c
  }

  lowerBound(value: T): number {
    let idx = 0
    let current = this.head
    while (current !== null) {
      if (this._comparator(current.value, value) >= 0) return idx
      current = current.next
      idx++
    }
    return this._size
  }

  upperBound(value: T): number {
    let idx = 0
    let current = this.head
    while (current !== null) {
      if (this._comparator(current.value, value) > 0) return idx
      current = current.next
      idx++
    }
    return this._size
  }

  merge(other: SortedLinkedList<T>): void {
    for (const value of other) {
      this.insert(value)
    }
    this._stats.merges++
  }

  unique(): void {
    let current = this.head
    while (current !== null) {
      const next = current.next
      if (next !== null && this._comparator(current.value, next.value) === 0) {
        this.removeNode(next)
      }
      current = next
    }
  }

  getStatistics(): SortedListStatistics {
    return { ...this._stats }
  }

  toJSON(): SortedListJSON<T> {
    return {
      values: this.toArray(),
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T>(data: SortedListJSON<T>, options?: SortedListOptions<T>): SortedLinkedList<T> {
    const list = new SortedLinkedList<T>(options)
    for (const value of data.values) {
      list.insert(value)
    }
    list._stats = { ...data.statistics }
    return list
  }

  private findNode(value: T): ListNode<T> | null {
    let current = this.head
    while (current !== null) {
      if (this._comparator(current.value, value) === 0) return current
      if (this._comparator(current.value, value) > 0) break
      current = current.next
    }
    return null
  }

  private removeNode(node: ListNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }
    if (node.next !== null) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
    this._size--
  }

  private nodeAt(index: number): ListNode<T> | null {
    if (index < this._size / 2) {
      let current = this.head
      for (let i = 0; i < index && current !== null; i++) {
        current = current.next
      }
      return current
    }
    let current = this.tail
    for (let i = this._size - 1; i > index && current !== null; i--) {
      current = current.prev
    }
    return current
  }
}

export { DEFAULT_SORTED_LIST_OPTIONS } from './types.js'
export type { SortedListOptions, SortedListJSON, SortedListStatistics } from './types.js'
