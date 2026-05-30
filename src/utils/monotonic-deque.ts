export class MonotonicDeque<T> {
  private deque: Array<{ value: T; index: number }> = []
  private head: number = 0
  private globalIndex: number = 0
  private readonly shouldEvict: (newValue: T, backValue: T) => boolean

  constructor(mode: 'min' | 'max' = 'min') {
    this.shouldEvict = mode === 'min'
      ? (a, b) => a < b
      : (a, b) => a > b
  }

  push(value: T): number {
    const idx = this.globalIndex++
    while (this.deque.length > this.head) {
      const back = this.deque[this.deque.length - 1]!
      if (!this.shouldEvict(value, back.value)) break
      this.deque.pop()
    }
    this.deque.push({ value, index: idx })
    return idx
  }

  front(): T | undefined {
    return this.deque[this.head]?.value
  }

  back(): T | undefined {
    return this.deque[this.deque.length - 1]?.value
  }

  shift(): T | undefined {
    if (this.head >= this.deque.length) return undefined
    const item = this.deque[this.head]
    this.head++
    if (this.head > this.deque.length / 2) {
      this.deque = this.deque.slice(this.head)
      this.head = 0
    }
    return item?.value
  }

  pop(): T | undefined {
    return this.deque.pop()?.value
  }

  expireBefore(index: number): void {
    while (this.head < this.deque.length && this.deque[this.head]!.index < index) {
      this.head++
    }
    if (this.head > this.deque.length / 2) {
      this.deque = this.deque.slice(this.head)
      this.head = 0
    }
  }

  get size(): number {
    return this.deque.length - this.head
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = this.head; i < this.deque.length; i++) {
      result.push(this.deque[i]!.value)
    }
    return result
  }
}
