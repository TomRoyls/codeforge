export class StackMachine {
  private stack: number[] = []

  push(value: number): void {
    this.stack.push(value)
  }

  pop(): number | undefined {
    return this.stack.pop()
  }

  peek(): number | undefined {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined
  }

  add(): number | undefined {
    if (this.stack.length < 2) return undefined
    const b = this.stack.pop()!
    const a = this.stack.pop()!
    const result = a + b
    this.stack.push(result)
    return result
  }

  sub(): number | undefined {
    if (this.stack.length < 2) return undefined
    const b = this.stack.pop()!
    const a = this.stack.pop()!
    const result = a - b
    this.stack.push(result)
    return result
  }

  mul(): number | undefined {
    if (this.stack.length < 2) return undefined
    const b = this.stack.pop()!
    const a = this.stack.pop()!
    const result = a * b
    this.stack.push(result)
    return result
  }

  div(): number | undefined {
    if (this.stack.length < 2) return undefined
    const b = this.stack.pop()!
    const a = this.stack.pop()!
    if (b === 0) { this.stack.push(0); return 0 }
    const result = a / b
    this.stack.push(result)
    return result
  }

  dup(): void {
    if (this.stack.length > 0) this.stack.push(this.stack[this.stack.length - 1]!)
  }

  swap(): void {
    const len = this.stack.length
    if (len < 2) return
    const temp = this.stack[len - 1]!
    this.stack[len - 1] = this.stack[len - 2]!
    this.stack[len - 2] = temp
  }

  get size(): number { return this.stack.length }
  get isEmpty(): boolean { return this.stack.length === 0 }

  clear(): void { this.stack = [] }

  toArray(): number[] { return [...this.stack] }
  toString(): string { return JSON.stringify(this.stack) }
  toJSON(): number[] { return this.toArray() }

  clone(): StackMachine {
    const copy = new StackMachine()
    copy.stack = [...this.stack]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof StackMachine)) return false
    if (this.size !== other.size) return false
    for (let i = 0; i < this.stack.length; i++) {
      if (this.stack[i] !== other.stack[i]) return false
    }
    return true
  }
}
