export class GeoPoint2 {
  x: number
  y: number

  constructor(x: number, y: number) { this.x = x; this.y = y }

  distanceTo(other: GeoPoint2): number {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2)
  }

  manhattanDistance(other: GeoPoint2): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
  }

  add(other: GeoPoint2): GeoPoint2 { return new GeoPoint2(this.x + other.x, this.y + other.y) }
  subtract(other: GeoPoint2): GeoPoint2 { return new GeoPoint2(this.x - other.x, this.y - other.y) }
  scale(s: number): GeoPoint2 { return new GeoPoint2(this.x * s, this.y * s) }

  dot(other: GeoPoint2): number { return this.x * other.x + this.y * other.y }
  cross(other: GeoPoint2): number { return this.x * other.y - this.y * other.x }

  magnitude(): number { return Math.sqrt(this.x ** 2 + this.y ** 2) }
  normalize(): GeoPoint2 {
    const m = this.magnitude()
    return m === 0 ? new GeoPoint2(0, 0) : this.scale(1 / m)
  }

  angle(): number { return Math.atan2(this.y, this.x) }

  static origin(): GeoPoint2 { return new GeoPoint2(0, 0) }

  toArray(): number[] { return [this.x, this.y] }
  toString(): string { return JSON.stringify({ x: this.x, y: this.y }) }
  toJSON(): Record<string, number> { return { x: this.x, y: this.y } }
  clone(): GeoPoint2 { return new GeoPoint2(this.x, this.y) }
  equals(other: unknown): boolean {
    if (!(other instanceof GeoPoint2)) return false
    return this.x === other.x && this.y === other.y
  }
}
