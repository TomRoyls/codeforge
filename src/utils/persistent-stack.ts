export class PersistentStack<T> {
  private readonly top: StackNode<T> | null
  readonly size: number

  private constructor(top: StackNode<T> | null, size: number) {
    this.top = top
    this.size = size
  }

  static empty<T>(): PersistentStack<T> {
    return new PersistentStack<T>(null, 0)
  }

  static of<T>(...items: T[]): PersistentStack<T> {
    let stack = PersistentStack.empty<T>()
    for (const item of items) {
      stack = stack.push(item)
    }
    return stack
  }

  push(value: T): PersistentStack<T> {
    return new PersistentStack(new StackNode(value, this.top), this.size + 1)
  }

  pop(): PersistentStack<T> {
    if (this.top === null) return this
    return new PersistentStack(this.top.next, this.size - 1)
  }

  peek(): T | undefined {
    if (this.top === null) return undefined
    return this.top.value
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  toArray(): T[] {
    const result: T[] = []
    let node = this.top
    while (node !== null) {
      result.push(node.value)
      node = node.next
    }
    return result
  }

  reverse(): PersistentStack<T> {
    let stack = PersistentStack.empty<T>()
    let node = this.top
    while (node !== null) {
      stack = stack.push(node.value)
      node = node.next
    }
    return stack
  }

  concat(other: PersistentStack<T>): PersistentStack<T> {
    const items = [...other.toArray().reverse(), ...this.toArray().reverse()]
    let stack = PersistentStack.empty<T>()
    for (const item of items) {
      stack = stack.push(item)
    }
    return stack
  }
}

class StackNode<T> {
  constructor(
    readonly value: T,
    readonly next: StackNode<T> | null,
  ) {}
}
