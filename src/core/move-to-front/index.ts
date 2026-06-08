import type { ListNode } from './types.js'
import { increment } from '../../utils/map-helpers.js'

export class MoveToFront<T> {
  private head: ListNode<T> | null = null
  private tail: ListNode<T> | null = null
  private nodeMap: Map<T, ListNode<T>> = new Map()
  private _size: number = 0
  private initialItems: T[]
  private frequencies: Map<T, number> = new Map()

  constructor(initialItems?: T[]) {
    this.initialItems = initialItems ? [...initialItems] : []
    const seen = new Set<T>()
    for (const item of this.initialItems) {
      if (!seen.has(item)) {
        seen.add(item)
        this.appendBack(item)
      }
    }
  }

  private appendBack(item: T): void {
    const node: ListNode<T> = { value: item, prev: null, next: null }
    this.nodeMap.set(item, node)
    if (!this.head) {
      this.head = node
      this.tail = node
    } else {
      node.prev = this.tail
      this.tail!.next = node
      this.tail = node
    }
    this._size++
  }

  private moveToHead(node: ListNode<T>): void {
    if (node === this.head) return
    if (node.prev) node.prev.next = node.next
    if (node.next) node.next.prev = node.prev
    if (node === this.tail) this.tail = node.prev
    node.prev = null
    node.next = this.head
    if (this.head) this.head.prev = node
    this.head = node
  }

  access(item: T): number {
    const node = this.nodeMap.get(item)
    if (!node) {
      this.add(item)
      return -1
    }
    let pos = 0
    let current = this.head
    while (current && current !== node) {
      pos++
      current = current.next
    }
    this.moveToHead(node)
    increment(this.frequencies, item)
    return pos
  }

  accessAt(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    let current = this.head!
    for (let i = 0; i < index; i++) {
      current = current.next!
    }
    this.moveToHead(current)
    increment(this.frequencies, current.value)
    return current.value
  }

  contains(item: T): boolean {
    return this.nodeMap.has(item)
  }

  positionOf(item: T): number {
    const node = this.nodeMap.get(item)
    if (!node) return -1
    let pos = 0
    let current = this.head
    while (current && current !== node) {
      pos++
      current = current.next
    }
    return pos
  }

  remove(item: T): boolean {
    const node = this.nodeMap.get(item)
    if (!node) return false
    if (node.prev) node.prev.next = node.next
    if (node.next) node.next.prev = node.prev
    if (node === this.head) this.head = node.next
    if (node === this.tail) this.tail = node.prev
    node.prev = null
    node.next = null
    this.nodeMap.delete(item)
    this._size--
    this.frequencies.delete(item)
    return true
  }

  add(item: T): void {
    if (this.nodeMap.has(item)) {
      this.moveToHead(this.nodeMap.get(item)!)
      increment(this.frequencies, item)
      return
    }
    const node: ListNode<T> = { value: item, prev: null, next: this.head }
    if (this.head) this.head.prev = node
    this.head = node
    if (!this.tail) this.tail = node
    this.nodeMap.set(item, node)
    this._size++
    increment(this.frequencies, item)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  encode(data: T[]): number[] {
    return data.map(item => this.access(item))
  }

  decode(positions: number[], alphabet?: T[]): T[] {
    const mtf = alphabet
      ? new MoveToFront<T>(alphabet)
      : new MoveToFront<T>(this.initialItems)
    return positions.map(pos => mtf.accessAt(pos))
  }

  reset(): void {
    this.head = null
    this.tail = null
    this.nodeMap.clear()
    this._size = 0
    this.frequencies.clear()
    const seen = new Set<T>()
    for (const item of this.initialItems) {
      if (!seen.has(item)) {
        seen.add(item)
        this.appendBack(item)
      }
    }
  }

  frequency(): Map<T, number> {
    return new Map(this.frequencies)
  }

  clone(): MoveToFront<T> {
    const cloned = new MoveToFront<T>()
    let current = this.tail
    while (current) {
      cloned.add(current.value)
      current = current.prev
    }
    cloned.frequencies = new Map(this.frequencies)
    return cloned
  }
}
