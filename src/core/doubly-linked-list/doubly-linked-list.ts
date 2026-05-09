import type { DoublyLinkedListOptions } from './types.js'

class ListNode<T> {
  value: T
  prev: ListNode<T> | null = null
  next: ListNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}

export class DoublyLinkedList<T = unknown> {
  private head: ListNode<T> | null = null
  private tail: ListNode<T> | null = null
  private _size: number = 0
  private comparator?: (a: T, b: T) => number

  constructor(options?: DoublyLinkedListOptions<T>) {
    this.comparator = options?.comparator
    if (options?.initialValues) {
      for (const value of options.initialValues) {
        this.pushBack(value)
      }
    }
  }

  pushFront(value: T): void {
    const node = new ListNode(value)
    if (this.head === null) {
      this.head = node
      this.tail = node
    } else {
      node.next = this.head
      this.head.prev = node
      this.head = node
    }
    this._size++
  }

  pushBack(value: T): void {
    const node = new ListNode(value)
    if (this.tail === null) {
      this.head = node
      this.tail = node
    } else {
      node.prev = this.tail
      this.tail.next = node
      this.tail = node
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

  private getNode(index: number): ListNode<T> | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    if (index < this._size / 2) {
      let current = this.head!
      for (let i = 0; i < index; i++) {
        current = current.next!
      }
      return current
    } else {
      let current = this.tail!
      for (let i = this._size - 1; i > index; i--) {
        current = current.prev!
      }
      return current
    }
  }

  get(index: number): T | undefined {
    const node = this.getNode(index)
    if (node === undefined) {
      return undefined
    }
    return node.value
  }

  set(index: number, value: T): boolean {
    const node = this.getNode(index)
    if (node === undefined) {
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
    const node = new ListNode(value)
    const current = this.getNode(index)!
    node.prev = current.prev
    node.next = current
    if (current.prev !== null) {
      current.prev.next = node
    }
    current.prev = node
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
    const node = this.getNode(index)!
    if (node.prev !== null) {
      node.prev.next = node.next
    }
    if (node.next !== null) {
      node.next.prev = node.prev
    }
    this._size--
    return node.value
  }

  private equals(a: T, b: T): boolean {
    if (this.comparator) {
      return this.comparator(a, b) === 0
    }
    return a === b
  }

  remove(value: T): boolean {
    let current = this.head
    while (current !== null) {
      if (this.equals(current.value, value)) {
        if (current.prev !== null) {
          current.prev.next = current.next
        } else {
          this.head = current.next
        }
        if (current.next !== null) {
          current.next.prev = current.prev
        } else {
          this.tail = current.prev
        }
        this._size--
        return true
      }
      current = current.next
    }
    return false
  }

  indexOf(value: T): number {
    let current = this.head
    let index = 0
    while (current !== null) {
      if (this.equals(current.value, value)) {
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

  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  fromArray(values: T[]): void {
    this.clear()
    for (const value of values) {
      this.pushBack(value)
    }
  }

  reverse(): void {
    if (this._size <= 1) {
      return
    }
    let current = this.head
    while (current !== null) {
      const temp = current.next
      current.next = current.prev
      current.prev = temp
      current = temp
    }
    const tempHead = this.head
    this.head = this.tail
    this.tail = tempHead
  }

  rotateLeft(n: number): void {
    if (this._size <= 1) {
      return
    }
    const rotations = ((n % this._size) + this._size) % this._size
    if (rotations === 0) {
      return
    }
    const newTail = this.getNode(rotations - 1)!
    const newHead = newTail.next!
    newTail.next = null
    newHead.prev = null
    if (this.tail !== null) {
      this.tail.next = this.head
    }
    if (this.head !== null) {
      this.head.prev = this.tail
    }
    this.head = newHead
    this.tail = newTail
  }

  rotateRight(n: number): void {
    if (this._size <= 1) {
      return
    }
    const rotations = ((n % this._size) + this._size) % this._size
    if (rotations === 0) {
      return
    }
    this.rotateLeft(this._size - rotations)
  }

  slice(start: number, end?: number): DoublyLinkedList<T> {
    const result = new DoublyLinkedList<T>({ comparator: this.comparator })
    if (this._size === 0) {
      return result
    }
    const normalizedStart = ((start % this._size) + this._size) % this._size
    const normalizedEnd = end === undefined ? this._size : ((end % this._size) + this._size) % this._size
    const sliceEnd = Math.min(normalizedEnd, this._size)
    for (let i = normalizedStart; i < sliceEnd; i++) {
      const node = this.getNode(i)
      if (node !== undefined) {
        result.pushBack(node.value)
      }
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const normalizedStart = Math.max(0, Math.min(start, this._size))
    const count = deleteCount === undefined ? this._size - normalizedStart : Math.max(0, deleteCount)
    const removed: T[] = []
    for (let i = 0; i < count && normalizedStart < this._size; i++) {
      const value = this.removeAt(normalizedStart)
      if (value !== undefined) {
        removed.push(value)
      }
    }
    for (let i = 0; i < items.length; i++) {
      this.insertAt(normalizedStart + i, items[i]!)
    }
    return removed
  }

  sort(comparator?: (a: T, b: T) => number): void {
    if (this._size <= 1) {
      return
    }
    const cmp = comparator ?? this.comparator ?? ((a: T, b: T) => (a as number) - (b as number))
    const arr = this.toArray()
    arr.sort(cmp)
    this.fromArray(arr)
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

  forEachReverse(callback: (value: T, index: number) => void): void {
    let current = this.tail
    let index = this._size - 1
    while (current !== null) {
      callback(current.value, index)
      current = current.prev
      index--
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  clone(): DoublyLinkedList<T> {
    return new DoublyLinkedList<T>({
      initialValues: this.toArray(),
      comparator: this.comparator,
    })
  }

  merge(other: DoublyLinkedList<T>): DoublyLinkedList<T> {
    const result = new DoublyLinkedList<T>({
      initialValues: this.toArray(),
      comparator: this.comparator,
    })
    const otherValues = other.toArray()
    for (const value of otherValues) {
      result.pushBack(value)
    }
    return result
  }

  find(callback: (value: T, index: number) => boolean): T | undefined {
    let current = this.head
    let index = 0
    while (current !== null) {
      if (callback(current.value, index)) {
        return current.value
      }
      current = current.next
      index++
    }
    return undefined
  }

  filter(callback: (value: T, index: number) => boolean): DoublyLinkedList<T> {
    const result = new DoublyLinkedList<T>({ comparator: this.comparator })
    let current = this.head
    let index = 0
    while (current !== null) {
      if (callback(current.value, index)) {
        result.pushBack(current.value)
      }
      current = current.next
      index++
    }
    return result
  }

  map<U>(callback: (value: T, index: number) => U): DoublyLinkedList<U> {
    const result = new DoublyLinkedList<U>()
    let current = this.head
    let index = 0
    while (current !== null) {
      result.pushBack(callback(current.value, index))
      current = current.next
      index++
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let accumulator = initialValue
    let current = this.head
    let index = 0
    while (current !== null) {
      accumulator = callback(accumulator, current.value, index)
      current = current.next
      index++
    }
    return accumulator
  }
}

export type { DoublyLinkedListOptions } from './types.js'
