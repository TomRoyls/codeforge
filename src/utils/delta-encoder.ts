export class DeltaEncoder {
  private deltas: number[] = []
  private firstValue: number | null = null

  encode(values: number[]): void {
    for (const v of values) this.push(v)
  }

  push(value: number): void {
    if (this.firstValue === null) {
      this.firstValue = value
      this.deltas.push(0)
    } else {
      this.deltas.push(value - this.lastValue)
    }
  }

  decode(): number[] {
    if (this.firstValue === null) return []
    const result: number[] = [this.firstValue]
    for (let i = 1; i < this.deltas.length; i++) {
      result.push(result[i - 1]! + this.deltas[i]!)
    }
    return result
  }

  get lastValue(): number {
    if (this.firstValue === null) return 0
    let v = this.firstValue
    for (let i = 1; i < this.deltas.length; i++) v += this.deltas[i]!
    return v
  }

  get size(): number { return this.deltas.length }
  get isEmpty(): boolean { return this.deltas.length === 0 }

  clear(): void { this.deltas = []; this.firstValue = null }

  toArray(): number[] { return [...this.deltas] }
  toString(): string { return JSON.stringify({ deltas: this.deltas, first: this.firstValue }) }
  toJSON(): Record<string, unknown> { return { deltas: this.deltas, first: this.firstValue } }

  clone(): DeltaEncoder {
    const c = new DeltaEncoder()
    c.deltas = [...this.deltas]
    c.firstValue = this.firstValue
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DeltaEncoder)) return false
    return this.firstValue === other.firstValue &&
      this.deltas.length === other.deltas.length &&
      this.deltas.every((d, i) => d === other.deltas[i])
  }
}
