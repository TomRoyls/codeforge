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
}
