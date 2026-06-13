export class LinkedList2<T> {
  private head: number = -1
  private free: number = 0
  private data: Array<{ value: T; next: number }> = []
  private count = 0

  constructor(capacity = 16) {
    for (let i = 0; i < capacity; i++) {
      this.data.push({ value: undefined as T, next: i + 1 })
    }
    this.data[capacity - 1].next = -1
  }

  private alloc(): number {
    if (this.free === -1) {
      const idx = this.data.length
      this.data.push({ value: undefined as T, next: -1 })
      return idx
    }
    const idx = this.free
    this.free = this.data[idx].next
    return idx
  }

  private dealloc(idx: number): void {
    this.data[idx].value = undefined as T
    this.data[idx].next = this.free
    this.free = idx
  }

  prepend(value: T): void {
    const idx = this.alloc()
    this.data[idx] = { value, next: this.head }
    this.head = idx
    this.count++
  }

  append(value: T): void {
    const idx = this.alloc()
    this.data[idx] = { value, next: -1 }
    if (this.head === -1) {
      this.head = idx
    } else {
      let cur = this.head
      while (this.data[cur].next !== -1) cur = this.data[cur].next
      this.data[cur].next = idx
    }
    this.count++
  }

  removeHead(): T | undefined {
    if (this.head === -1) return undefined
    const idx = this.head
    const value = this.data[idx].value
    this.head = this.data[idx].next
    this.dealloc(idx)
    this.count--
    return value
  }

  find(value: T): boolean {
    let cur = this.head
    while (cur !== -1) {
      if (this.data[cur].value === value) return true
      cur = this.data[cur].next
    }
    return false
  }

  remove(value: T): boolean {
    if (this.head === -1) return false
    if (this.data[this.head].value === value) {
      this.removeHead()
      return true
    }
    let prev = this.head
    let cur = this.data[prev].next
    while (cur !== -1) {
      if (this.data[cur].value === value) {
        this.data[prev].next = this.data[cur].next
        this.dealloc(cur)
        this.count--
        return true
      }
      prev = cur
      cur = this.data[cur].next
    }
    return false
  }

  peekHead(): T | undefined {
    return this.head === -1 ? undefined : this.data[this.head].value
  }

  get size(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }

  clear(): void {
    this.head = -1
    this.count = 0
    this.free = 0
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = { value: undefined as T, next: i + 1 }
    }
    this.data[this.data.length - 1].next = -1
  }

  toArray(): T[] {
    const result: T[] = []
    let cur = this.head
    while (cur !== -1) {
      result.push(this.data[cur].value)
      cur = this.data[cur].next
    }
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count }) }
  toJSON(): Record<string, number> { return { size: this.count } }

  clone(): LinkedList2<T> {
    const c = new LinkedList2<T>()
    const items = this.toArray()
    for (let i = items.length - 1; i >= 0; i--) c.prepend(items[i])
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LinkedList2)) return false
    return this.size === other.size
  }
}
