export class Deque2<T> {
  private data: T[] = []

  pushFront(item: T): void { this.data.unshift(item) }
  pushBack(item: T): void { this.data.push(item) }
  popFront(): T | undefined { return this.data.shift() }
  popBack(): T | undefined { return this.data.pop() }

  peekFront(): T | undefined { return this.data[0] }
  peekBack(): T | undefined { return this.data[this.data.length - 1] }

  get(index: number): T | undefined { return this.data[index] }

  get size(): number { return this.data.length }
  get isEmpty(): boolean { return this.data.length === 0 }

  clear(): void { this.data = [] }

  toArray(): T[] { return [...this.data] }
  toString(): string { return JSON.stringify({ size: this.data.length }) }
  toJSON(): Record<string, number> { return { size: this.data.length } }

  clone(): Deque2<T> {
    const c = new Deque2<T>()
    c.data = [...this.data]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Deque2)) return false
    return this.size === other.size
  }
}
