export class VectorOps2 {
  static add(a: number[], b: number[]): number[] {
    return a.map((v, i) => v + b[i])
  }

  static subtract(a: number[], b: number[]): number[] {
    return a.map((v, i) => v - b[i])
  }

  static scale(v: number[], s: number): number[] {
    return v.map(x => x * s)
  }

  static dot(a: number[], b: number[]): number {
    return a.reduce((sum, v, i) => sum + v * b[i], 0)
  }

  static cross(a: number[], b: number[]): number[] {
    if (a.length !== 3 || b.length !== 3) throw new Error('Cross product requires 3D vectors')
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ]
  }

  static magnitude(v: number[]): number {
    return Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  }

  static normalize(v: number[]): number[] {
    const mag = VectorOps2.magnitude(v)
    if (mag === 0) return v.map(() => 0)
    return v.map(x => x / mag)
  }

  static distance(a: number[], b: number[]): number {
    return VectorOps2.magnitude(VectorOps2.subtract(a, b))
  }

  static angle(a: number[], b: number[]): number {
    const dot = VectorOps2.dot(a, b)
    const mags = VectorOps2.magnitude(a) * VectorOps2.magnitude(b)
    if (mags === 0) return 0
    return Math.acos(Math.max(-1, Math.min(1, dot / mags)))
  }

  static lerp(a: number[], b: number[], t: number): number[] {
    return a.map((v, i) => v + (b[i] - v) * t)
  }

  static zero(n: number): number[] {
    return new Array(n).fill(0)
  }

  static ones(n: number): number[] {
    return new Array(n).fill(1)
  }

  static hadamard(a: number[], b: number[]): number[] {
    return a.map((v, i) => v * b[i])
  }

  static sum(v: number[]): number {
    return v.reduce((s, x) => s + x, 0)
  }

  static mean(v: number[]): number {
    return v.length === 0 ? 0 : VectorOps2.sum(v) / v.length
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): VectorOps2 { return new VectorOps2() }
  equals(other: unknown): boolean { return other instanceof VectorOps2 }
}
