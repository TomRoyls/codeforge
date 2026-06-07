export class LeakyBucket {
  private water: number = 0
  private lastLeak: number

  constructor(
    private capacity: number,
    private leakRate: number,
  ) {
    this.lastLeak = Date.now()
  }

  pour(amount: number = 1): boolean {
    this.leak()
    if (this.water + amount <= this.capacity) {
      this.water += amount
      return true
    }
    return false
  }

  private leak(): void {
    const now = Date.now()
    const elapsed = (now - this.lastLeak) / 1000
    const leaked = elapsed * this.leakRate
    this.water = Math.max(0, this.water - leaked)
    this.lastLeak = now
  }

  get level(): number {
    this.leak()
    return this.water
  }

  get available(): number {
    return this.capacity - this.level
  }

  get isFull(): boolean {
    return this.level >= this.capacity
  }

  reset(): void {
    this.water = 0
    this.lastLeak = Date.now()
  }

  toString(): string {
    return `LeakyBucket(${this.water}/${this.capacity}, rate=${this.leakRate})`
  }

  toJSON(): unknown {
    return { capacity: this.capacity, leakRate: this.leakRate, water: this.water, lastLeak: this.lastLeak }
  }

  clone(): LeakyBucket {
    const copy = new LeakyBucket(this.capacity, this.leakRate)
    copy.water = this.water
    copy.lastLeak = this.lastLeak
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LeakyBucket)) return false
    return this.capacity === other.capacity && this.leakRate === other.leakRate
  }
}
