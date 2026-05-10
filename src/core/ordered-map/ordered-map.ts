import type { OrderedMapEntry, OrderedMapOptions, OrderedMapStats } from './types.js'

export class OrderedMap<K, V> {
  private map: Map<K, OrderedMapEntry<K, V>> = new Map()
  private head: OrderedMapEntry<K, V> | null = null
  private tail: OrderedMapEntry<K, V> | null = null
  private _capacity: number

  constructor(_options?: Partial<OrderedMapOptions>) {
    void _options
    this._capacity = _options?.initialCapacity ?? 16
  }

  set(key: K, value: V): void {
    const existing = this.map.get(key)
    if (existing !== undefined) {
      existing.value = value
      return
    }
    const entry: OrderedMapEntry<K, V> = { key, value, prev: null, next: null }
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

  forEach(callback: (key: K, value: V) => void): void {
    let current = this.head
    while (current !== null) {
      callback(current.key, current.value)
      current = current.next
    }
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

  clone(): OrderedMap<K, V> {
    const cloned = new OrderedMap<K, V>({ initialCapacity: this._capacity })
    let current = this.head
    while (current !== null) {
      cloned.set(current.key, current.value)
      current = current.next
    }
    return cloned
  }

  static from<K, V>(entries: Iterable<[K, V]>): OrderedMap<K, V> {
    const map = new OrderedMap<K, V>()
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  toArray(): Array<[K, V]> {
    return this.entries()
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

  atIndex(index: number): [K, V] | undefined {
    if (index < 0 || index >= this.map.size) {
      return undefined
    }
    let i = 0
    let current = this.head
    while (current !== null) {
      if (i === index) {
        return [current.key, current.value]
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

  stats(): OrderedMapStats {
    return {
      size: this.map.size,
      isEmpty: this.map.size === 0,
      capacity: this._capacity,
      loadFactor: this.map.size / this._capacity,
    }
  }

  private removeNode(node: OrderedMapEntry<K, V>): void {
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

export { DEFAULT_ORDEREDMAP_OPTIONS } from './types.js'
export type { OrderedMapEntry, OrderedMapOptions, OrderedMapStats } from './types.js'
