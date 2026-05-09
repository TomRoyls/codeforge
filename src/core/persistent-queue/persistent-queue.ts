import type { ElementComparator, StackNode } from './types.js'

export class PersistentQueue<T> {
  readonly version: number
  readonly timestamp: number

  private readonly frontStack: StackNode<T> | null
  private readonly rearStack: StackNode<T> | null
  private readonly _size: number
  private readonly _previous: PersistentQueue<T> | null
  private readonly _lastValue: T | undefined

  private constructor(
    frontStack: StackNode<T> | null,
    rearStack: StackNode<T> | null,
    queueSize: number,
    version: number,
    previous: PersistentQueue<T> | null,
    lastValue: T | undefined,
    timestamp: number,
  ) {
    this.frontStack = frontStack
    this.rearStack = rearStack
    this._size = queueSize
    this.version = version
    this._previous = previous
    this._lastValue = lastValue
    this.timestamp = timestamp
  }

  static empty<T>(): PersistentQueue<T> {
    return new PersistentQueue<T>(null, null, 0, 0, null, undefined, Date.now())
  }

  enqueue(value: T): PersistentQueue<T> {
    const newRear: StackNode<T> = { value, next: this.rearStack }
    return new PersistentQueue<T>(
      this.frontStack,
      newRear,
      this._size + 1,
      this.version + 1,
      this,
      value,
      Date.now(),
    )
  }

  dequeue(): { queue: PersistentQueue<T>; value: T | undefined } {
    if (this._size === 0) {
      return { queue: this, value: undefined }
    }

    let front = this.frontStack
    let rear = this.rearStack

    if (front === null) {
      front = reverseStack(rear)
      rear = null
    }

    const value = front!.value
    const newFront = front!.next
    const newSize = this._size - 1
    const newLast = newSize === 0 ? undefined : this._lastValue

    return {
      queue: new PersistentQueue<T>(newFront, rear, newSize, this.version + 1, this, newLast, Date.now()),
      value,
    }
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    if (this.frontStack !== null) return this.frontStack.value
    return stackBottom(this.rearStack)
  }

  last(): T | undefined {
    return this._lastValue
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): T[] {
    const frontArr = stackToArray(this.frontStack)
    const rearArr = stackToArray(this.rearStack)
    rearArr.reverse()
    return [...frontArr, ...rearArr]
  }

  map<U>(fn: (value: T) => U): PersistentQueue<U> {
    const arr = this.toArray()
    let result = PersistentQueue.empty<U>()
    for (const item of arr) {
      result = result.enqueue(fn(item))
    }
    return result
  }

  filter(fn: (value: T) => boolean): PersistentQueue<T> {
    const arr = this.toArray()
    let result = PersistentQueue.empty<T>()
    for (const item of arr) {
      if (fn(item)) {
        result = result.enqueue(item)
      }
    }
    return result
  }

  forEach(fn: (value: T) => void): void {
    const arr = this.toArray()
    for (const item of arr) {
      fn(item)
    }
  }

  equals(other: PersistentQueue<T>, comparator?: ElementComparator<T>): boolean {
    if (this === other) return true
    if (this._size !== other._size) return false

    const thisArr = this.toArray()
    const otherArr = other.toArray()
    const cmp: ElementComparator<T> = comparator ?? ((a: T, b: T) => a === b)

    for (let i = 0; i < thisArr.length; i++) {
      if (!cmp(thisArr[i]!, otherArr[i]!)) return false
    }
    return true
  }

  toString(): string {
    return `PersistentQueue([${this.toArray().join(', ')}])`
  }

  previous(): PersistentQueue<T> | null {
    return this._previous
  }

  atVersion(targetVersion: number): PersistentQueue<T> | null {
    if (targetVersion === this.version) return this
    if (targetVersion > this.version) return null
    if (targetVersion < 0) return null

    let current: PersistentQueue<T> | null = this
    while (current !== null && current.version !== targetVersion) {
      current = current._previous
    }
    return current
  }

  history(): PersistentQueue<T>[] {
    const result: PersistentQueue<T>[] = []
    let current: PersistentQueue<T> | null = this
    while (current !== null) {
      result.unshift(current)
      current = current._previous
    }
    return result
  }
}

function reverseStack<T>(stack: StackNode<T> | null): StackNode<T> | null {
  let result: StackNode<T> | null = null
  let current: StackNode<T> | null = stack
  while (current !== null) {
    result = { value: current.value, next: result }
    current = current.next
  }
  return result
}

function stackBottom<T>(stack: StackNode<T> | null): T | undefined {
  if (stack === null) return undefined
  let current: StackNode<T> = stack
  while (current.next !== null) {
    current = current.next
  }
  return current.value
}

function stackToArray<T>(stack: StackNode<T> | null): T[] {
  const result: T[] = []
  let current: StackNode<T> | null = stack
  while (current !== null) {
    result.push(current.value)
    current = current.next
  }
  return result
}
