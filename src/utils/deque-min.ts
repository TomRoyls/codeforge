export class DequeMin {
  private data: number[] = []
  private mins: number[] = []

  pushBack(x: number): void {
    this.data.push(x)
    while (this.mins.length > 0 && this.mins[this.mins.length - 1]! > x) {
      this.mins.pop()
    }
    this.mins.push(x)
  }

  popFront(): number | undefined {
    if (this.data.length === 0) return undefined
    const val = this.data.shift()!
    if (val === this.mins[0]) this.mins.shift()
    return val
  }

  get min(): number | undefined {
    return this.mins[0]
  }

  get size(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  toArray(): number[] {
    return [...this.data]
  }
}
