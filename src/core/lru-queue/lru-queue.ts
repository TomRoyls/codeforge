import type { LRUQueueOptions } from './types.js'

interface LRUQueueNode<K, V> {
  key: K
  value: V
  prev: LRUQueueNode<K, V> | null
  next: LRUQueueNode<K, V> | null
}

export class LRUQueue<K, V> {
  private map: Map<K, LRUQueueNode<K, V>> = new Map()
  private head: LRUQueueNode<K, V> | null = null
  private tail: LRUQueueNode<K, V> | null = null
  private _capacity: number

  constructor(maxSize: number) {
    this._capacity = maxSize
  }

  enqueue(key: K, value: V): { key: K; value: V } | undefined {
    const existing = this.map.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.moveToFront(existing)
      return undefined
    }

    if (this._capacity <= 0) return undefined

    let evicted: { key: K; value: V } | undefined
    if (this.map.size >= this._capacity) {
      evicted = this.evict()
    }

    const node: LRUQueueNode<K, V> = { key, value, prev: null, next: null }
    this.map.set(key, node)
    this.addToFront(node)
    return evicted
  }

  dequeue(): { key: K; value: V } | undefined {
    if (this.tail === null) return undefined
    const node = this.tail
    this.removeNode(node)
    this.map.delete(node.key)
    return { key: node.key, value: node.value }
  }

  peek(): { key: K; value: V } | undefined {
    if (this.tail === null) return undefined
    return { key: this.tail.key, value: this.tail.value }
  }

  get(key: K): V | undefined {
    const node = this.map.get(key)
    if (node === undefined) return undefined
    this.moveToFront(node)
    return node.value
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  get size(): number {
    return this.map.size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this.map.size === 0
  }

  clear(): void {
    this.map.clear()
    this.head = null
    this.tail = null
  }

  toArray(): { key: K; value: V }[] {
    const result: { key: K; value: V }[] = []
    let current = this.head
    while (current !== null) {
      result.push({ key: current.key, value: current.value })
      current = current.next
    }
    return result
  }

  keys(): K[] {
    const result: K[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.key)
      current = current.next
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    let current = this.head
    while (current !== null) {
      callback(current.value, current.key)
      current = current.next
    }
  }

  *[Symbol.iterator](): Iterator<{ key: K; value: V }> {
    let current = this.head
    while (current !== null) {
      yield { key: current.key, value: current.value }
      current = current.next
    }
  }

  evict(): { key: K; value: V } | undefined {
    if (this.tail === null) return undefined
    const node = this.tail
    this.removeNode(node)
    this.map.delete(node.key)
    return { key: node.key, value: node.value }
  }

  resize(newCapacity: number): void {
    this._capacity = newCapacity
    while (this.map.size > newCapacity && this.tail !== null) {
      this.evict()
    }
  }

  static fromOptions<K, V>(options: LRUQueueOptions): LRUQueue<K, V> {
    return new LRUQueue<K, V>(options.maxSize)
  }

  private addToFront(node: LRUQueueNode<K, V>): void {
    node.prev = null
    node.next = this.head
    if (this.head !== null) {
      this.head.prev = node
    }
    this.head = node
    if (this.tail === null) {
      this.tail = node
    }
  }

  private removeNode(node: LRUQueueNode<K, V>): void {
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
    node.prev = null
    node.next = null
  }

  private moveToFront(node: LRUQueueNode<K, V>): void {
    if (node === this.head) return
    this.removeNode(node)
    this.addToFront(node)
  }
}

export type { LRUQueueOptions } from './types.js'
