export class DynamicConvexHull {
  private points: { x: number; y: number }[] = []

  add(x: number, y: number): void {
    this.points.push({ x, y })
    this.rebuild()
  }

  private rebuild(): void {
    if (this.points.length < 2) return
    this.points.sort((a, b) => a.x - b.x || a.y - b.y)
    const lower: { x: number; y: number }[] = []
    for (const p of this.points) {
      while (lower.length >= 2 && DynamicConvexHull.cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
        lower.pop()
      }
      lower.push(p)
    }
    const upper: { x: number; y: number }[] = []
    for (let i = this.points.length - 1; i >= 0; i--) {
      const p = this.points[i]!
      while (upper.length >= 2 && DynamicConvexHull.cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
        upper.pop()
      }
      upper.push(p)
    }
    lower.pop()
    upper.pop()
    this.hull = lower.concat(upper)
  }

  private hull: { x: number; y: number }[] = []

  private static cross(o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  getHull(): { x: number; y: number }[] {
    return [...this.hull]
  }

  get area(): number {
    const h = this.hull
    let a = 0
    for (let i = 0; i < h.length; i++) {
      const j = (i + 1) % h.length
      a += h[i]!.x * h[j]!.y
      a -= h[j]!.x * h[i]!.y
    }
    return Math.abs(a) / 2
  }

  get perimeter(): number {
    const h = this.hull
    let p = 0
    for (let i = 0; i < h.length; i++) {
      const j = (i + 1) % h.length
      const dx = h[j]!.x - h[i]!.x
      const dy = h[j]!.y - h[i]!.y
      p += Math.sqrt(dx * dx + dy * dy)
    }
    return p
  }

  toString(): string {
    return `DynamicConvexHull(${this.points.length} points)`
  }

  toJSON(): { points: { x: number; y: number }[]; hull: { x: number; y: number }[] } {
    return { points: [...this.points], hull: [...this.hull] }
  }

  clone(): DynamicConvexHull {
    const copy = new DynamicConvexHull()
    copy.points = this.points.map(p => ({ ...p }))
    copy.hull = this.hull.map(p => ({ ...p }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DynamicConvexHull)) return false
    if (this.points.length !== other.points.length) return false
    return true
  }
}
