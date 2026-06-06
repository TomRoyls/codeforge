export class LinkedList<T> {
  private head: Node<T> | null = null
  private tail: Node<T> | null = null
  private _size: number = 0

  append(value: T): void {
    const node = new Node(value)
    if (this.tail === null) {
      this.head = node
      this.tail = node
    } else {
      node.prev = this.tail
      this.tail.next = node
      this.tail = node
    }
    this._size++
  }

  prepend(value: T): void {
    const node = new Node(value)
    if (this.head === null) {
      this.head = node
      this.tail = node
    } else {
      node.next = this.head
      this.head.prev = node
      this.head = node
    }
    this._size++
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) return
    if (index === 0) {
      this.prepend(value)
      return
    }
    if (index === this._size) {
      this.append(value)
      return
    }
    const current = this.getNode(index)
    if (current === null) return
    const node = new Node(value)
    node.prev = current.prev
    node.next = current
    if (current.prev !== null) {
      current.prev.next = node
    }
    current.prev = node
    this._size++
  }

  removeAt(index: number): T | undefined {
    const node = this.getNode(index)
    if (node === null) return undefined
    return this.removeNode(node)
  }

  remove(value: T): boolean {
    let current = this.head
    while (current !== null) {
      if (current.value === value) {
        this.removeNode(current)
        return true
      }
      current = current.next
    }
    return false
  }

  get(index: number): T | undefined {
    const node = this.getNode(index)
    return node?.value
  }

  indexOf(value: T): number {
    let current = this.head
    let index = 0
    while (current !== null) {
      if (current.value === value) return index
      current = current.next
      index++
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  get first(): T | undefined {
    return this.head?.value
  }

  get last(): T | undefined {
    return this.tail?.value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.head = null
    this.tail = null
    this._size = 0
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

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head
    let index = 0
    while (current !== null) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  reverse(): void {
    let current = this.head
    while (current !== null) {
      const temp = current.next
      current.next = current.prev
      current.prev = temp
      current = temp
    }
    const temp = this.head
    this.head = this.tail
    this.tail = temp
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head
    while (current !== null) {
      yield current.value
      current = current.next
    }
  }

  toString(): string {
    const parts: string[] = []
    let current = this.head
    while (current !== null) {
      parts.push(String(current.value))
      current = current.next
    }
    return `[${parts.join(' -> ')}]`
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): this {
    const c = new LinkedList<T>()
    let current = this.head
    while (current !== null) {
      c.append(current.value)
      current = current.next
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LinkedList)) return false
    if (this._size !== other._size) return false
    const a = this.toArray()
    const b = other.toArray()
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false
    }
    return true
  }

  private getNode(index: number): Node<T> | null {
    if (index < 0 || index >= this._size) return null
    if (index < this._size / 2) {
      let current = this.head
      for (let i = 0; i < index; i++) {
        current = current!.next
      }
      return current
    }
    let current = this.tail
    for (let i = this._size - 1; i > index; i--) {
      current = current!.prev
    }
    return current
  }

  private removeNode(node: Node<T>): T {
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
    this._size--
    return node.value
  }
}

class Node<T> {
  value: T
  prev: Node<T> | null = null
  next: Node<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}
