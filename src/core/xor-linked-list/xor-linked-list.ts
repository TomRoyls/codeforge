import type { XORLinkedListOptions, XORNodeResult, XORLinkedListStats } from './types.js'

class XORNode<T> {
  id: number
  value: T
  xorId: number

  constructor(id: number, value: T, xorId: number) {
    this.id = id
    this.value = value
    this.xorId = xorId
  }
}

export class XORLinkedList<T = unknown> {
  private nodes: Map<number, XORNode<T>> = new Map()
  private headId: number = 0
  private tailId: number = 0
  private _size: number = 0
  private nextId: number = 1
  private comparator?: (a: T, b: T) => number

  constructor(options?: XORLinkedListOptions<T>) {
    this.comparator = options?.comparator
    if (options?.initialValues) {
      for (const value of options.initialValues) {
        this.append(value)
      }
    }
  }

  private allocId(): number {
    return this.nextId++
  }

  private findPrev(nodeId: number): number {
    let prev = 0
    let currentId = this.headId
    while (currentId !== nodeId) {
      const node = this.nodes.get(currentId)!
      const next = node.xorId ^ prev
      prev = currentId
      currentId = next
    }
    return prev
  }

  append(value: T): number {
    const id = this.allocId()
    const node = new XORNode(id, value, this.tailId ^ 0)
    if (this._size === 0) {
      this.headId = id
      this.tailId = id
    } else {
      const tail = this.nodes.get(this.tailId)!
      tail.xorId = tail.xorId ^ 0 ^ id
      this.tailId = id
    }
    this.nodes.set(id, node)
    this._size++
    return id
  }

  prepend(value: T): number {
    const id = this.allocId()
    const node = new XORNode(id, value, 0 ^ this.headId)
    if (this._size === 0) {
      this.headId = id
      this.tailId = id
    } else {
      const head = this.nodes.get(this.headId)!
      head.xorId = head.xorId ^ 0 ^ id
      this.headId = id
    }
    this.nodes.set(id, node)
    this._size++
    return id
  }

  insertAfter(nodeId: number, value: T): number | undefined {
    if (!this.nodes.has(nodeId)) {
      return undefined
    }
    if (nodeId === this.tailId) {
      return this.append(value)
    }
    const target = this.nodes.get(nodeId)!
    const prev = nodeId === this.headId ? 0 : this.findPrev(nodeId)
    const nextId = target.xorId ^ prev
    const nextNode = this.nodes.get(nextId)!
    const id = this.allocId()
    const newNode = new XORNode(id, value, nodeId ^ nextId)
    target.xorId = target.xorId ^ nextId ^ id
    nextNode.xorId = nextNode.xorId ^ nodeId ^ id
    this.nodes.set(id, newNode)
    this._size++
    return id
  }

  insertBefore(nodeId: number, value: T): number | undefined {
    if (!this.nodes.has(nodeId)) {
      return undefined
    }
    if (nodeId === this.headId) {
      return this.prepend(value)
    }
    const target = this.nodes.get(nodeId)!
    const prevId = this.findPrev(nodeId)
    const prevNode = this.nodes.get(prevId)!
    const id = this.allocId()
    const newNode = new XORNode(id, value, prevId ^ nodeId)
    target.xorId = target.xorId ^ prevId ^ id
    prevNode.xorId = prevNode.xorId ^ nodeId ^ id
    this.nodes.set(id, newNode)
    this._size++
    return id
  }

  remove(nodeId: number): T | undefined {
    const node = this.nodes.get(nodeId)
    if (node === undefined) {
      return undefined
    }
    const value = node.value
    if (this._size === 1) {
      this.headId = 0
      this.tailId = 0
    } else if (nodeId === this.headId) {
      const nextId = node.xorId ^ 0
      const nextNode = this.nodes.get(nextId)!
      nextNode.xorId = nextNode.xorId ^ nodeId ^ 0
      this.headId = nextId
    } else if (nodeId === this.tailId) {
      const prevId = node.xorId ^ 0
      const prevNode = this.nodes.get(prevId)!
      prevNode.xorId = prevNode.xorId ^ nodeId ^ 0
      this.tailId = prevId
    } else {
      const prevId = this.findPrev(nodeId)
      const nextId = node.xorId ^ prevId
      const prevNode = this.nodes.get(prevId)!
      const nextNode = this.nodes.get(nextId)!
      prevNode.xorId = prevNode.xorId ^ nodeId ^ nextId
      nextNode.xorId = nextNode.xorId ^ prevId ^ nodeId
    }
    this.nodes.delete(nodeId)
    this._size--
    return value
  }

  get(nodeId: number): XORNodeResult<T> | undefined {
    const node = this.nodes.get(nodeId)
    if (node === undefined) {
      return undefined
    }
    return { id: node.id, value: node.value }
  }

  private equals(a: T, b: T): boolean {
    if (this.comparator) {
      return this.comparator(a, b) === 0
    }
    return a === b
  }

  find(value: T): number | undefined {
    let currentId = this.headId
    let prev = 0
    while (currentId !== 0) {
      const node = this.nodes.get(currentId)!
      if (this.equals(node.value, value)) {
        return currentId
      }
      const next = node.xorId ^ prev
      prev = currentId
      currentId = next
    }
    return undefined
  }

  toArray(): T[] {
    const result: T[] = []
    let currentId = this.headId
    let prev = 0
    while (currentId !== 0) {
      const node = this.nodes.get(currentId)!
      result.push(node.value)
      const next = node.xorId ^ prev
      prev = currentId
      currentId = next
    }
    return result
  }

  toReversedArray(): T[] {
    const result: T[] = []
    let currentId = this.tailId
    let next = 0
    while (currentId !== 0) {
      const node = this.nodes.get(currentId)!
      result.push(node.value)
      const prev = node.xorId ^ next
      next = currentId
      currentId = prev
    }
    return result
  }

  get first(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.nodes.get(this.headId)!.value
  }

  get last(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.nodes.get(this.tailId)!.value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.nodes.clear()
    this.headId = 0
    this.tailId = 0
    this._size = 0
  }

  forEach(callback: (value: T, index: number, nodeId: number) => void): void {
    let currentId = this.headId
    let prev = 0
    let index = 0
    while (currentId !== 0) {
      const node = this.nodes.get(currentId)!
      callback(node.value, index, node.id)
      const next = node.xorId ^ prev
      prev = currentId
      currentId = next
      index++
    }
  }

  forEachReverse(callback: (value: T, index: number, nodeId: number) => void): void {
    let currentId = this.tailId
    let next = 0
    let index = this._size - 1
    while (currentId !== 0) {
      const node = this.nodes.get(currentId)!
      callback(node.value, index, node.id)
      const prev = node.xorId ^ next
      next = currentId
      currentId = prev
      index--
    }
  }

  fromArray(values: T[]): void {
    this.clear()
    for (const value of values) {
      this.append(value)
    }
  }

  reverse(): void {
    if (this._size <= 1) {
      return
    }
    const temp = this.headId
    this.headId = this.tailId
    this.tailId = temp
  }

  stats(): XORLinkedListStats {
    const valueSet = new Set<unknown>()
    let min = Infinity
    let max = -Infinity
    for (const id of this.nodes.keys()) {
      if (id < min) min = id
      if (id > max) max = id
    }
    for (const node of this.nodes.values()) {
      valueSet.add(node.value)
    }
    return {
      size: this._size,
      memoryUsedBytes: this._size * 24,
      nodeIdRange: { min: this._size === 0 ? 0 : min, max: this._size === 0 ? 0 : max },
      uniqueValues: valueSet.size,
    }
  }
}

export type { XORLinkedListOptions, XORNodeResult, XORLinkedListStats } from './types.js'
