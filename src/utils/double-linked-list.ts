export class DoubleLinkedList<T> {
  private head: ListNode<T> | null = null
  private tail: ListNode<T> | null = null
  private _size = 0

  pushFront(value: T): void {
    const node: ListNode<T> = { value, prev: null, next: this.head }
    if (this.head) this.head.prev = node
    else this.tail = node
    this.head = node
    this._size++
  }

  pushBack(value: T): void {
    const node: ListNode<T> = { value, prev: this.tail, next: null }
    if (this.tail) this.tail.next = node
    else this.head = node
    this.tail = node
    this._size++
  }

  popFront(): T | undefined {
    if (!this.head) return undefined
    const value = this.head.value
    this.head = this.head.next
    if (this.head) this.head.prev = null
    else this.tail = null
    this._size--
    return value
  }

  popBack(): T | undefined {
    if (!this.tail) return undefined
    const value = this.tail.value
    this.tail = this.tail.prev
    if (this.tail) this.tail.next = null
    else this.head = null
    this._size--
    return value
  }

  peekFront(): T | undefined {
    return this.head?.value
  }

  peekBack(): T | undefined {
    return this.tail?.value
  }

  get size(): number {
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

  toArrayReverse(): T[] {
    const result: T[] = []
    let current = this.tail
    while (current) {
      result.push(current.value)
      current = current.prev
    }
    return result
  }

  contains(value: T): boolean {
    let current = this.head
    while (current) {
      if (current.value === value) return true
      current = current.next
    }
    return false
  }

  remove(value: T): boolean {
    let current = this.head
    while (current) {
      if (current.value === value) {
        if (current.prev) current.prev.next = current.next
        else this.head = current.next
        if (current.next) current.next.prev = current.prev
        else this.tail = current.prev
        this._size--
        return true
      }
      current = current.next
    }
    return false
  }

  clear(): void {
    this.head = null
    this.tail = null
    this._size = 0
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head
    let i = 0
    while (current) {
      callback(current.value, i++)
      current = current.next
    }
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): DoubleLinkedList<T> {
    const copy = new DoubleLinkedList<T>()
    this.forEach((v) => copy.pushBack(v))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DoubleLinkedList)) return false
    if (this._size !== other._size) return false
    const a = this.toArray()
    const b = other.toArray()
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}

interface ListNode<T> {
  value: T
  prev: ListNode<T> | null
  next: ListNode<T> | null
}
