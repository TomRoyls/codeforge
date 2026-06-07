export class ImplicitKeyTree {
  private data: number[] = []

  insert(index: number, val: number): void {
    if (index < 0) index = 0
    if (index > this.data.length) index = this.data.length
    this.data.splice(index, 0, val)
  }

  remove(index: number): number | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    return this.data.splice(index, 1)[0]
  }

  get(index: number): number | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    return this.data[index]
  }

  get length(): number {
    return this.data.length
  }

  toArray(): number[] {
    return [...this.data]
  }

  toString(): string {
    return `ImplicitKeyTree(${this.data.length})`
  }

  toJSON(): number[] {
    return [...this.data]
  }

  clone(): ImplicitKeyTree {
    const copy = new ImplicitKeyTree()
    copy.data = [...this.data]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ImplicitKeyTree)) return false
    if (this.data.length !== other.data.length) return false
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== other.data[i]) return false
    }
    return true
  }
}
