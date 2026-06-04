export class ConvexHull3D {
  private points: [number, number, number][] = []

  addPoint(x: number, y: number, z: number): void {
    this.points.push([x, y, z])
  }

  convexHullVolume(): number {
    if (this.points.length < 4) return 0
    let volume = 0
    const o = this.points[0]!
    const n = this.points.length
    for (let i = 1; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          const c = this.cross(
            this.vec(o, this.points[i]!),
            this.vec(o, this.points[k]!)
          )
          const h = this.dot(c, this.vec(o, this.points[j]!))
          volume += h
        }
      }
    }
    return Math.abs(volume) / 6
  }

  boundingBox(): { min: [number, number, number], max: [number, number, number] } {
    const min: [number, number, number] = [Infinity, Infinity, Infinity]
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
    for (const [x, y, z] of this.points) {
      min[0] = Math.min(min[0], x)
      min[1] = Math.min(min[1], y)
      min[2] = Math.min(min[2], z)
      max[0] = Math.max(max[0], x)
      max[1] = Math.max(max[1], y)
      max[2] = Math.max(max[2], z)
    }
    return { min, max }
  }

  centroid(): [number, number, number] {
    if (this.points.length === 0) return [0, 0, 0]
    let sx = 0, sy = 0, sz = 0
    for (const [x, y, z] of this.points) {
      sx += x
      sy += y
      sz += z
    }
    const n = this.points.length
    return [sx / n, sy / n, sz / n]
  }

  get size(): number {
    return this.points.length
  }

  private vec(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  }

  private cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ]
  }

  private dot(a: [number, number, number], b: [number, number, number]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  }

}
