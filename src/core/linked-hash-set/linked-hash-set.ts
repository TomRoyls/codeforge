import type { LinkedHashSetNode, LinkedHashSetOptions, LinkedHashSetStats } from './types.js'

export class LinkedHashSet<T> {
  private map: Map<T, LinkedHashSetNode<T>> = new Map()
  private head: LinkedHashSetNode<T> | null = null
  private tail: LinkedHashSetNode<T> | null = null

  constructor(_options?: Partial<LinkedHashSetOptions>) {
    void _options
  }

  add(value: T): boolean {
    if (this.map.has(value)) {
      return false
    }
    const node: LinkedHashSetNode<T> = { value, prev: null, next: null }
    this.map.set(value, node)
    if (this.tail === null) {
      this.head = node
      this.tail = node
    } else {
      node.prev = this.tail
      this.tail.next = node
      this.tail = node
    }
    return true
  }

  delete(value: T): boolean {
    const node = this.map.get(value)
    if (node === undefined) {
      return false
    }
    this.removeNode(node)
    this.map.delete(value)
    return true
  }

  has(value: T): boolean {
    return this.map.has(value)
  }

  get first(): T | undefined {
    return this.head?.value
  }

  get last(): T | undefined {
    return this.tail?.value
  }

  forEach(callback: (value: T) => void): void {
    let current = this.head
    while (current !== null) {
      callback(current.value)
      current = current.next
    }
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  get size(): number {
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

  clone(): LinkedHashSet<T> {
    const copy = new LinkedHashSet<T>()
    let current = this.head
    while (current !== null) {
      copy.add(current.value)
      current = current.next
    }
    return copy
  }

  static from<T>(iterable: Iterable<T>, options?: Partial<LinkedHashSetOptions>): LinkedHashSet<T> {
    const set = new LinkedHashSet<T>(options)
    for (const value of iterable) {
      set.add(value)
    }
    return set
  }

  indexOf(value: T): number {
    if (!this.map.has(value)) {
      return -1
    }
    let idx = 0
    let current = this.head
    while (current !== null) {
      if (current.value === value) {
        return idx
      }
      idx++
      current = current.next
    }
    return -1
  }

  atIndex(index: number): T | undefined {
    if (index < 0) {
      return undefined
    }
    let i = 0
    let current = this.head
    while (current !== null) {
      if (i === index) {
        return current.value
      }
      i++
      current = current.next
    }
    return undefined
  }

  moveToFront(value: T): boolean {
    const node = this.map.get(value)
    if (node === undefined || node === this.head) {
      return node !== undefined
    }
    this.removeNode(node)
    node.next = this.head
    if (this.head !== null) {
      this.head.prev = node
    }
    this.head = node
    if (this.tail === null) {
      this.tail = node
    }
    return true
  }

  moveToBack(value: T): boolean {
    const node = this.map.get(value)
    if (node === undefined || node === this.tail) {
      return node !== undefined
    }
    this.removeNode(node)
    node.prev = this.tail
    if (this.tail !== null) {
      this.tail.next = node
    }
    this.tail = node
    if (this.head === null) {
      this.head = node
    }
    return true
  }

  stats(): LinkedHashSetStats {
    return {
      size: this.map.size,
      capacity: this.map.size,
    }
  }

  private removeNode(node: LinkedHashSetNode<T>): void {
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

export type { LinkedHashSetNode, LinkedHashSetOptions, LinkedHashSetStats } from './types.js'
export { DEFAULT_LINKED_HASH_SET_OPTIONS } from './types.js'
