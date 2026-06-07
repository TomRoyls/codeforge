export class ExponentialCounter {
  private count: number = 0

  constructor(private threshold: number = 1024) {}

  increment(): void {
    this.count++
  }

  get value(): number {
    return this.count
  }

  get approximate(): number {
    if (this.count < this.threshold) return this.count
    const exp = Math.floor(Math.log2(this.count))
    return Math.pow(2, exp)
  }

  get isCompressed(): boolean {
    return this.count >= this.threshold
  }

  add(n: number): void {
    this.count += n
  }

  reset(): void {
    this.count = 0
  }

  merge(other: ExponentialCounter): void {
    this.count += other.count
  }

  toString(): string {
    return `ExponentialCounter(${this.count})`
  }

  toJSON(): { count: number; threshold: number } {
    return { count: this.count, threshold: this.threshold }
  }

  clone(): ExponentialCounter {
    const copy = new ExponentialCounter(this.threshold)
    copy.count = this.count
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ExponentialCounter)) return false
    return this.count === other.count && this.threshold === other.threshold
  }
}
