export class BoundingBox2 {
  minX: number
  minY: number
  maxX: number
  maxY: number

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX; this.minY = minY; this.maxX = maxX; this.maxY = maxY
  }

  get width(): number { return this.maxX - this.minX }
  get height(): number { return this.maxY - this.minY }
  get area(): number { return this.width * this.height }
  get perimeter(): number { return 2 * (this.width + this.height) }
  get centerX(): number { return (this.minX + this.maxX) / 2 }
  get centerY(): number { return (this.minY + this.maxY) / 2 }

  contains(x: number, y: number): boolean {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
  }

  intersects(other: BoundingBox2): boolean {
    return this.minX < other.maxX && this.maxX > other.minX &&
           this.minY < other.maxY && this.maxY > other.minY
  }

  union(other: BoundingBox2): BoundingBox2 {
    return new BoundingBox2(
      Math.min(this.minX, other.minX),
      Math.min(this.minY, other.minY),
      Math.max(this.maxX, other.maxX),
      Math.max(this.maxY, other.maxY)
    )
  }

  expand(padding: number): BoundingBox2 {
    return new BoundingBox2(
      this.minX - padding, this.minY - padding,
      this.maxX + padding, this.maxY + padding
    )
  }

  static fromPoints(xs: number[], ys: number[]): BoundingBox2 {
    return new BoundingBox2(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys))
  }

  static empty(): BoundingBox2 { return new BoundingBox2(0, 0, 0, 0) }

  toArray(): number[] { return [this.minX, this.minY, this.maxX, this.maxY] }
  toString(): string { return JSON.stringify({ width: this.width, height: this.height }) }
  toJSON(): Record<string, number> { return { width: this.width, height: this.height, area: this.area } }
  clone(): BoundingBox2 { return new BoundingBox2(this.minX, this.minY, this.maxX, this.maxY) }
  equals(other: unknown): boolean {
    if (!(other instanceof BoundingBox2)) return false
    return this.minX === other.minX && this.minY === other.minY &&
           this.maxX === other.maxX && this.maxY === other.maxY
  }
}
