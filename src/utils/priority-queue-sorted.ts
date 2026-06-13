export class PriorityQueueSorted<T> {
  private items: Array<{ priority: number; value: T }> = []

  enqueue(value: T, priority: number): void {
    let i = 0
    while (i < this.items.length && this.items[i]!.priority <= priority) i++
    this.items.splice(i, 0, { priority, value })
  }

  dequeue(): T | undefined {
    return this.items.length > 0 ? this.items.shift()!.value : undefined
  }

  peek(): T | undefined {
    return this.items.length > 0 ? this.items[0]!.value : undefined
  }

  peekPriority(): number | undefined {
    return this.items.length > 0 ? this.items[0]!.priority : undefined
  }

  get size(): number { return this.items.length }
  get isEmpty(): boolean { return this.items.length === 0 }

  clear(): void { this.items = [] }

  toArray(): T[] { return this.items.map((e) => e.value) }
  toString(): string { return JSON.stringify({ size: this.size }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): PriorityQueueSorted<T> {
    const c = new PriorityQueueSorted<T>()
    c.items = this.items.map((e) => ({ ...e }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PriorityQueueSorted)) return false
    return this.size === other.size
  }
}
