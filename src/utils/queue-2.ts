export class Queue2<T> {
  private data: T[] = []

  enqueue(item: T): void { this.data.push(item) }
  dequeue(): T | undefined { return this.data.shift() }
  peek(): T | undefined { return this.data[0] }

  get(index: number): T | undefined { return this.data[index] }

  get size(): number { return this.data.length }
  get isEmpty(): boolean { return this.data.length === 0 }

  clear(): void { this.data = [] }

  toArray(): T[] { return [...this.data] }
  toString(): string { return JSON.stringify({ size: this.data.length }) }
  toJSON(): Record<string, number> { return { size: this.data.length } }

  clone(): Queue2<T> {
    const c = new Queue2<T>()
    c.data = [...this.data]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Queue2)) return false
    return this.size === other.size
  }
}
