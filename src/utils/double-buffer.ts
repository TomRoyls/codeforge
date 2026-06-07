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

  toString(): string {
    return `DoubleBuffer(front=${this.front.length}, back=${this.back.length})`
  }

  toJSON(): { front: T[]; back: T[]; swaps: number } {
    return { front: [...this.front], back: [...this.back], swaps: this._totalSwaps }
  }

  clone(): DoubleBuffer<T> {
    const copy = new DoubleBuffer<T>()
    copy.front = [...this.front]
    copy.back = [...this.back]
    copy._totalSwaps = this._totalSwaps
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DoubleBuffer)) return false
    if (this._totalSwaps !== other._totalSwaps) return false
    if (this.front.length !== other.front.length) return false
    if (this.back.length !== other.back.length) return false
    return true
  }
}
