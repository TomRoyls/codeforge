export class ArtGallery {
  private points: [number, number][] = []

  addPoint(x: number, y: number): void {
    this.points.push([x, y])
  }

  triangulation(): [number, number, number][] {
    const n = this.points.length
    if (n < 3) return []
    const triangles: [number, number, number][] = []
    const indices = Array.from({ length: n }, (_, i) => i)
    const used = new Array(n).fill(false)

    while (indices.filter(i => !used[i]).length > 3) {
      let earFound = false
      const active = indices.filter(i => !used[i])
      for (let i = 0; i < active.length; i++) {
        const prev = active[(i - 1 + active.length) % active.length]!
        const curr = active[i]!
        const next = active[(i + 1) % active.length]!

        if (this.cross(prev, curr, next) > 0) {
          let isEar = true
          for (const j of active) {
            if (j !== prev && j !== curr && j !== next) {
              if (this.pointInTriangle(j, prev, curr, next)) {
                isEar = false
                break
              }
            }
          }
          if (isEar) {
            triangles.push([prev, curr, next])
            used[curr] = true
            earFound = true
            break
          }
        }
      }
      if (!earFound) break
    }
    const remaining = indices.filter(i => !used[i])
    if (remaining.length === 3) {
      triangles.push([remaining[0]!, remaining[1]!, remaining[2]!])
    }
    return triangles
  }

  polygonArea(): number {
    let area = 0
    const n = this.points.length
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += this.points[i]![0] * this.points[j]![1]
      area -= this.points[j]![0] * this.points[i]![1]
    }
    return Math.abs(area) / 2
  }

  isConvex(): boolean {
    const n = this.points.length
    if (n < 3) return false
    let sign = 0
    for (let i = 0; i < n; i++) {
      const c = this.cross(i, (i + 1) % n, (i + 2) % n)
      if (c !== 0) {
        if (sign === 0) sign = c > 0 ? 1 : -1
        else if ((c > 0 ? 1 : -1) !== sign) return false
      }
    }
    return true
  }

  pointInPolygon(px: number, py: number): boolean {
    const n = this.points.length
    let inside = false
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi] = this.points[i]!
      const [xj, yj] = this.points[j]!
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
        inside = !inside
      }
    }
    return inside
  }

  private cross(a: number, b: number, c: number): number {
    const [ax, ay] = this.points[a]!
    const [bx, by] = this.points[b]!
    const [cx, cy] = this.points[c]!
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
  }

  private pointInTriangle(p: number, a: number, b: number, c: number): boolean {
    const d1 = this.sign2(p, a, b)
    const d2 = this.sign2(p, b, c)
    const d3 = this.sign2(p, c, a)
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0
    return !(hasNeg && hasPos)
  }

  private sign2(p: number, a: number, b: number): number {
    const [px, py] = this.points[p]!
    const [ax, ay] = this.points[a]!
    const [bx, by] = this.points[b]!
    return (px - bx) * (ay - by) - (ax - bx) * (py - by)
  }
}
