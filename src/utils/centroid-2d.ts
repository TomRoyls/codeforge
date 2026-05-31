export class Centroid2D {
  static compute(points: { x: number; y: number }[]): { x: number; y: number } {
    if (points.length === 0) return { x: 0, y: 0 }
    let sx = 0
    let sy = 0
    for (const p of points) {
      sx += p.x
      sy += p.y
    }
    return { x: sx / points.length, y: sy / points.length }
  }

  static weightedCentroid(
    points: { x: number; y: number; weight: number }[],
  ): { x: number; y: number } {
    if (points.length === 0) return { x: 0, y: 0 }
    let sx = 0
    let sy = 0
    let sw = 0
    for (const p of points) {
      sx += p.x * p.weight
      sy += p.y * p.weight
      sw += p.weight
    }
    return sw === 0 ? { x: 0, y: 0 } : { x: sx / sw, y: sy / sw }
  }

  static polygonCentroid(vertices: { x: number; y: number }[]): { x: number; y: number } {
    if (vertices.length === 0) return { x: 0, y: 0 }
    let area = 0
    let cx = 0
    let cy = 0
    const n = vertices.length
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const cross = vertices[i]!.x * vertices[j]!.y - vertices[j]!.x * vertices[i]!.y
      area += cross
      cx += (vertices[i]!.x + vertices[j]!.x) * cross
      cy += (vertices[i]!.y + vertices[j]!.y) * cross
    }
    area /= 2
    if (Math.abs(area) < 1e-10) return Centroid2D.compute(vertices)
    cx /= 6 * area
    cy /= 6 * area
    return { x: cx, y: cy }
  }
}
