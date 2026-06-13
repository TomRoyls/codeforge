export class PointSet {
  private points = new Map<string, { x: number; y: number; data?: unknown }>()

  private static key(x: number, y: number): string { return `${x},${y}` }

  add(x: number, y: number, data?: unknown): void {
    this.points.set(PointSet.key(x, y), { x, y, data })
  }

  has(x: number, y: number): boolean { return this.points.has(PointSet.key(x, y)) }

  get(x: number, y: number): unknown | undefined { return this.points.get(PointSet.key(x, y))?.data }

  remove(x: number, y: number): boolean { return this.points.delete(PointSet.key(x, y)) }

  nearestTo(x: number, y: number): { x: number; y: number; dist: number } | undefined {
    let best: { x: number; y: number; dist: number } | undefined
    for (const p of this.points.values()) {
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2)
      if (!best || dist < best.dist) best = { x: p.x, y: p.y, dist }
    }
    return best
  }

  inRadius(cx: number, cy: number, r: number): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = []
    for (const p of this.points.values()) {
      if (Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) <= r) result.push({ x: p.x, y: p.y })
    }
    return result
  }

  boundingBox(): { minX: number; minY: number; maxX: number; maxY: number } | undefined {
    if (this.points.size === 0) return undefined
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of this.points.values()) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    return { minX, minY, maxX, maxY }
  }

  get size(): number { return this.points.size }
  get isEmpty(): boolean { return this.points.size === 0 }

  clear(): void { this.points.clear() }

  toArray(): Array<{ x: number; y: number }> {
    return Array.from(this.points.values()).map(({ x, y }) => ({ x, y }))
  }

  toString(): string { return JSON.stringify({ points: this.size }) }
  toJSON(): Record<string, number> { return { points: this.size } }

  clone(): PointSet {
    const c = new PointSet()
    for (const [k, v] of this.points) c.points.set(k, { ...v })
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PointSet)) return false
    return this.size === other.size
  }
}
