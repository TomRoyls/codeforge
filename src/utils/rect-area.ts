export class RectArea {
  static unionArea(rects: { x1: number; y1: number; x2: number; y2: number }[]): number {
    if (rects.length === 0) return 0
    const xs: number[] = []
    const ys: number[] = []
    for (const r of rects) {
      xs.push(r.x1, r.x2)
      ys.push(r.y1, r.y2)
    }
    const uniqueX = [...new Set(xs)].sort((a, b) => a - b)
    const uniqueY = [...new Set(ys)].sort((a, b) => a - b)
    let area = 0
    for (let i = 0; i < uniqueX.length - 1; i++) {
      for (let j = 0; j < uniqueY.length - 1; j++) {
        const cx = (uniqueX[i]! + uniqueX[i + 1]!) / 2
        const cy = (uniqueY[j]! + uniqueY[j + 1]!) / 2
        for (const r of rects) {
          if (cx >= r.x1 && cx <= r.x2 && cy >= r.y1 && cy <= r.y2) {
            area += (uniqueX[i + 1]! - uniqueX[i]!) * (uniqueY[j + 1]! - uniqueY[j]!)
            break
          }
        }
      }
    }
    return area
  }

  static intersection(r1: { x1: number; y1: number; x2: number; y2: number }, r2: { x1: number; y1: number; x2: number; y2: number }): { x1: number; y1: number; x2: number; y2: number } | null {
    const x1 = Math.max(r1.x1, r2.x1)
    const y1 = Math.max(r1.y1, r2.y1)
    const x2 = Math.min(r1.x2, r2.x2)
    const y2 = Math.min(r1.y2, r2.y2)
    if (x1 >= x2 || y1 >= y2) return null
    return { x1, y1, x2, y2 }
  }

  static area(r: { x1: number; y1: number; x2: number; y2: number }): number {
    return Math.max(0, r.x2 - r.x1) * Math.max(0, r.y2 - r.y1)
  }
}
