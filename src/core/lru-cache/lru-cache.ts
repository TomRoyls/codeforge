import type { LRUNode, LRUCacheOptions, LRUCacheStats } from './types.js'
import { DEFAULT_LRU_CACHE_OPTIONS } from './types.js'

export class LRUCache<T = unknown> {
  private map: Map<string, LRUNode<T>> = new Map()
  private options: LRUCacheOptions
  private head?: LRUNode<T>
  private tail?: LRUNode<T>
  private _hits: number = 0
  private _misses: number = 0
  private _evictions: number = 0

  constructor(options?: Partial<LRUCacheOptions>) {
    this.options = { ...DEFAULT_LRU_CACHE_OPTIONS, ...options }
  }

  get(key: string): T | undefined {
    const node = this.map.get(key)
    if (node === undefined) {
      this._misses++
      return undefined
    }
    if (this.isExpired(node)) {
      this.removeNode(node)
      this.map.delete(key)
      this._misses++
      return undefined
    }
    this._hits++
    this.moveToFront(node)
    return node.value
  }

  set(key: string, value: T): void {
    const existing = this.map.get(key)
    if (existing !== undefined) {
      existing.value = value
      existing.createdAt = Date.now()
      if (this.isExpired(existing)) {
        this.removeNode(existing)
        this.map.delete(key)
        this._evictions++
      } else {
        this.moveToFront(existing)
        return
      }
    }
    if (this.map.size >= this.options.maxSize) {
      this.evictLRU()
    }
    const node: LRUNode<T> = { key, value, createdAt: Date.now() }
    this.map.set(key, node)
    this.addToFront(node)
  }

  has(key: string): boolean {
    const node = this.map.get(key)
    if (node === undefined) {
      return false
    }
    if (this.isExpired(node)) {
      this.removeNode(node)
      this.map.delete(key)
      return false
    }
    return true
  }

  delete(key: string): boolean {
    const node = this.map.get(key)
    if (node === undefined) {
      return false
    }
    this.removeNode(node)
    this.map.delete(key)
    return true
  }

  peek(key: string): T | undefined {
    const node = this.map.get(key)
    if (node === undefined) {
      return undefined
    }
    if (this.isExpired(node)) {
      this.removeNode(node)
      this.map.delete(key)
      return undefined
    }
    return node.value
  }

  size(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
    this.head = undefined
    this.tail = undefined
  }

  keys(): string[] {
    const result: string[] = []
    let current = this.head
    while (current !== undefined) {
      if (!this.isExpired(current)) {
        result.push(current.key)
      }
      current = current.next
    }
    return result
  }

  values(): T[] {
    const result: T[] = []
    let current = this.head
    while (current !== undefined) {
      if (!this.isExpired(current)) {
        result.push(current.value)
      }
      current = current.next
    }
    return result
  }

  entries(): [string, T][] {
    const result: [string, T][] = []
    let current = this.head
    while (current !== undefined) {
      if (!this.isExpired(current)) {
        result.push([current.key, current.value])
      }
      current = current.next
    }
    return result
  }

  getStats(): LRUCacheStats {
    const total = this._hits + this._misses
    return {
      size: this.map.size,
      maxSize: this.options.maxSize,
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      evictions: this._evictions,
    }
  }

  resize(newMaxSize: number): void {
    this.options.maxSize = newMaxSize
    while (this.map.size > newMaxSize) {
      this.evictLRU()
    }
  }

  forEach(callback: (value: T, key: string) => void): void {
    let current = this.head
    while (current !== undefined) {
      if (!this.isExpired(current)) {
        callback(current.value, current.key)
      }
      current = current.next
    }
  }

  private isExpired(node: LRUNode<T>): boolean {
    if (this.options.ttlMs <= 0) {
      return false
    }
    return Date.now() - node.createdAt > this.options.ttlMs
  }

  private addToFront(node: LRUNode<T>): void {
    node.prev = undefined
    node.next = this.head
    if (this.head !== undefined) {
      this.head.prev = node
    }
    this.head = node
    if (this.tail === undefined) {
      this.tail = node
    }
  }

  private removeNode(node: LRUNode<T>): void {
    if (node.prev !== undefined) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }
    if (node.next !== undefined) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
    node.prev = undefined
    node.next = undefined
  }

  private moveToFront(node: LRUNode<T>): void {
    if (node === this.head) {
      return
    }
    this.removeNode(node)
    this.addToFront(node)
  }

  private evictLRU(): void {
    if (this.tail === undefined) {
      return
    }
    const lru = this.tail
    this.removeNode(lru)
    this.map.delete(lru.key)
    this._evictions++
  }
}

export { DEFAULT_LRU_CACHE_OPTIONS } from './types.js'
export type { LRUNode, LRUCacheOptions, LRUCacheStats } from './types.js'
