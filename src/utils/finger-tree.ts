export class FingerTree<T> {
  private readonly items: T[]

  private constructor(items: T[]) {
    this.items = items
  }

  static empty<T>(): FingerTree<T> {
    return new FingerTree<T>([])
  }

  static from<T>(items: T[]): FingerTree<T> {
    return new FingerTree([...items])
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  get size(): number {
    return this.items.length
  }

  pushFront(value: T): FingerTree<T> {
    return new FingerTree([value, ...this.items])
  }

  pushBack(value: T): FingerTree<T> {
    return new FingerTree([...this.items, value])
  }

  peekFront(): T | undefined {
    return this.items[0]
  }

  peekBack(): T | undefined {
    return this.items.length > 0 ? this.items[this.items.length - 1] : undefined
  }

  popFront(): FingerTree<T> {
    if (this.items.length === 0) return this
    return new FingerTree(this.items.slice(1))
  }

  popBack(): FingerTree<T> {
    if (this.items.length === 0) return this
    return new FingerTree(this.items.slice(0, -1))
  }

  concat(other: FingerTree<T>): FingerTree<T> {
    return new FingerTree([...this.items, ...other.items])
  }

  get(index: number): T | undefined {
    return this.items[index]
  }

  toArray(): T[] {
    return [...this.items]
  }
}
