import type {
  DoublyLinkedRingNode,
  DoublyLinkedRingOptions,
  DoublyLinkedRingStatistics,
} from './types.js'

export const DEFAULT_DOUBLY_LINKED_RING_OPTIONS: Required<DoublyLinkedRingOptions> = {
  circular: true,
}

export class DoublyLinkedRing<T> {
  private head: DoublyLinkedRingNode<T> | null = null
  private tail: DoublyLinkedRingNode<T> | null = null
  private _size: number = 0
  private readonly circular: boolean
  private _stats: DoublyLinkedRingStatistics = {
    insertions: 0,
    deletions: 0,
    rotations: 0,
  }

  constructor(options?: Partial<DoublyLinkedRingOptions>) {
    const merged = { ...DEFAULT_DOUBLY_LINKED_RING_OPTIONS, ...options }
    this.circular = merged.circular
  }

  private updateCircularLinks(): void {
    if (this.circular && this.head && this.tail) {
      this.head.prev = this.tail
      this.tail.next = this.head
    }
  }

  private normalizeIndex(index: number): number {
    if (index < 0) {
      return ((index % this._size) + this._size) % this._size
    }
    return index
  }

  private getNodeAt(index: number): DoublyLinkedRingNode<T> | undefined {
    if (this._size === 0 || !this.head) return undefined
    const normalized = this.normalizeIndex(index)
    if (normalized < 0 || normalized >= this._size) return undefined
    if (normalized < this._size / 2) {
      let current = this.head
      for (let i = 0; i < normalized; i++) {
        current = current.next!
      }
      return current
    } else {
      let current = this.tail!
      for (let i = this._size - 1; i > normalized; i--) {
        current = current.prev!
      }
      return current
    }
  }

  push(val: T): void {
    const node: DoublyLinkedRingNode<T> = { value: val, prev: null, next: null }
    if (this.head === null) {
      this.head = node
      this.tail = node
    } else {
      node.prev = this.tail
      this.tail!.next = node
      this.tail = node
    }
    this._size++
    this._stats.insertions++
    this.updateCircularLinks()
  }

  pop(): T | undefined {
    if (this.tail === null) return undefined
    const node = this.tail
    if (this._size === 1) {
      this.head = null
      this.tail = null
    } else {
      this.tail = this.tail.prev!
      this.tail.next = null
    }
    this._size--
    this._stats.deletions++
    this.updateCircularLinks()
    return node.value
  }

  unshift(val: T): void {
    const node: DoublyLinkedRingNode<T> = { value: val, prev: null, next: null }
    if (this.head === null) {
      this.head = node
      this.tail = node
    } else {
      node.next = this.head
      this.head.prev = node
      this.head = node
    }
    this._size++
    this._stats.insertions++
    this.updateCircularLinks()
  }

  shift(): T | undefined {
    if (this.head === null) return undefined
    const node = this.head
    if (this._size === 1) {
      this.head = null
      this.tail = null
    } else {
      this.head = this.head.next!
      this.head.prev = null
    }
    this._size--
    this._stats.deletions++
    this.updateCircularLinks()
    return node.value
  }

  get(index: number): T | undefined {
    const node = this.getNodeAt(index)
    return node?.value
  }

  set(index: number, val: T): boolean {
    const node = this.getNodeAt(index)
    if (!node) return false
    node.value = val
    return true
  }

  insert(index: number, val: T): void {
    if (index <= 0) {
      this.unshift(val)
      return
    }
    if (index >= this._size) {
      this.push(val)
      return
    }
    const node: DoublyLinkedRingNode<T> = { value: val, prev: null, next: null }
    const current = this.getNodeAt(index)!
    const prevNode = current.prev!
    node.prev = prevNode
    node.next = current
    prevNode.next = node
    current.prev = node
    this._size++
    this._stats.insertions++
    this.updateCircularLinks()
  }

  delete(index: number): T | undefined {
    if (this._size === 0) return undefined
    const normalized = ((index % this._size) + this._size) % this._size
    if (normalized === 0) return this.shift()
    if (normalized === this._size - 1) return this.pop()
    const node = this.getNodeAt(normalized)!
    const prevNode = node.prev!
    const nextNode = node.next!
    prevNode.next = nextNode
    nextNode.prev = prevNode
    this._size--
    this._stats.deletions++
    return node.value
  }

  get size(): number {
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
    if (this.head === null) return result
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      result.push(current.value)
      current = current.next!
    }
    return result
  }

  forEach(cb: (value: T, index: number) => void): void {
    if (this.head === null) return
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      cb(current.value, i)
      current = current.next!
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    if (this.head === null) return
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      yield current.value
      current = current.next!
    }
  }

  reverse(): void {
    if (this._size <= 1) return
    let current = this.head!
    for (let i = 0; i < this._size; i++) {
      const temp = current.next
      current.next = current.prev
      current.prev = temp
      current = temp!
    }
    const tempHead = this.head
    this.head = this.tail
    this.tail = tempHead
    this.updateCircularLinks()
  }

  rotate(n: number): void {
    if (this._size <= 1) return
    const rotations = ((n % this._size) + this._size) % this._size
    if (rotations === 0) return
    this.head = this.getNodeAt(rotations)!
    this.tail = this.head.prev!
    this._stats.rotations++
    this.updateCircularLinks()
  }

  indexOf(val: T): number {
    if (this.head === null) return -1
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      if (current.value === val) return i
      current = current.next!
    }
    return -1
  }

  includes(val: T): boolean {
    return this.indexOf(val) !== -1
  }

  find(cb: (value: T, index: number) => boolean): T | undefined {
    if (this.head === null) return undefined
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      if (cb(current.value, i)) return current.value
      current = current.next!
    }
    return undefined
  }

  findLast(cb: (value: T, index: number) => boolean): T | undefined {
    if (this.tail === null) return undefined
    let current: DoublyLinkedRingNode<T> = this.tail
    for (let i = this._size - 1; i >= 0; i--) {
      if (cb(current.value, i)) return current.value
      current = current.prev!
    }
    return undefined
  }

  some(cb: (value: T, index: number) => boolean): boolean {
    if (this.head === null) return false
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      if (cb(current.value, i)) return true
      current = current.next!
    }
    return false
  }

  every(cb: (value: T, index: number) => boolean): boolean {
    if (this.head === null) return true
    let current: DoublyLinkedRingNode<T> = this.head
    for (let i = 0; i < this._size; i++) {
      if (!cb(current.value, i)) return false
      current = current.next!
    }
    return true
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const normalizedStart = Math.max(0, Math.min(start, this._size))
    const count = deleteCount === undefined
      ? this._size - normalizedStart
      : Math.max(0, deleteCount)
    const removed: T[] = []
    for (let i = 0; i < count && normalizedStart < this._size; i++) {
      const val = this.delete(normalizedStart)
      if (val !== undefined) removed.push(val)
    }
    for (let i = 0; i < items.length; i++) {
      this.insert(normalizedStart + i, items[i]!)
    }
    return removed
  }

  slice(start?: number, end?: number): DoublyLinkedRing<T> {
    const result = new DoublyLinkedRing<T>({ circular: this.circular })
    if (this._size === 0) return result
    const rawS = start ?? 0
    const rawE = end ?? this._size
    const s = rawS < 0 ? Math.max(0, rawS + this._size) : Math.min(rawS, this._size)
    const e = rawE < 0 ? Math.max(0, rawE + this._size) : Math.min(rawE, this._size)
    if (s >= e) return result
    for (let i = s; i < e; i++) {
      const node = this.getNodeAt(i)
      if (node) result.push(node.value)
    }
    return result
  }

  concatenate(other: DoublyLinkedRing<T>): DoublyLinkedRing<T> {
    const result = new DoublyLinkedRing<T>({ circular: this.circular })
    for (const val of this) {
      result.push(val)
    }
    for (const val of other) {
      result.push(val)
    }
    return result
  }

  split(index: number): [DoublyLinkedRing<T>, DoublyLinkedRing<T>] {
    const left = new DoublyLinkedRing<T>({ circular: this.circular })
    const right = new DoublyLinkedRing<T>({ circular: this.circular })
    const normalizedIndex = Math.max(0, Math.min(index, this._size))
    for (let i = 0; i < normalizedIndex; i++) {
      left.push(this.get(i)!)
    }
    for (let i = normalizedIndex; i < this._size; i++) {
      right.push(this.get(i)!)
    }
    return [left, right]
  }

  get headNode(): DoublyLinkedRingNode<T> | null {
    return this.head
  }

  get tailNode(): DoublyLinkedRingNode<T> | null {
    return this.tail
  }

  get statistics(): DoublyLinkedRingStatistics {
    return { ...this._stats }
  }

  get isCircular(): boolean {
    return this.circular
  }
}
