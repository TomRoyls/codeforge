export class FibonacciIterator implements Iterator<bigint>, Iterable<bigint> {
  private prev: bigint = 0n
  private curr: bigint = 1n
  private count = 0
  private readonly maxCount: number | undefined

  constructor(options?: { count?: number }) {
    this.maxCount = options?.count
  }

  next(): IteratorResult<bigint> {
    if (this.maxCount !== undefined && this.count >= this.maxCount) {
      return { done: true, value: undefined }
    }
    if (this.count === 0) {
      this.count++
      return { done: false, value: 0n }
    }
    if (this.count === 1) {
      this.count++
      return { done: false, value: 1n }
    }
    const next = this.prev + this.curr
    this.prev = this.curr
    this.curr = next
    this.count++
    return { done: false, value: next }
  }

  [Symbol.iterator](): Iterator<bigint> {
    return this
  }

  static nth(n: number): bigint {
    if (n <= 0) return 0n
    if (n === 1) return 1n
    let a = 0n
    let b = 1n
    for (let i = 2; i <= n; i++) {
      const temp = a + b
      a = b
      b = temp
    }
    return b
  }

  static toArray(count: number): bigint[] {
    const result: bigint[] = []
    let a = 0n
    let b = 1n
    for (let i = 0; i < count; i++) {
      if (i === 0) {
        result.push(0n)
      } else if (i === 1) {
        result.push(1n)
      } else {
        const temp = a + b
        a = b
        b = temp
        result.push(b)
      }
    }
    return result
  }

  static isFibonacci(n: bigint): boolean {
    if (n < 0n) return false
    const test1 = 5n * n * n + 4n
    const test2 = 5n * n * n - 4n
    return FibonacciIterator.isPerfectSquare(test1) || FibonacciIterator.isPerfectSquare(test2)
  }

  private static isPerfectSquare(n: bigint): boolean {
    if (n < 0n) return false
    const sqrt = FibonacciIterator.bigIntSqrt(n)
    return sqrt * sqrt === n
  }

  private static bigIntSqrt(n: bigint): bigint {
    if (n < 2n) return n
    let x = n
    let y = (x + 1n) / 2n
    while (y < x) {
      x = y
      y = (x + n / x) / 2n
    }
    return x
  }

  toString(): string {
    return `FibonacciIterator(count=${this.count}, max=${this.maxCount ?? '∞'})`
  }

  toJSON(): { prev: string; curr: string; count: number; maxCount: number | null } {
    return {
      prev: this.prev.toString(),
      curr: this.curr.toString(),
      count: this.count,
      maxCount: this.maxCount ?? null,
    }
  }

  clone(): FibonacciIterator {
    const copy = new FibonacciIterator({ count: this.maxCount })
    copy.prev = this.prev
    copy.curr = this.curr
    copy.count = this.count
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FibonacciIterator)) return false
    return this.prev === other.prev && this.curr === other.curr && this.count === other.count
  }
}
