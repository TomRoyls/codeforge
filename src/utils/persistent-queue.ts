export class PersistentQueue<T> {
  private readonly front: T[]
  private readonly back: T[]

  private constructor(front: T[], back: T[]) {
    this.front = front
    this.back = back
  }

  static create<T>(): PersistentQueue<T> {
    return new PersistentQueue<T>([], [])
  }

  enqueue(value: T): PersistentQueue<T> {
    return new PersistentQueue(this.front, [value, ...this.back])
  }

  dequeue(): { queue: PersistentQueue<T>; value: T } | null {
    if (this.front.length > 0) {
      const newFront = this.front.slice(1)
      return { queue: new PersistentQueue(newFront, this.back), value: this.front[0]! }
    }
    if (this.back.length > 0) {
      const reversed = [...this.back].reverse()
      const value = reversed[0]!
      const newFront = reversed.slice(1)
      return { queue: new PersistentQueue(newFront, []), value }
    }
    return null
  }

  peek(): T | undefined {
    if (this.front.length > 0) return this.front[0]
    if (this.back.length > 0) return this.back[this.back.length - 1]
    return undefined
  }

  get size(): number {
    return this.front.length + this.back.length
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  toArray(): T[] {
    return [...this.front, ...[...this.back].reverse()]
  }
}
