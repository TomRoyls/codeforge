import type { LFUCacheOptions, LFUCacheEntry } from "./types.js"

class DoublyLinkedNode<K> {
  key: K
  prev: DoublyLinkedNode<K> | null = null
  next: DoublyLinkedNode<K> | null = null

  constructor(key: K) {
    this.key = key
  }
}

class DoublyLinkedList<K> {
  head: DoublyLinkedNode<K>
  tail: DoublyLinkedNode<K>
  size = 0
  private nodeMap: Map<K, DoublyLinkedNode<K>> = new Map()

  constructor() {
    this.head = new DoublyLinkedNode<K>(undefined as K)
    this.tail = new DoublyLinkedNode<K>(undefined as K)
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  append(key: K): void {
    const node = new DoublyLinkedNode(key)
    const last = this.tail.prev!
    last.next = node
    node.prev = last
    node.next = this.tail
    this.tail.prev = node
    this.size++
    this.nodeMap.set(key, node)
  }

  remove(key: K): void {
    const node = this.nodeMap.get(key)
    if (!node) return
    node.prev!.next = node.next
    node.next!.prev = node.prev
    this.size--
    this.nodeMap.delete(key)
  }

  removeFirst(): K | undefined {
    if (this.size === 0) return undefined
    const first = this.head.next!
    this.remove(first.key)
    return first.key
  }

  moveToEnd(key: K): void {
    const node = this.nodeMap.get(key)
    if (!node) return
    node.prev!.next = node.next
    node.next!.prev = node.prev
    const last = this.tail.prev!
    last.next = node
    node.prev = last
    node.next = this.tail
    this.tail.prev = node
  }

  keys(): K[] {
    const result: K[] = []
    let current = this.head.next
    while (current !== this.tail) {
      result.push(current!.key)
      current = current!.next
    }
    return result
  }

  isEmpty(): boolean {
    return this.size === 0
  }
}

interface InternalEntry<V> {
  value: V
  frequency: number
}

export class LFUCache<K, V> {
  private _maxSize: number
  private _size = 0
  private cache: Map<K, InternalEntry<V>> = new Map()
  private freqMap: Map<number, DoublyLinkedList<K>> = new Map()
  private minFreq = 0
  private _onEvict?: (key: K, value: V) => void

  constructor(options: LFUCacheOptions<K, V>) {
    this._maxSize = options.maxSize
    this._onEvict = options.onEvict
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    this.incrementFrequency(key, entry)
    return entry.value
  }

  set(key: K, value: V): void {
    if (this._maxSize <= 0) return

    const existing = this.cache.get(key)
    if (existing) {
      existing.value = value
      this.incrementFrequency(key, existing)
      return
    }

    if (this._size >= this._maxSize) {
      this.evict()
    }

    const entry: InternalEntry<V> = { value, frequency: 1 }
    this.cache.set(key, entry)
    this.getOrCreateFreqList(1).append(key)
    this.minFreq = 1
    this._size++
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const list = this.freqMap.get(entry.frequency)
    if (list) {
      list.remove(key)
      if (list.isEmpty()) {
        this.freqMap.delete(entry.frequency)
        if (this.minFreq === entry.frequency) {
          this.updateMinFreq()
        }
      }
    }

    this.cache.delete(key)
    this._size--
    return true
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.cache.clear()
    this.freqMap.clear()
    this._size = 0
    this.minFreq = 0
  }

  peek(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    return entry.value
  }

  getFrequency(key: K): number {
    const entry = this.cache.get(key)
    if (!entry) return 0
    return entry.frequency
  }

  keys(): K[] {
    const result: K[] = []
    const sortedFreqs = [...this.freqMap.keys()].sort((a, b) => a - b)
    for (const freq of sortedFreqs) {
      const list = this.freqMap.get(freq)!
      result.push(...list.keys())
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    const sortedFreqs = [...this.freqMap.keys()].sort((a, b) => a - b)
    for (const freq of sortedFreqs) {
      const list = this.freqMap.get(freq)!
      for (const key of list.keys()) {
        const entry = this.cache.get(key)!
        result.push(entry.value)
      }
    }
    return result
  }

  entries(): LFUCacheEntry<K, V>[] {
    const result: LFUCacheEntry<K, V>[] = []
    const sortedFreqs = [...this.freqMap.keys()].sort((a, b) => a - b)
    for (const freq of sortedFreqs) {
      const list = this.freqMap.get(freq)!
      for (const key of list.keys()) {
        const entry = this.cache.get(key)!
        result.push({ key, value: entry.value, frequency: entry.frequency })
      }
    }
    return result
  }

  getMaxSize(): number {
    return this._maxSize
  }

  resize(maxSize: number): void {
    this._maxSize = maxSize
    while (this._size > maxSize && maxSize >= 0) {
      this.evict()
    }
  }

  forEach(callback: (entry: LFUCacheEntry<K, V>) => void): void {
    const sortedFreqs = [...this.freqMap.keys()].sort((a, b) => a - b)
    for (const freq of sortedFreqs) {
      const list = this.freqMap.get(freq)!
      for (const key of list.keys()) {
        const entry = this.cache.get(key)!
        callback({ key, value: entry.value, frequency: entry.frequency })
      }
    }
  }

  *[Symbol.iterator](): Iterator<LFUCacheEntry<K, V>> {
    const sortedFreqs = [...this.freqMap.keys()].sort((a, b) => a - b)
    for (const freq of sortedFreqs) {
      const list = this.freqMap.get(freq)!
      for (const key of list.keys()) {
        const entry = this.cache.get(key)!
        yield { key, value: entry.value, frequency: entry.frequency }
      }
    }
  }

  toArray(): LFUCacheEntry<K, V>[] {
    return this.entries()
  }

  clone(): LFUCache<K, V> {
    const cloned = new LFUCache<K, V>({
      maxSize: this._maxSize,
      onEvict: this._onEvict,
    })
    for (const [key, entry] of this.cache) {
      cloned.set(key, entry.value)
      const clonedEntry = cloned.cache.get(key)!
      clonedEntry.frequency = entry.frequency

      const oldList = cloned.freqMap.get(1)
      if (oldList) {
        oldList.remove(key)
        if (oldList.isEmpty()) {
          cloned.freqMap.delete(1)
        }
      }

      const newList = cloned.getOrCreateFreqList(entry.frequency)
      newList.append(key)
    }

    cloned.minFreq = this.minFreq
    cloned._size = this._size
    return cloned
  }

  private incrementFrequency(key: K, entry: InternalEntry<V>): void {
    const oldFreq = entry.frequency
    const newFreq = oldFreq + 1
    entry.frequency = newFreq

    const oldList = this.freqMap.get(oldFreq)
    if (oldList) {
      oldList.remove(key)
      if (oldList.isEmpty()) {
        this.freqMap.delete(oldFreq)
        if (this.minFreq === oldFreq) {
          this.minFreq = newFreq
        }
      }
    }

    this.getOrCreateFreqList(newFreq).append(key)
  }

  private evict(): void {
    const list = this.freqMap.get(this.minFreq)
    if (!list) return

    const key = list.removeFirst()
    if (key === undefined) return

    if (list.isEmpty()) {
      this.freqMap.delete(this.minFreq)
      if (this._size > 1) {
        this.updateMinFreq()
      }
    }

    const entry = this.cache.get(key)
    if (entry) {
      if (this._onEvict) {
        this._onEvict(key, entry.value)
      }
      this.cache.delete(key)
    }

    this._size--
  }

  private getOrCreateFreqList(freq: number): DoublyLinkedList<K> {
    let list = this.freqMap.get(freq)
    if (!list) {
      list = new DoublyLinkedList<K>()
      this.freqMap.set(freq, list)
    }
    return list
  }

  private updateMinFreq(): void {
    this.minFreq = 0
    const freqs = [...this.freqMap.keys()]
    if (freqs.length > 0) {
      this.minFreq = Math.min(...freqs)
    }
  }
}
