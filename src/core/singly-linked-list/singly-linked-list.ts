import type { SinglyLinkedListOptions } from './types.js'

class ListNode<T> {
  value: T
  next: ListNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}

export class SinglyLinkedList<T = unknown> {
  private head: ListNode<T> | null = null
  private tail: ListNode<T> | null = null
  private _size: number = 0
  private comparator?: (a: T, b: T) => number

  constructor(options?: SinglyLinkedListOptions<T>) {
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
    if (this.head === null) {
      this.tail = null
    }
    this._size--
    return node.value
  }

  popBack(): T | undefined {
    if (this.tail === null) {
      return undefined
    }
    if (this.head === this.tail) {
      const value = this.tail.value
      this.head = null
      this.tail = null
      this._size--
      return value
    }
    let current = this.head!
    while (current.next !== this.tail) {
      current = current.next!
    }
    const value = this.tail.value
    current.next = null
    this.tail = current
    this._size--
    return value
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
    let current = this.head!
    for (let i = 0; i < index; i++) {
      current = current.next!
    }
    return current
  }

  private getPrevNode(index: number): ListNode<T> | undefined {
    if (index <= 0 || index >= this._size) {
      return undefined
    }
    let current = this.head!
    for (let i = 0; i < index - 1; i++) {
      current = current.next!
    }
    return current
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
    const prev = this.getPrevNode(index)!
    node.next = prev.next
    prev.next = node
    this._size++
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    if (index === 0) {
      return this.popFront()
    }
    const prev = this.getPrevNode(index)!
    const target = prev.next!
    prev.next = target.next
    if (target === this.tail) {
      this.tail = prev
    }
    this._size--
    return target.value
  }

  private equals(a: T, b: T): boolean {
    if (this.comparator) {
      return this.comparator(a, b) === 0
    }
    return a === b
  }

  remove(value: T): boolean {
    if (this.head === null) {
      return false
    }
    if (this.equals(this.head.value, value)) {
      this.popFront()
      return true
    }
    let current = this.head
    while (current.next !== null) {
      if (this.equals(current.next.value, value)) {
        if (current.next === this.tail) {
          this.tail = current
        }
        current.next = current.next.next
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
    let prev: ListNode<T> | null = null
    let current = this.head
    this.tail = this.head
    while (current !== null) {
      const next = current.next
      current.next = prev
      prev = current
      current = next
    }
    this.head = prev
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

  filter(callback: (value: T, index: number) => boolean): SinglyLinkedList<T> {
    const result = new SinglyLinkedList<T>({ comparator: this.comparator })
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

  map<U>(callback: (value: T, index: number) => U): SinglyLinkedList<U> {
    const result = new SinglyLinkedList<U>()
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
    for (let i = this._size - 1; i >= 0; i--) {
      const node = this.getNode(i)
      if (node !== undefined) {
        callback(node.value, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  clone(): SinglyLinkedList<T> {
    return new SinglyLinkedList<T>({
      initialValues: this.toArray(),
      comparator: this.comparator,
    })
  }

  merge(other: SinglyLinkedList<T>): SinglyLinkedList<T> {
    const result = new SinglyLinkedList<T>({
      initialValues: this.toArray(),
      comparator: this.comparator,
    })
    const otherValues = other.toArray()
    for (const value of otherValues) {
      result.pushBack(value)
    }
    return result
  }

  middle(): T | undefined {
    if (this.head === null) {
      return undefined
    }
    let slow = this.head
    let fast = this.head
    while (fast.next !== null && fast.next.next !== null) {
      slow = slow.next!
      fast = fast.next.next
    }
    return slow.value
  }

  detectCycle(): boolean {
    if (this.head === null) {
      return false
    }
    let slow = this.head
    let fast = this.head
    while (fast.next !== null && fast.next.next !== null) {
      slow = slow.next!
      fast = fast.next.next
      if (slow === fast) {
        return true
      }
    }
    return false
  }

  removeDuplicates(): void {
    if (this._size <= 1) {
      return
    }
    let current = this.head
    while (current !== null && current.next !== null) {
      if (this.equals(current.value, current.next.value)) {
        if (current.next === this.tail) {
          this.tail = current
        }
        current.next = current.next.next
        this._size--
      } else {
        current = current.next
      }
    }
  }

  reverseKGroup(k: number): void {
    if (k <= 1 || this.head === null) {
      return
    }
    const dummy = new ListNode<T>(undefined as T)
    dummy.next = this.head
    let groupPrev: ListNode<T> = dummy
    while (true) {
      let kth = groupPrev
      for (let i = 0; i < k; i++) {
        kth = kth.next!
        if (kth === null) {
          this.head = dummy.next!
          return
        }
      }
      const groupNext = kth.next
      let prev: ListNode<T> | null = groupNext
      let curr = groupPrev.next!
      const groupStart = curr
      while (curr !== groupNext) {
        const next = curr.next
        curr.next = prev
        prev = curr
        curr = next!
      }
      groupPrev.next = prev
      if (groupPrev === dummy) {
        this.head = prev
      }
      groupPrev = groupStart
      if (groupPrev.next === null) {
        this.tail = groupPrev
      }
    }
  }
}

export type { SinglyLinkedListOptions } from './types.js'
