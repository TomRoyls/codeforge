export class StencilBuffer<T> {
  private data: (T | undefined)[]
  private mask: boolean[]
  private size: number

  constructor(size: number) {
    this.size = size
    this.data = new Array(size).fill(undefined)
    this.mask = new Array(size).fill(false)
  }

  set(index: number, value: T): void {
    if (index >= 0 && index < this.size) {
      this.data[index] = value
      this.mask[index] = true
    }
  }

  get(index: number): T | undefined {
    if (index >= 0 && index < this.size && this.mask[index]) return this.data[index]
    return undefined
  }

  has(index: number): boolean {
    return index >= 0 && index < this.size && this.mask[index]
  }

  delete(index: number): boolean {
    if (!this.has(index)) return false
    this.data[index] = undefined
    this.mask[index] = false
    return true
  }

  get count(): number { return this.mask.filter(Boolean).length }
  get isEmpty(): boolean { return this.count === 0 }
  get length(): number { return this.size }

  clear(): void { this.data.fill(undefined); this.mask.fill(false) }

  toArray(): (T | undefined)[] { return [...this.data] }
  toString(): string { return JSON.stringify({ size: this.size, count: this.count }) }
  toJSON(): Record<string, number> { return { size: this.size, count: this.count } }

  clone(): StencilBuffer<T> {
    const c = new StencilBuffer<T>(this.size)
    c.data = [...this.data]
    c.mask = [...this.mask]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof StencilBuffer)) return false
    return this.size === other.size && this.count === other.count
  }
}
