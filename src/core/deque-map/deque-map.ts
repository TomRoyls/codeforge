import type { DequeMapEntry, DequeMapStats } from './types.js'

export class DequeMap<K, V> {
  private map: Map<K, DequeMapEntry<K, V>> = new Map()
  private head: DequeMapEntry<K, V> | null = null
  private tail: DequeMapEntry<K, V> | null = null

  set(key: K, value: V): void {
    const existing = this.map.get(key)
    if (existing !== undefined) {
      this.removeNode(existing)
      existing.value = value
      existing.prev = this.tail
      existing.next = null
      if (this.tail !== null) {
        this.tail.next = existing
      }
      this.tail = existing
      if (this.head === null) {
        this.head = existing
      }
      return
    }
    const entry: DequeMapEntry<K, V> = { key, value, prev: null, next: null }
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

  get first(): { key: K; value: V } | undefined {
    if (this.head === null) {
      return undefined
    }
    return { key: this.head.key, value: this.head.value }
  }

  get last(): { key: K; value: V } | undefined {
    if (this.tail === null) {
      return undefined
    }
    return { key: this.tail.key, value: this.tail.value }
  }

  shift(): { key: K; value: V } | undefined {
    if (this.head === null) {
      return undefined
    }
    const entry = this.head
    this.removeNode(entry)
    this.map.delete(entry.key)
    return { key: entry.key, value: entry.value }
  }

  pop(): { key: K; value: V } | undefined {
    if (this.tail === null) {
      return undefined
    }
    const entry = this.tail
    this.removeNode(entry)
    this.map.delete(entry.key)
    return { key: entry.key, value: entry.value }
  }

  get size(): number {
    return this.map.size
  }

  get isEmpty(): boolean {
    return this.map.size === 0
  }

  clear(): void {
    this.map.clear()
    this.head = null
    this.tail = null
  }

  clone(): DequeMap<K, V> {
    const cloned = new DequeMap<K, V>()
    let current = this.head
    while (current !== null) {
      cloned.set(current.key, current.value)
      current = current.next
    }
    return cloned
  }

  toArray(): Array<[K, V]> {
    return this.entries()
  }

  forEach(callback: (key: K, value: V) => void): void {
    let current = this.head
    while (current !== null) {
      callback(current.key, current.value)
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

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    let current = this.head
    while (current !== null) {
      result.push([current.key, current.value])
      current = current.next
    }
    return result
  }

  static from<K, V>(items: Iterable<[K, V]>): DequeMap<K, V> {
    const map = new DequeMap<K, V>()
    for (const [key, value] of items) {
      map.set(key, value)
    }
    return map
  }

  indexOf(key: K): number {
    if (!this.map.has(key)) {
      return -1
    }
    let index = 0
    let current = this.head
    while (current !== null) {
      if (current.key === key) {
        return index
      }
      index++
      current = current.next
    }
    return -1
  }

  atIndex(index: number): { key: K; value: V } | undefined {
    if (index < 0 || index >= this.map.size) {
      return undefined
    }
    let i = 0
    let current = this.head
    while (current !== null) {
      if (i === index) {
        return { key: current.key, value: current.value }
      }
      i++
      current = current.next
    }
    return undefined
  }

  moveToFront(key: K): boolean {
    const entry = this.map.get(key)
    if (entry === undefined || entry === this.head) {
      return entry !== undefined
    }
    this.removeNode(entry)
    entry.next = this.head
    entry.prev = null
    if (this.head !== null) {
      this.head.prev = entry
    }
    this.head = entry
    if (this.tail === null) {
      this.tail = entry
    }
    return true
  }

  moveToBack(key: K): boolean {
    const entry = this.map.get(key)
    if (entry === undefined || entry === this.tail) {
      return entry !== undefined
    }
    this.removeNode(entry)
    entry.prev = this.tail
    entry.next = null
    if (this.tail !== null) {
      this.tail.next = entry
    }
    this.tail = entry
    if (this.head === null) {
      this.head = entry
    }
    return true
  }

  stats(): DequeMapStats {
    return {
      size: this.map.size,
      isEmpty: this.map.size === 0,
    }
  }

  private removeNode(node: DequeMapEntry<K, V>): void {
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

export { DEFAULT_DEQUEMAP_OPTIONS } from './types.js'
export type { DequeMapEntry, DequeMapStats } from './types.js'
