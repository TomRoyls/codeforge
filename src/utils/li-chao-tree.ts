interface Line {
  a: number
  b: number
}

export class LiChaoTree {
  private lines: (Line | null)[]
  private xLo: number
  private xHi: number
  private size_: number

  constructor(xLo: number, xHi: number) {
    if (xLo >= xHi) {
      throw new RangeError(`xLo must be < xHi, got xLo=${xLo}, xHi=${xHi}`)
    }
    this.xLo = xLo
    this.xHi = xHi
    this.size_ = 1
    while (this.size_ < xHi - xLo + 1) {
      this.size_ *= 2
    }
    this.lines = new Array<Line | null>(this.size_ * 2).fill(null)
  }

  private eval(line: Line, x: number): number {
    return line.a * x + line.b
  }

  private addLine(node: number, lo: number, hi: number, line: Line): void {
    const mid = Math.floor((lo + hi) / 2)
    const current = this.lines[node]

    if (current == null) {
      this.lines[node] = line
      return
    }

    const leftBetter = this.eval(line, lo) > this.eval(current, lo)
    const midBetter = this.eval(line, mid) > this.eval(current, mid)

    if (midBetter) {
      this.lines[node] = line
      line = current
    }

    if (hi - lo <= 1) return

    if (leftBetter !== midBetter) {
      this.addLine(node * 2, lo, mid, line)
    } else {
      this.addLine(node * 2 + 1, mid, hi, line)
    }
  }

  insert(a: number, b: number): void {
    this.addLine(1, this.xLo, this.xHi, { a, b })
  }

  query(x: number): number {
    if (x < this.xLo || x > this.xHi) {
      return NaN
    }

    let result = -Infinity
    let node = 1
    let lo = this.xLo
    let hi = this.xHi

    while (node < this.lines.length) {
      const line = this.lines[node]
      if (line != null) {
        const val = this.eval(line, x)
        if (val > result) result = val
      }

      const mid = Math.floor((lo + hi) / 2)
      if (hi - lo <= 1) break

      if (x < mid) {
        node = node * 2
        hi = mid
      } else {
        node = node * 2 + 1
        lo = mid
      }
    }

    return result
  }

  queryMin(x: number): number {
    const maxVal = this.query(x)
    if (Number.isNaN(maxVal)) return NaN
    return -maxVal
  }

  insertForMin(a: number, b: number): void {
    this.insert(-a, -b)
  }

  get xRange(): [number, number] {
    return [this.xLo, this.xHi]
  }

  isEmpty(): boolean {
    for (const line of this.lines) {
      if (line !== null) return false
    }
    return true
  }

  lineCount(): number {
    let count = 0
    for (const line of this.lines) {
      if (line !== null) count++
    }
    return count
  }

  clear(): void {
    this.lines.fill(null)
  }

  static fromLines(lines: Array<[number, number]>, xLo: number, xHi: number): LiChaoTree {
    const tree = new LiChaoTree(xLo, xHi)
    for (const [a, b] of lines) {
      tree.insert(a, b)
    }
    return tree
  }
}
