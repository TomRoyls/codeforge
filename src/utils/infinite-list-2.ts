export class InfiniteList2<T> {
  private head: T
  private nextFn: (v: T) => T

  constructor(head: T, nextFn: (v: T) => T) {
    this.head = head
    this.nextFn = nextFn
  }

  static naturals(start = 0): InfiniteList2<number> {
    return new InfiniteList2(start, (n) => n + 1)
  }

  static constant<T>(value: T): InfiniteList2<T> {
    return new InfiniteList2(value, (v) => v)
  }

  static iterate<T>(initial: T, fn: (v: T) => T): InfiniteList2<T> {
    return new InfiniteList2(initial, fn)
  }

  at(index: number): T {
    let current = this.head
    for (let i = 0; i < index; i++) current = this.nextFn(current)
    return current
  }

  take(n: number): T[] {
    const result: T[] = []
    let current = this.head
    for (let i = 0; i < n; i++) {
      result.push(current)
      current = this.nextFn(current)
    }
    return result
  }

  takeWhile(pred: (v: T) => boolean): T[] {
    const result: T[] = []
    let current = this.head
    while (pred(current)) {
      result.push(current)
      current = this.nextFn(current)
    }
    return result
  }

  filter(pred: (v: T) => boolean): T[] {
    const result: T[] = []
    let current = this.head
    const limit = 10000
    for (let i = 0; i < limit; i++) {
      if (pred(current)) result.push(current)
      current = this.nextFn(current)
    }
    return result.slice(0, 100)
  }

  map<R>(fn: (v: T) => R, count: number): R[] {
    const result: R[] = []
    let current = this.head
    for (let i = 0; i < count; i++) {
      result.push(fn(current))
      current = this.nextFn(current)
    }
    return result
  }

  toString(): string { return JSON.stringify({ infinite: true }) }
  toJSON(): Record<string, unknown> { return { infinite: true } }
  clone(): InfiniteList2<T> { return new InfiniteList2(this.head, this.nextFn) }
  equals(other: unknown): boolean { return other instanceof InfiniteList2 }
}
