import type { LinkedHashMapEntry, LinkedHashMapOptions } from './types.js'

export class LinkedHashMap<K, V> {
  private map: Map<K, LinkedHashMapEntry<K, V>> = new Map()
  private head: LinkedHashMapEntry<K, V> | null = null
  private tail: LinkedHashMapEntry<K, V> | null = null

  constructor(_options?: Partial<LinkedHashMapOptions>) {
    void _options
  }

  set(key: K, value: V): void {
    const existing = this.map.get(key)
    if (existing !== undefined) {
      existing.value = value
      return
    }
    const entry: LinkedHashMapEntry<K, V> = { key, value, prev: null, next: null }
    this.map.set(key, entry)
    if (this.tail === null) {
      this.head = entry
      this.tail = entry
    } else {
      entry.prev = this.tail
      this.tail.next = entry
      this.tail = entry
    }
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (entry === undefined) {
      return undefined
    }
    return entry.value
  }

  delete(key: K): boolean {
    const entry = this.map.get(key)
    if (entry === undefined) {
      return false
    }
    this.removeNode(entry)
    this.map.delete(key)
    return true
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  size(): number {
    return this.map.size
  }

  isEmpty(): boolean {
    return this.map.size === 0
  }

  clear(): void {
    this.map.clear()
    this.head = null
    this.tail = null
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

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    let current = this.head
    while (current !== null) {
      result.push([current.key, current.value])
      current = current.next
    }
    return result
  }

  forEach(callback: (key: K, value: V) => void): void {
    let current = this.head
    while (current !== null) {
      callback(current.key, current.value)
      current = current.next
    }
  }

  first(): { key: K, value: V } | undefined {
    if (this.head === null) {
      return undefined
    }
    return { key: this.head.key, value: this.head.value }
  }

  last(): { key: K, value: V } | undefined {
    if (this.tail === null) {
      return undefined
    }
    return { key: this.tail.key, value: this.tail.value }
  }

  private removeNode(node: LinkedHashMapEntry<K, V>): void {
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
}

export { DEFAULT_LINKED_HASHMAP_OPTIONS } from './types.js'
export type { LinkedHashMapEntry, LinkedHashMapOptions } from './types.js'
