export class DoubleBuffer<T> {
  private front: T[]
  private back: T[]
  private _totalSwaps = 0

  constructor() {
    this.front = []
    this.back = []
  }

  push(item: T): void {
    this.back.push(item)
  }

  pushMany(items: Iterable<T>): void {
    for (const item of items) {
      this.back.push(item)
    }
  }

  swap(): T[] {
    const ready = this.front
    this.front = this.back
    this.back = ready
    this.back.length = 0
    this._totalSwaps++
    return this.front
  }

  get frontBuffer(): readonly T[] {
    return this.front
  }

  get backBuffer(): readonly T[] {
    return this.back
  }

  get pendingCount(): number {
    return this.back.length
  }

  get readyCount(): number {
    return this.front.length
  }

  get totalSwaps(): number {
    return this._totalSwaps
  }

  get isEmpty(): boolean {
    return this.front.length === 0 && this.back.length === 0
  }

  get hasPending(): boolean {
    return this.back.length > 0
  }

  clear(): void {
    this.front.length = 0
    this.back.length = 0
  }

  consumeFront(callback: (item: T) => void): void {
    for (const item of this.front) {
      callback(item)
    }
  }

  consumeSwap(callback: (item: T) => void): void {
    const items = this.swap()
    for (const item of items) {
      callback(item)
    }
  }

  drainFront(): T[] {
    const result = this.front
    this.front = []
    return result
  }
}
