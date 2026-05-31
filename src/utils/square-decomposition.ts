export class SquareDecomposition {
  private blocks: number[][]
  private blockSize: number
  private data: number[]

  constructor(arr: number[], blockSize?: number) {
    this.data = [...arr]
    this.blockSize = blockSize ?? Math.max(1, Math.floor(Math.sqrt(arr.length)))
    this.blocks = []
    for (let i = 0; i < arr.length; i += this.blockSize) {
      this.blocks.push(arr.slice(i, i + this.blockSize))
    }
  }

  query(l: number, r: number): number {
    let sum = 0
    for (let i = l; i <= r; i++) {
      sum += this.data[i]!
    }
    return sum
  }

  update(index: number, value: number): void {
    const old = this.data[index]!
    const diff = value - old
    this.data[index] = value
    const blockIdx = Math.floor(index / this.blockSize)
    const withinIdx = index % this.blockSize
    if (blockIdx < this.blocks.length && withinIdx < this.blocks[blockIdx]!.length) {
      this.blocks[blockIdx]![withinIdx]! += diff
    }
  }

  get(index: number): number {
    return this.data[index]!
  }

  get length(): number {
    return this.data.length
  }

  toArray(): number[] {
    return [...this.data]
  }
}
