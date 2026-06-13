export class Matrix2x2 {
  a: number; b: number; c: number; d: number

  constructor(a = 1, b = 0, c = 0, d = 1) {
    this.a = a; this.b = b; this.c = c; this.d = d
  }

  mul(other: Matrix2x2): Matrix2x2 {
    return new Matrix2x2(
      this.a * other.a + this.b * other.c,
      this.a * other.b + this.b * other.d,
      this.c * other.a + this.d * other.c,
      this.c * other.b + this.d * other.d
    )
  }

  add(other: Matrix2x2): Matrix2x2 {
    return new Matrix2x2(this.a + other.a, this.b + other.b, this.c + other.c, this.d + other.d)
  }

  scale(s: number): Matrix2x2 {
    return new Matrix2x2(this.a * s, this.b * s, this.c * s, this.d * s)
  }

  det(): number { return this.a * this.d - this.b * this.c }

  trace(): number { return this.a + this.d }

  transpose(): Matrix2x2 {
    return new Matrix2x2(this.a, this.c, this.b, this.d)
  }

  static identity(): Matrix2x2 { return new Matrix2x2(1, 0, 0, 1) }
  static zero(): Matrix2x2 { return new Matrix2x2(0, 0, 0, 0) }

  get isEmpty(): boolean { return this.a === 0 && this.b === 0 && this.c === 0 && this.d === 0 }

  clear(): void { this.a = 0; this.b = 0; this.c = 0; this.d = 0 }

  toArray(): number[] { return [this.a, this.b, this.c, this.d] }
  toString(): string { return JSON.stringify(this.toArray()) }
  toJSON(): number[] { return this.toArray() }

  clone(): Matrix2x2 { return new Matrix2x2(this.a, this.b, this.c, this.d) }

  equals(other: unknown): boolean {
    if (!(other instanceof Matrix2x2)) return false
    return this.a === other.a && this.b === other.b && this.c === other.c && this.d === other.d
  }
}
