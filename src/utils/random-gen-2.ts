export class RandomGen2 {
  private seed: number
  private state: number

  constructor(seed = Date.now()) {
    this.seed = seed
    this.state = seed >>> 0
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0
    return this.state / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextBool(): boolean {
    return this.next() < 0.5
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  sample<T>(arr: T[], count: number): T[] {
    return this.shuffle(arr).slice(0, count)
  }

  gauss(mean = 0, stddev = 1): number {
    const u1 = this.next() || 0.0001
    const u2 = this.next()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z * stddev + mean
  }

  reset(): void {
    this.state = this.seed >>> 0
  }

  toArray(): number[] { return [this.seed] }
  toString(): string { return JSON.stringify({ seed: this.seed }) }
  toJSON(): Record<string, number> { return { seed: this.seed } }
  clone(): RandomGen2 { return new RandomGen2(this.seed) }
  equals(other: unknown): boolean { return other instanceof RandomGen2 && (other as RandomGen2).seed === this.seed }
}
