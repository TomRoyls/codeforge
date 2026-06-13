export class Stack2<T> {
  private data: T[] = []

  push(item: T): void { this.data.push(item) }
  pop(): T | undefined { return this.data.pop() }
  peek(): T | undefined { return this.data[this.data.length - 1] }

  get(index: number): T | undefined { return this.data[index] }

  get size(): number { return this.data.length }
  get isEmpty(): boolean { return this.data.length === 0 }

  clear(): void { this.data = [] }

  toArray(): T[] { return [...this.data].reverse() }
  toString(): string { return JSON.stringify({ size: this.data.length }) }
  toJSON(): Record<string, number> { return { size: this.data.length } }

  clone(): Stack2<T> {
    const c = new Stack2<T>()
    c.data = [...this.data]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Stack2)) return false
    return this.size === other.size
  }
}
