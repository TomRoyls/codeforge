export class SparseTable2D {
  private table: number[][][]
  private n: number
  private m: number
  private op: (a: number, b: number) => number

  constructor(data: number[][], op: (a: number, b: number) => number) {
    this.n = data.length
    this.m = this.n > 0 ? data[0]!.length : 0
    this.op = op
    const logN = this.n > 0 ? Math.floor(Math.log2(this.n)) + 1 : 1
    const logM = this.m > 0 ? Math.floor(Math.log2(this.m)) + 1 : 1
    this.table = Array.from({ length: logN }, () =>
      Array.from({ length: logM }, () => new Array(this.n * this.m).fill(0))
    )
    this.build(data)
  }

  query(r1: number, c1: number, r2: number, c2: number): number {
    const kr = r2 - r1 > 0 ? 31 - Math.clz32(r2 - r1 + 1) : 0
    const kc = c2 - c1 > 0 ? 31 - Math.clz32(c2 - c1 + 1) : 0
    const dr = r2 - (1 << kr) + 1
    const dc = c2 - (1 << kc) + 1
    const a = this.cell(kr, kc, r1, c1)
    const b = this.cell(kr, kc, r1, dc)
    const c = this.cell(kr, kc, dr, c1)
    const d = this.cell(kr, kc, dr, dc)
    return this.op(this.op(a, b), this.op(c, d))
  }

  private cell(kr: number, kc: number, r: number, c: number): number {
    return this.table[kr]![kc]![r * this.m + c]!
  }

  private build(data: number[][]): void {
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.m; j++) {
        this.table[0]![0]![i * this.m + j] = data[i]![j]!
      }
    }
    for (let j = 1; (1 << j) <= this.m; j++) {
      for (let i = 0; i < this.n; i++) {
        for (let c = 0; c + (1 << j) <= this.m; c++) {
          this.table[0]![j]![i * this.m + c] = this.op(
            this.cell(0, j - 1, i, c),
            this.cell(0, j - 1, i, c + (1 << (j - 1)))
          )
        }
      }
    }
    for (let i = 1; (1 << i) <= this.n; i++) {
      for (let j = 0; (1 << j) <= this.m || j === 0; j++) {
        if (j >= this.table[0]!.length) break
        for (let r = 0; r + (1 << i) <= this.n; r++) {
          for (let c = 0; c < this.m; c++) {
            this.table[i]![j]![r * this.m + c] = this.op(
              this.cell(i - 1, j, r, c),
              this.cell(i - 1, j, r + (1 << (i - 1)), c)
            )
          }
        }
      }
    }
  }
}
