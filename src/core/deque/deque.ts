import type { DequeNode, DequeOptions } from './types.js'
import { DEFAULT_DEQUE_OPTIONS } from './types.js'

export class Deque<T = unknown> {
  private head: DequeNode<T> | null = null
  private tail: DequeNode<T> | null = null
  private _size: number = 0
  private options: DequeOptions

  constructor(options?: Partial<DequeOptions>) {
    this.options = { ...DEFAULT_DEQUE_OPTIONS, ...options }
  }

  pushFront(value: T): void {
    if (this.options.maxSize > 0 && this._size >= this.options.maxSize) {
      this.popBack()
    }
    const node: DequeNode<T> = { value, prev: null, next: this.head }
    if (this.head !== null) {
      this.head.prev = node
    }
    this.head = node
    if (this.tail === null) {
      this.tail = node
    }
    this._size++
  }

  pushBack(value: T): void {
    if (this.options.maxSize > 0 && this._size >= this.options.maxSize) {
      this.popFront()
    }
    const node: DequeNode<T> = { value, prev: this.tail, next: null }
    if (this.tail !== null) {
      this.tail.next = node
    }
    this.tail = node
    if (this.head === null) {
      this.head = node
    }
    this._size++
  }

  popFront(): T | undefined {
    if (this.head === null) {
      return undefined
    }
    const node = this.head
    this.head = node.next
    if (this.head !== null) {
      this.head.prev = null
    } else {
      this.tail = null
    }
    this._size--
    return node.value
  }

  popBack(): T | undefined {
    if (this.tail === null) {
      return undefined
    }
    const node = this.tail
    this.tail = node.prev
    if (this.tail !== null) {
      this.tail.next = null
    } else {
      this.head = null
    }
    this._size--
    return node.value
  }

  peekFront(): T | undefined {
    if (this.head === null) {
      return undefined
    }
    return this.head.value
  }

  peekBack(): T | undefined {
    if (this.tail === null) {
      return undefined
    }
    return this.tail.value
  }

  private getNodeAt(index: number): DequeNode<T> | null {
    if (index < 0 || index >= this._size) {
      return null
    }
    if (index < this._size / 2) {
      let current = this.head
      for (let i = 0; i < index; i++) {
        current = current!.next
      }
      return current
    }
    let current = this.tail
    for (let i = this._size - 1; i > index; i--) {
      current = current!.prev
    }
    return current
  }

  get(index: number): T | undefined {
    const node = this.getNodeAt(index)
    if (node === null) {
      return undefined
    }
    return node.value
  }

  set(index: number, value: T): boolean {
    const node = this.getNodeAt(index)
    if (node === null) {
      return false
    }
    node.value = value
    return true
  }

  insertAt(index: number, value: T): void {
    if (index <= 0) {
      this.pushFront(value)
      return
    }
    if (index >= this._size) {
      this.pushBack(value)
      return
    }
    const after = this.getNodeAt(index)
    if (after === null) {
      this.pushBack(value)
      return
    }
    if (this.options.maxSize > 0 && this._size >= this.options.maxSize) {
      this.popBack()
    }
    const before = after.prev
    const node: DequeNode<T> = { value, prev: before, next: after }
    if (before !== null) {
      before.next = node
    }
    after.prev = node
    this._size++
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    if (index === 0) {
      return this.popFront()
    }
    if (index === this._size - 1) {
      return this.popBack()
    }
    const node = this.getNodeAt(index)
    if (node === null) {
      return undefined
    }
    const before = node.prev
    const after = node.next
    if (before !== null) {
      before.next = after
    }
    if (after !== null) {
      after.prev = before
    }
    this._size--
    return node.value
  }

  indexOf(value: T): number {
    let current = this.head
    let index = 0
    while (current !== null) {
      if (current.value === value) {
        return index
      }
      current = current.next
      index++
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  fromArray(items: T[]): void {
    for (const item of items) {
      this.pushBack(item)
    }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.head = null
    this.tail = null
    this._size = 0
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head
    let index = 0
    while (current !== null) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  reverse(): void {
    let current = this.head
    while (current !== null) {
      const next = current.next
      current.next = current.prev
      current.prev = next
      current = next
    }
    const temp = this.head
    this.head = this.tail
    this.tail = temp
  }

  rotate(n: number): void {
    if (this._size <= 1) {
      return
    }
    const normalized = ((n % this._size) + this._size) % this._size
    if (normalized === 0) {
      return
    }
    for (let i = 0; i < normalized; i++) {
      const value = this.popFront()
      if (value !== undefined) {
        this.pushBack(value)
      }
    }
  }
}

export { DEFAULT_DEQUE_OPTIONS } from './types.js'
export type { DequeNode, DequeOptions } from './types.js'
