export class CircularShift<T> {
  private data: T[]
  private shift: number

  constructor(items: T[], shiftCount = 0) {
    this.data = [...items]
    this.shift = ((shiftCount % items.length) + items.length) % items.length
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    return this.data[(index + this.shift) % this.data.length]
  }

  get length(): number {
    return this.data.length
  }

  get shiftCount(): number {
    return this.shift
  }

  rotate(n: number): void {
    this.shift = ((this.shift + n) % this.data.length + this.data.length) % this.data.length
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.data.length; i++) {
      result.push(this.data[(i + this.shift) % this.data.length]!)
    }
    return result
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[(i + this.shift) % this.data.length] === value) return i
    }
    return -1
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): CircularShift<T> {
    return new CircularShift(this.data, this.shift)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CircularShift)) return false
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}
