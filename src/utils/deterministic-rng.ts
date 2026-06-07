export class DeterministicRng {
  private state: number

  constructor(seed = 12345) {
    this.state = seed
  }

  next(): number {
    this.state ^= this.state << 13
    this.state ^= this.state >> 17
    this.state ^= this.state << 5
    return (this.state >>> 0) / 4294967296
  }

  nextFloat(): number {
    return this.next()
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextBool(p = 0.5): boolean {
    return this.next() < p
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      const tmp = result[i]!
      result[i] = result[j]!
      result[j] = tmp
    }
    return result
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]!
  }

  nextGaussian(): number {
    const u1 = this.next()
    const u2 = this.next()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  get currentSeed(): number {
    return this.state >>> 0
  }

  reset(seed: number): void {
    this.state = seed
  }

  toString(): string {
    return `DeterministicRng(state=${this.currentSeed})`
  }

  toJSON(): number {
    return this.state
  }

  clone(): DeterministicRng {
    return new DeterministicRng(this.state)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DeterministicRng)) return false
    return this.state === other.state
  }
}
