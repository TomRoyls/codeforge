export class RunLengthDecoder<T> {
  private pairs: Array<{ value: T; count: number }> = []
  private pos = 0
  private offset = 0

  constructor(encoded: Array<{ value: T; count: number }>) {
    this.pairs = encoded.map((p) => ({ value: p.value, count: p.count }))
  }

  static fromString(encoded: string): RunLengthDecoder<string> {
    const pairs: Array<{ value: string; count: number }> = []
    for (let i = 0; i < encoded.length; i += 2) {
      const value = encoded[i]!
      const count = parseInt(encoded[i + 1]!, 10)
      if (!isNaN(count) && count > 0) {
        pairs.push({ value, count })
      }
    }
    return new RunLengthDecoder(pairs)
  }

  next(): T | undefined {
    if (this.pos >= this.pairs.length) return undefined
    const pair = this.pairs[this.pos]!
    const value = pair.value
    this.offset++
    if (this.offset >= pair.count) {
      this.pos++
      this.offset = 0
    }
    return value
  }

  decode(): T[] {
    const result: T[] = []
    for (const pair of this.pairs) {
      for (let i = 0; i < pair.count; i++) {
        result.push(pair.value)
      }
    }
    return result
  }

  get totalLength(): number {
    return this.pairs.reduce((sum, p) => sum + p.count, 0)
  }

  get pairCount(): number {
    return this.pairs.length
  }

  reset(): void {
    this.pos = 0
    this.offset = 0
  }

  toArray(): Array<{ value: T; count: number }> {
    return this.pairs.map((p) => ({ value: p.value, count: p.count }))
  }

  toString(): string {
    return JSON.stringify(this.pairs)
  }

  toJSON(): Array<{ value: T; count: number }> {
    return this.toArray()
  }

  clone(): RunLengthDecoder<T> {
    return new RunLengthDecoder(this.toArray())
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RunLengthDecoder)) return false
    const a = this.decode()
    const b = other.decode()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}
