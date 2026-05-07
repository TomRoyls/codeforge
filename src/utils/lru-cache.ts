export interface LRUCacheOptions {
  maxSize: number
}

interface LRUNode<K, V> {
  key: K
  next: LRUNode<K, V> | null
  prev: LRUNode<K, V> | null
  value: V
}

export class LRUCache<K, V> {
  private cache: Map<K, LRUNode<K, V>>
  private head: LRUNode<K, V> | null
  private maxSize: number
  private tail: LRUNode<K, V> | null

  constructor(options: LRUCacheOptions) {
    this.cache = new Map()
    this.head = null
    this.tail = null
    this.maxSize = options.maxSize
  }

  get size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
  }

  delete(key: K): boolean {
    const node = this.cache.get(key)
    if (!node) return false

    this.cache.delete(key)
    this.removeNode(node)

    return true
  }

  entries(): IterableIterator<[K, V]> {
    const entries: [K, V][] = []
    for (const [key, node] of this.cache.entries()) {
      entries.push([key, node.value])
    }

    return entries[Symbol.iterator]()
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, node] of this.cache.entries()) {
      callback(node.value, key)
    }
  }

  get(key: K): undefined | V {
    const node = this.cache.get(key)
    if (!node) return undefined

    this.moveToHead(node)
    return node.value
  }

  getOrDefault(key: K, defaultValue: V): V {
    const value = this.get(key)
    return value === undefined ? defaultValue : value
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  set(key: K, value: V): void {
    const existing = this.cache.get(key)
    if (existing) {
      existing.value = value
      this.moveToHead(existing)
      return
    }

    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const node: LRUNode<K, V> = {
      key,
      next: null,
      prev: null,
      value,
    }

    this.cache.set(key, node)
    this.prependNode(node)
  }

  values(): IterableIterator<V> {
    const values: V[] = []
    for (const [, node] of this.cache) {
      values.push(node.value)
    }

    return values[Symbol.iterator]()
  }

  private evictLRU(): void {
    if (!this.tail) return

    this.cache.delete(this.tail.key)
    this.removeNode(this.tail)
  }

  private moveToHead(node: LRUNode<K, V>): void {
    if (node === this.head) return

    this.removeNode(node)
    this.prependNode(node)
  }

  private prependNode(node: LRUNode<K, V>): void {
    node.prev = null
    node.next = this.head

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }

    node.prev = null
    node.next = null
  }
}
