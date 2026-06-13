export class MinStack {
  private stack: number[] = []
  private minStack: number[] = []

  push(value: number): void {
    this.stack.push(value)
    if (this.minStack.length === 0 || value <= this.minStack[this.minStack.length - 1]!) {
      this.minStack.push(value)
    }
  }

  pop(): number | undefined {
    if (this.stack.length === 0) return undefined
    const value = this.stack.pop()!
    if (value === this.minStack[this.minStack.length - 1]) this.minStack.pop()
    return value
  }

  min(): number | undefined {
    return this.minStack.length > 0 ? this.minStack[this.minStack.length - 1] : undefined
  }

  peek(): number | undefined {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined
  }

  get size(): number { return this.stack.length }
  get isEmpty(): boolean { return this.stack.length === 0 }

  clear(): void { this.stack = []; this.minStack = [] }

  toArray(): number[] { return [...this.stack] }
  toString(): string { return JSON.stringify({ size: this.size }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): MinStack {
    const c = new MinStack()
    c.stack = [...this.stack]
    c.minStack = [...this.minStack]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MinStack)) return false
    return this.size === other.size
  }
}
