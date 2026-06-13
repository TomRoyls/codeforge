export class AtomicCounter {
  private value: number

  constructor(initial = 0) {
    this.value = initial
  }

  increment(): number { return ++this.value }
  decrement(): number { return --this.value }
  add(delta: number): number { return this.value += delta }
  get(): number { return this.value }
  set(value: number): void { this.value = value }

  compareAndSwap(expected: number, updated: number): boolean {
    if (this.value === expected) { this.value = updated; return true }
    return false
  }

  getAndIncrement(): number { return this.value++ }
  incrementAndGet(): number { return ++this.value }

  get name(): string { return 'AtomicCounter' }

  reset(): void { this.value = 0 }

  toArray(): number[] { return [this.value] }
  toString(): string { return JSON.stringify({ value: this.value }) }
  toJSON(): Record<string, number> { return { value: this.value } }

  clone(): AtomicCounter { return new AtomicCounter(this.value) }

  equals(other: unknown): boolean {
    if (!(other instanceof AtomicCounter)) return false
    return this.value === other.value
  }
}
