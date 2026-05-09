import type { DoublyLinkedNode } from './types.js'

export class DoublyEndedQueue<T = unknown> {
  private head: DoublyLinkedNode<T> | null = null
  private tail: DoublyLinkedNode<T> | null = null
  private _size: number = 0

  private createNode(item: T): DoublyLinkedNode<T> {
    return { value: item, prev: null, next: null }
  }

  private getNode(index: number): DoublyLinkedNode<T> | null {
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

  pushFront(item: T): void {
    const node = this.createNode(item)
    if (this._size === 0) {
      this.head = node
      this.tail = node
    } else {
      node.next = this.head
      this.head!.prev = node
      this.head = node
    }
    this._size++
  }

  pushBack(item: T): void {
    const node = this.createNode(item)
    if (this._size === 0) {
      this.head = node
      this.tail = node
    } else {
      node.prev = this.tail
      this.tail!.next = node
      this.tail = node
    }
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const node = this.head!
    this.head = node.next
    if (this.head !== null) {
      this.head.prev = null
    } else {
      this.tail = null
    }
    node.next = null
    this._size--
    return node.value
  }

  popBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const node = this.tail!
    this.tail = node.prev
    if (this.tail !== null) {
      this.tail.next = null
    } else {
      this.head = null
    }
    node.prev = null
    this._size--
    return node.value
  }

  peekFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.head!.value
  }

  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.tail!.value
  }

  get(index: number): T | undefined {
    const node = this.getNode(index)
    return node !== null ? node.value : undefined
  }

  set(index: number, item: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds for deque of size ${this._size}`)
    }
    const node = this.getNode(index)
    node!.value = item
  }

  insert(index: number, item: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds for insert on deque of size ${this._size}`)
    }
    if (index === 0) {
      this.pushFront(item)
      return
    }
    if (index === this._size) {
      this.pushBack(item)
      return
    }
    const newNode = this.createNode(item)
    const current = this.getNode(index)!
    const prevNode = current.prev!
    newNode.prev = prevNode
    newNode.next = current
    prevNode.next = newNode
    current.prev = newNode
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
    const prevNode = node.prev!
    const nextNode = node.next!
    prevNode.next = nextNode
    nextNode.prev = prevNode
    node.prev = null
    node.next = null
    this._size--
    return node.value
  }

  indexOf(item: T): number {
    let current = this.head
    let index = 0
    while (current !== null) {
      if (current.value === item) {
        return index
      }
      current = current.next
      index++
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
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

  forEach(callback: (item: T, index: number) => void): void {
    let current = this.head
    let index = 0
    while (current !== null) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  map<U>(callback: (item: T, index: number) => U): DoublyEndedQueue<U> {
    const result = new DoublyEndedQueue<U>()
    let current = this.head
    let index = 0
    while (current !== null) {
      result.pushBack(callback(current.value, index))
      current = current.next
      index++
    }
    return result
  }

  filter(predicate: (item: T, index: number) => boolean): DoublyEndedQueue<T> {
    const result = new DoublyEndedQueue<T>()
    let current = this.head
    let index = 0
    while (current !== null) {
      if (predicate(current.value, index)) {
        result.pushBack(current.value)
      }
      current = current.next
      index++
    }
    return result
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

  slice(start?: number, end?: number): T[] {
    const s = start ?? 0
    const e = end ?? this._size
    const clampedStart = Math.max(0, s < 0 ? this._size + s : s)
    const clampedEnd = Math.min(this._size, e < 0 ? this._size + e : e)
    const result: T[] = []
    if (clampedStart >= clampedEnd) {
      return result
    }
    let current = this.head
    let index = 0
    while (current !== null && index < clampedEnd) {
      if (index >= clampedStart) {
        result.push(current.value)
      }
      current = current.next
      index++
    }
    return result
  }

  concat(other: DoublyEndedQueue<T>): DoublyEndedQueue<T> {
    const result = new DoublyEndedQueue<T>()
    let current = this.head
    while (current !== null) {
      result.pushBack(current.value)
      current = current.next
    }
    current = other.head
    while (current !== null) {
      result.pushBack(current.value)
      current = current.next
    }
    return result
  }

  clone(): DoublyEndedQueue<T> {
    const result = new DoublyEndedQueue<T>()
    let current = this.head
    while (current !== null) {
      result.pushBack(current.value)
      current = current.next
    }
    return result
  }

  drain(): T[] {
    const result = this.toArray()
    this.clear()
    return result
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  static fromArray<T>(items: T[]): DoublyEndedQueue<T> {
    const deque = new DoublyEndedQueue<T>()
    for (const item of items) {
      deque.pushBack(item)
    }
    return deque
  }
}

export type { DoublyLinkedNode } from './types.js'
