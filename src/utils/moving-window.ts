export class MovingWindow<T> {
  private readonly items: T[] = []
  private _front: number = 0

  constructor(private readonly _maxSize: number) {
    if (_maxSize < 1) throw new RangeError(`maxSize must be >= 1, got ${_maxSize}`)
  }

  push(item: T): void {
    if (this.items.length < this._maxSize) {
      this.items.push(item)
    } else {
      this.items[this._front] = item
      this._front = (this._front + 1) % this._maxSize
    }
  }

  get size(): number {
    return this.items.length
  }

  get maxSize(): number {
    return this._maxSize
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  get isFull(): boolean {
    return this.items.length === this._maxSize
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined
    return this.items[(this._front + index) % this.items.length]
  }

  first(): T | undefined {
    return this.isEmpty ? undefined : this.at(0)
  }

  last(): T | undefined {
    if (this.isEmpty) return undefined
    return this.items[(this._front + this.items.length - 1) % this.items.length]
  }

  toArray(): T[] {
    if (this._front === 0 || this.items.length < this._maxSize) {
      return [...this.items]
    }
    const result: T[] = []
    for (let i = 0; i < this.items.length; i++) {
      result.push(this.items[(this._front + i) % this.items.length]!)
    }
    return result
  }

  sum(): number {
    let total = 0
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]!
      if (typeof item === 'number') total += item
    }
    return total
  }

  mean(): number | undefined {
    if (this.isEmpty) return undefined
    return this.sum() / this.items.length
  }

  min(): T | undefined {
    if (this.isEmpty) return undefined
    let minVal = this.items[0]!
    for (let i = 1; i < this.items.length; i++) {
      const item = this.items[i]!
      if (item < minVal) minVal = item
    }
    return minVal
  }

  max(): T | undefined {
    if (this.isEmpty) return undefined
    let maxVal = this.items[0]!
    for (let i = 1; i < this.items.length; i++) {
      const item = this.items[i]!
      if (item > maxVal) maxVal = item
    }
    return maxVal
  }

  clear(): void {
    this.items.length = 0
    this._front = 0
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      callback(this.items[(this._front + i) % this.items.length]!, i)
    }
  }

  reduce<U>(callback: (acc: U, item: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this.items.length; i++) {
      acc = callback(acc, this.items[(this._front + i) % this.items.length]!, i)
    }
    return acc
  }
}
