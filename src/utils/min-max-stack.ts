/**
 * MinMaxStack — A stack that supports O(1) minimum and maximum queries.
 *
 * Internally maintains auxiliary stacks tracking the min and max at each level.
 * Useful for sliding window problems, expression evaluation, and range queries.
 */
export class MinMaxStack<T> {
  private readonly main: T[] = []
  private readonly minStack: T[] = []
  private readonly maxStack: T[] = []
  private readonly compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  /** Push a value onto the stack. O(1). */
  push(value: T): void {
    this.main.push(value)
    const minTop = this.minStack[this.minStack.length - 1]
    this.minStack.push(
      this.minStack.length === 0 || this.compare(value, minTop!) < 0
        ? value
        : minTop!
    )
    const maxTop = this.maxStack[this.maxStack.length - 1]
    this.maxStack.push(
      this.maxStack.length === 0 || this.compare(value, maxTop!) > 0
        ? value
        : maxTop!
    )
  }

  /** Pop and return the top value. Throws if empty. */
  pop(): T {
    if (this.main.length === 0) {
      throw new RangeError('Cannot pop from empty MinMaxStack')
    }
    this.minStack.pop()
    this.maxStack.pop()
    return this.main.pop()!
  }

  /** Peek at the top value without removing it. Throws if empty. */
  peek(): T {
    if (this.main.length === 0) {
      throw new RangeError('Cannot peek empty MinMaxStack')
    }
    return this.main[this.main.length - 1]!
  }

  /** Get the current minimum value. Throws if empty. */
  min(): T {
    if (this.minStack.length === 0) {
      throw new RangeError('Cannot get min of empty MinMaxStack')
    }
    return this.minStack[this.minStack.length - 1]!
  }

  /** Get the current maximum value. Throws if empty. */
  max(): T {
    if (this.maxStack.length === 0) {
      throw new RangeError('Cannot get max of empty MinMaxStack')
    }
    return this.maxStack[this.maxStack.length - 1]!
  }

  /** Number of elements in the stack. */
  get size(): number {
    return this.main.length
  }

  /** Check if the stack is empty. */
  isEmpty(): boolean {
    return this.main.length === 0
  }

  /** Remove all elements. */
  clear(): void {
    this.main.length = 0
    this.minStack.length = 0
    this.maxStack.length = 0
  }

  /** Convert to array (bottom to top). */
  toArray(): T[] {
    return [...this.main]
  }
}
