import type { LRUNode } from './types.js'

export class LRUCache<K, V> {
  private map: Map<K, LRUNode<K, V>> = new Map()
  private head: LRUNode<K, V> | null = null
  private tail: LRUNode<K, V> | null = null
  private _capacity: number

  constructor(capacity: number) {
    this._capacity = capacity
  }

  get(key: K): V | undefined {
    const node = this.map.get(key)
    if (node === undefined) return undefined
    this.moveToFront(node)
    return node.value
  }

  set(key: K, value: V): V | undefined {
    const existing = this.map.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.moveToFront(existing)
      return undefined
    }

    if (this._capacity <= 0) return undefined

    let evictedValue: V | undefined
    if (this.map.size >= this._capacity) {
      evictedValue = this.evictLRU()
    }

    const node: LRUNode<K, V> = { key, value, prev: null, next: null }
    this.map.set(key, node)
    this.addToFront(node)
    return evictedValue
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  delete(key: K): boolean {
    const node = this.map.get(key)
    if (node === undefined) return false
    this.removeNode(node)
    this.map.delete(key)
    return true
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

  isFull(): boolean {
    return this.map.size >= this._capacity
  }

  clear(): void {
    this.map.clear()
    this.head = null
    this.tail = null
  }

  peek(key: K): V | undefined {
    const node = this.map.get(key)
    if (node === undefined) return undefined
    return node.value
  }

  peekLeastRecent(): [K, V] | undefined {
    if (this.tail === null) return undefined
    return [this.tail.key, this.tail.value]
  }

  peekMostRecent(): [K, V] | undefined {
    if (this.head === null) return undefined
    return [this.head.key, this.head.value]
  }

  forEach(callback: (value: V, key: K) => void): void {
    let current = this.head
    while (current !== null) {
      callback(current.value, current.key)
      current = current.next
    }
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

  entries(): [K, V][] {
    const result: [K, V][] = []
    let current = this.head
    while (current !== null) {
      result.push([current.key, current.value])
      current = current.next
    }
    return result
  }

  clone(): LRUCache<K, V> {
    const cloned = new LRUCache<K, V>(this._capacity)
    let current = this.tail
    while (current !== null) {
      cloned.set(current.key, current.value)
      current = current.prev
    }
    return cloned
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    let current = this.head
    while (current !== null) {
      yield [current.key, current.value]
      current = current.next
    }
  }

  resize(newCapacity: number): [K, V][] {
    this._capacity = newCapacity
    const evicted: [K, V][] = []
    while (this.map.size > newCapacity && this.tail !== null) {
      const node = this.tail
      evicted.push([node.key, node.value])
      this.removeNode(node)
      this.map.delete(node.key)
    }
    return evicted
  }

  static fromEntries<K, V>(entries: [K, V][], capacity: number): LRUCache<K, V> {
    const cache = new LRUCache<K, V>(capacity)
    for (const [key, value] of entries) {
      cache.set(key, value)
    }
    return cache
  }

  private addToFront(node: LRUNode<K, V>): void {
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

  private removeNode(node: LRUNode<K, V>): void {
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

  private moveToFront(node: LRUNode<K, V>): void {
    if (node === this.head) return
    this.removeNode(node)
    this.addToFront(node)
  }

  private evictLRU(): V | undefined {
    if (this.tail === null) return undefined
    const node = this.tail
    const value = node.value
    this.removeNode(node)
    this.map.delete(node.key)
    return value
  }
}

export type { LRUNode } from './types.js'
