export class ZigguratNormal {
  private readonly tables: { blocks: Float64Array; ratios: Float64Array }
  private static readonly BLOCKS = 128
  private static readonly R = 3.442619855899

  constructor(private readonly rng: () => number = Math.random) {
    this.tables = ZigguratNormal.buildTables()
  }

  sample(): number {
    while (true) {
      const u = this.rng()
      const i = (u * ZigguratNormal.BLOCKS) | 0
      const sign = this.rng() < 0.5 ? 1 : -1

      const x = u * this.tables.blocks[i]!
      if (i === 0) {
        return sign * this.sampleTail()
      }

      if (this.rng() < this.tables.ratios[i]!) {
        return sign * x
      }

      if (this.normalPdf(x) < this.normalPdf(this.tables.blocks[i]!) + (x - this.tables.blocks[i]!) * this.normalPdfDerivative(this.tables.blocks[i]!)) {
        return sign * x
      }
    }
  }

  sampleN(count: number): Float64Array {
    const result = new Float64Array(count)
    for (let i = 0; i < count; i++) {
      result[i] = this.sample()
    }
    return result
  }

  sampleMean(count: number): number {
    let sum = 0
    for (let i = 0; i < count; i++) {
      sum += this.sample()
    }
    return sum / count
  }

  private sampleTail(): number {
    while (true) {
      const x = -Math.log(this.rng()) / ZigguratNormal.R
      const y = -Math.log(this.rng())
      if (2 * y > x * x) {
        return ZigguratNormal.R + x
      }
    }
  }

  private static buildTables(): { blocks: Float64Array; ratios: Float64Array } {
    const v = 0.00492867323399
    const blocks = new Float64Array(ZigguratNormal.BLOCKS + 1)
    const ratios = new Float64Array(ZigguratNormal.BLOCKS)

    blocks[0] = ZigguratNormal.R
    for (let i = 1; i < ZigguratNormal.BLOCKS; i++) {
      blocks[i] = Math.sqrt(-2 * Math.log(v / blocks[i - 1]! + ZigguratNormal.normalPdfStatic(blocks[i - 1]!)))
    }
    blocks[ZigguratNormal.BLOCKS] = 0

    for (let i = 0; i < ZigguratNormal.BLOCKS; i++) {
      ratios[i] = blocks[i + 1]! / blocks[i]!
    }

    return { blocks, ratios }
  }

  private static normalPdfStatic(x: number): number {
    return Math.exp(-0.5 * x * x)
  }

  private normalPdf(x: number): number {
    return Math.exp(-0.5 * x * x)
  }

  private normalPdfDerivative(x: number): number {
    return -x * Math.exp(-0.5 * x * x)
  }
}
