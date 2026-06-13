export class Vector2 {
  private data: number[]

  constructor(data: number[]) {
    this.data = [...data]
  }

  static zeros(n: number): Vector2 { return new Vector2(new Array(n).fill(0)) }
  static ones(n: number): Vector2 { return new Vector2(new Array(n).fill(1)) }
  static from(arr: number[]): Vector2 { return new Vector2(arr) }

  get(i: number): number { return this.data[i] }
  set(i: number, v: number): void { this.data[i] = v }

  add(other: Vector2): Vector2 {
    return new Vector2(this.data.map((v, i) => v + other.data[i]))
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.data.map((v, i) => v - other.data[i]))
  }

  dot(other: Vector2): number {
    return this.data.reduce((sum, v, i) => sum + v * other.data[i], 0)
  }

  scale(s: number): Vector2 {
    return new Vector2(this.data.map(v => v * s))
  }

  norm(): number {
    return Math.sqrt(this.data.reduce((sum, v) => sum + v * v, 0))
  }

  normalize(): Vector2 {
    const n = this.norm()
    return n === 0 ? Vector2.zeros(this.data.length) : this.scale(1 / n)
  }

  get size(): number { return this.data.length }
  get isEmpty(): boolean { return this.data.length === 0 }

  clear(): void { this.data.fill(0) }

  toArray(): number[] { return [...this.data] }
  toString(): string { return JSON.stringify({ size: this.data.length }) }
  toJSON(): Record<string, number> { return { size: this.data.length } }

  clone(): Vector2 { return new Vector2([...this.data]) }

  equals(other: unknown): boolean {
    if (!(other instanceof Vector2)) return false
    return this.size === other.size
  }
}
