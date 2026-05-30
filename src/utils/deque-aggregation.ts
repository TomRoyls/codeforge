interface StackEntry<T> {
  value: T
  aggregate: T
}

export class DequeAggregation<T> {
  private frontStack: StackEntry<T>[] = []
  private backStack: StackEntry<T>[] = []
  private _size: number = 0

  constructor(private readonly mergeFn: (a: T, b: T) => T) {}

  pushBack(val: T): void {
    const aggregate = this.backStack.length === 0
      ? val
      : this.mergeFn(this.backStack[this.backStack.length - 1]!.aggregate, val)
    this.backStack.push({ value: val, aggregate })
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    if (this.frontStack.length === 0) {
      this.moveBackToFront()
    }
    const entry = this.frontStack.pop()
    if (entry === undefined) return undefined
    this._size--
    return entry.value
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    if (this.frontStack.length === 0) {
      this.moveBackToFront()
    }
    return this.frontStack[this.frontStack.length - 1]!.value
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    if (this.backStack.length === 0) {
      return this.frontStack[0]?.value
    }
    return this.backStack[this.backStack.length - 1]!.value
  }

  aggregate(): T | undefined {
    if (this._size === 0) return undefined
    const frontAggregate = this.frontStack.length > 0
      ? this.frontStack[this.frontStack.length - 1]!.aggregate
      : undefined
    const backAggregate = this.backStack.length > 0
      ? this.backStack[this.backStack.length - 1]!.aggregate
      : undefined
    if (frontAggregate === undefined) return backAggregate
    if (backAggregate === undefined) return frontAggregate
    return this.mergeFn(frontAggregate, backAggregate)
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this.frontStack = []
    this.backStack = []
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private moveBackToFront(): void {
    let runningAggregate: T | undefined = undefined
    while (this.backStack.length > 0) {
      const entry = this.backStack.pop()
      if (entry === undefined) continue
      runningAggregate = runningAggregate === undefined
        ? entry.value
        : this.mergeFn(entry.value, runningAggregate)
      this.frontStack.push({ value: entry.value, aggregate: runningAggregate })
    }
  }
}