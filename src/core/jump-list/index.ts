import type { JumpListOptions } from './types.js'

type Node<T> = {
  value: T
  prev: Node<T> | null
  next: Node<T> | null
}

export class JumpList<T> {
  private head: Node<T> | null = null
  private tail: Node<T> | null = null
  private count = 0
  private blockSize: number
  private jumpPointers: Node<T>[] = []

  constructor(options?: JumpListOptions) {
    this.blockSize = options?.blockSize ?? 32
  }

  push(value: T): void {
    const node: Node<T> = { value, prev: this.tail, next: null }

    if (this.tail) {
      this.tail.next = node
    } else {
      this.head = node
    }

    this.tail = node
    this.count++
    this.maybeRebuildJumpPointers()
  }

  pop(): T | undefined {
    if (!this.tail) {
      return undefined
    }

    const value = this.tail.value
    this.tail = this.tail.prev

    if (this.tail) {
      this.tail.next = null
    } else {
      this.head = null
    }

    this.count--
    this.maybeRebuildJumpPointers()

    return value
  }

  unshift(value: T): void {
    const node: Node<T> = { value, prev: null, next: this.head }

    if (this.head) {
      this.head.prev = node
    } else {
      this.tail = node
    }

    this.head = node
    this.count++
    this.maybeRebuildJumpPointers()
  }

  shift(): T | undefined {
    if (!this.head) {
      return undefined
    }

    const value = this.head.value
    this.head = this.head.next

    if (this.head) {
      this.head.prev = null
    } else {
      this.tail = null
    }

    this.count--
    this.maybeRebuildJumpPointers()

    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined
    }

    const node = this.findNode(index)
    return node?.value
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this.count) {
      return false
    }

    const node = this.findNode(index)
    if (node) {
      node.value = value
      return true
    }

    return false
  }

  insert(index: number, value: T): boolean {
    if (index < 0 || index > this.count) {
      return false
    }

    if (index === 0) {
      this.unshift(value)
      return true
    }

    if (index === this.count) {
      this.push(value)
      return true
    }

    const nextNode = this.findNode(index)
    if (!nextNode) {
      return false
    }

    const prevNode = nextNode.prev!
    const newNode: Node<T> = { value, prev: prevNode, next: nextNode }

    prevNode.next = newNode
    nextNode.prev = newNode

    this.count++
    this.maybeRebuildJumpPointers()

    return true
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined
    }

    if (index === 0) {
      return this.shift()
    }

    if (index === this.count - 1) {
      return this.pop()
    }

    const node = this.findNode(index)
    if (!node) {
      return undefined
    }

    const prevNode = node.prev!
    const nextNode = node.next!

    prevNode.next = nextNode
    nextNode.prev = prevNode

    this.count--
    this.maybeRebuildJumpPointers()

    return node.value
  }

  indexOf(value: T): number {
    let current = this.head
    let index = 0

    while (current) {
      if (current.value === value) {
        return index
      }
      current = current.next
      index++
    }

    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  get size(): number {
    return this.count
  }

  get isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.head = null
    this.tail = null
    this.count = 0
    this.jumpPointers = []
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head

    while (current) {
      result.push(current.value)
      current = current.next
    }

    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head
    let index = 0

    while (current) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = []
    let current = this.head
    let index = 0

    while (current) {
      result.push(callback(current.value, index))
      current = current.next
      index++
    }

    return result
  }

  filter(callback: (value: T, index: number) => boolean): T[] {
    const result: T[] = []
    let current = this.head
    let index = 0

    while (current) {
      if (callback(current.value, index)) {
        result.push(current.value)
      }
      current = current.next
      index++
    }

    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let current = this.head
    return {
      next(): IteratorResult<T> {
        if (!current) {
          return { done: true, value: undefined }
        }
        const value = current.value
        current = current.next
        return { done: false, value }
      }
    }
  }

  private findNode(index: number): Node<T> | null {
    if (!this.head) {
      return null
    }

    let current = this.head
    let currentIndex = 0

    if (this.jumpPointers.length > 0) {
      const jumpIndex = Math.floor(index / this.blockSize)
      if (jumpIndex > 0 && jumpIndex < this.jumpPointers.length) {
        const jumpNode = this.jumpPointers[jumpIndex]!
        current = jumpNode
        currentIndex = jumpIndex * this.blockSize
      }
    }

    while (current && currentIndex < index) {
      current = current.next!
      currentIndex++
    }

    return current
  }

  private maybeRebuildJumpPointers(): void {
    if (this.count <= this.blockSize) {
      this.jumpPointers = []
      return
    }

    this.jumpPointers = []
    let current = this.head
    let steps = 0

    while (current) {
      if (steps % this.blockSize === 0) {
        this.jumpPointers.push(current)
      }
      current = current.next
      steps++
    }
  }

  toString(): string {
    return `${JumpList}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'JumpList', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }
}
