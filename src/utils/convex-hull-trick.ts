export class ConvexHullTrick {
  private readonly lines: { a: number; b: number }[] = []
  private readonly isMin: boolean

  constructor(isMin: boolean = true) {
    this.isMin = isMin
  }

  addLine(a: number, b: number): void {
    let line = { a, b }
    while (this.lines.length >= 2 && this.bad(this.lines[this.lines.length - 2]!, this.lines[this.lines.length - 1]!, line)) {
      this.lines.pop()
    }
    this.lines.push(line)
  }

  query(x: number): number {
    if (this.lines.length === 0) return this.isMin ? Infinity : -Infinity
    let lo = 0
    let hi = this.lines.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      const fMid = this.lines[mid]!.a * x + this.lines[mid]!.b
      const fNext = this.lines[mid + 1]!.a * x + this.lines[mid + 1]!.b
      if (this.isMin ? fMid >= fNext : fMid <= fNext) lo = mid + 1
      else hi = mid
    }
    return this.lines[lo]!.a * x + this.lines[lo]!.b
  }

  private bad(l1: { a: number; b: number }, l2: { a: number; b: number }, l3: { a: number; b: number }): boolean {
    const cross1 = (l2.b - l1.b) * (l1.a - l3.a)
    const cross2 = (l3.b - l1.b) * (l1.a - l2.a)
    return this.isMin ? cross1 >= cross2 : cross1 <= cross2
  }

  get lineCount(): number {
    return this.lines.length
  }
}
