export class Rect {
  x: number
  y: number
  w: number
  h: number

  constructor(x = 0, y = 0, w = 0, h = 0) {
    this.x = x; this.y = y; this.w = w; this.h = h
  }

  get right(): number { return this.x + this.w }
  get bottom(): number { return this.y + this.h }
  get area(): number { return Math.abs(this.w * this.h) }
  get perimeter(): number { return 2 * (Math.abs(this.w) + Math.abs(this.h)) }
  get isEmpty(): boolean { return this.w === 0 || this.h === 0 }

  contains(px: number, py: number): boolean {
    return px >= this.x && px <= this.right && py >= this.y && py <= this.bottom
  }

  intersects(other: Rect): boolean {
    return !(other.x > this.right || other.right < this.x || other.y > this.bottom || other.bottom < this.y)
  }

  intersection(other: Rect): Rect {
    const x = Math.max(this.x, other.x)
    const y = Math.max(this.y, other.y)
    const r = Math.min(this.right, other.right)
    const b = Math.min(this.bottom, other.bottom)
    return new Rect(x, y, Math.max(0, r - x), Math.max(0, b - y))
  }

  union(other: Rect): Rect {
    const x = Math.min(this.x, other.x)
    const y = Math.min(this.y, other.y)
    const r = Math.max(this.right, other.right)
    const b = Math.max(this.bottom, other.bottom)
    return new Rect(x, y, r - x, b - y)
  }

  translate(dx: number, dy: number): Rect {
    return new Rect(this.x + dx, this.y + dy, this.w, this.h)
  }

  scale(s: number): Rect {
    return new Rect(this.x * s, this.y * s, this.w * s, this.h * s)
  }

  clear(): void { this.x = 0; this.y = 0; this.w = 0; this.h = 0 }

  toArray(): number[] { return [this.x, this.y, this.w, this.h] }
  toString(): string { return JSON.stringify(this.toArray()) }
  toJSON(): number[] { return this.toArray() }

  clone(): Rect { return new Rect(this.x, this.y, this.w, this.h) }

  equals(other: unknown): boolean {
    if (!(other instanceof Rect)) return false
    return this.x === other.x && this.y === other.y && this.w === other.w && this.h === other.h
  }
}
