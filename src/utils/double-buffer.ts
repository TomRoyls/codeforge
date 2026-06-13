export class DoubleBuffer<T> {
  private front: T[] = []
  private back: T[] = []

  writeToBack(item: T): void { this.back.push(item) }

  swap(): void {
    this.front = this.back
    this.back = []
  }

  readFront(): T[] { return [...this.front] }

  get frontSize(): number { return this.front.length }
  get backSize(): number { return this.back.length }
  get isEmpty(): boolean { return this.front.length === 0 && this.back.length === 0 }

  clear(): void { this.front = []; this.back = [] }

  toArray(): T[] { return [...this.front, ...this.back] }
  toString(): string { return JSON.stringify({ front: this.frontSize, back: this.backSize }) }
  toJSON(): Record<string, number> { return { front: this.frontSize, back: this.backSize } }

  clone(): DoubleBuffer<T> {
    const c = new DoubleBuffer<T>()
    c.front = [...this.front]
    c.back = [...this.back]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DoubleBuffer)) return false
    return this.frontSize === other.frontSize && this.backSize === other.backSize
  }
}
