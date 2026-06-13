export class MaxStack {
  private stack: number[] = []
  private maxStack: number[] = []

  push(value: number): void {
    this.stack.push(value)
    if (this.maxStack.length === 0 || value >= this.maxStack[this.maxStack.length - 1]!) {
      this.maxStack.push(value)
    }
  }

  pop(): number | undefined {
    if (this.stack.length === 0) return undefined
    const value = this.stack.pop()!
    if (value === this.maxStack[this.maxStack.length - 1]) this.maxStack.pop()
    return value
  }

  max(): number | undefined {
    return this.maxStack.length > 0 ? this.maxStack[this.maxStack.length - 1] : undefined
  }

  peek(): number | undefined {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined
  }

  get size(): number { return this.stack.length }
  get isEmpty(): boolean { return this.stack.length === 0 }

  clear(): void { this.stack = []; this.maxStack = [] }

  toArray(): number[] { return [...this.stack] }
  toString(): string { return JSON.stringify({ size: this.size }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): MaxStack {
    const c = new MaxStack()
    c.stack = [...this.stack]
    c.maxStack = [...this.maxStack]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MaxStack)) return false
    return this.size === other.size
  }
}
