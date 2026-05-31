export class SqrtDecompRange {
  private arr: number[]
  private blocks: number[] = []
  private blockSize: number
  private blockCount: number

  constructor(arr: number[]) {
    this.arr = [...arr]
    this.blockSize = Math.max(1, Math.floor(Math.sqrt(arr.length)))
    this.blockCount = Math.ceil(arr.length / this.blockSize)
    for (let i = 0; i < this.blockCount; i++) {
      this.blocks.push(0)
    }
    this.rebuild()
  }

  private rebuild(): void {
    for (let b = 0; b < this.blockCount; b++) {
      this.blocks[b] = 0
      const start = b * this.blockSize
      const end = Math.min(start + this.blockSize, this.arr.length)
      for (let i = start; i < end; i++) {
        this.blocks[b]! += this.arr[i]!
      }
    }
  }

  update(index: number, value: number): void {
    const b = Math.floor(index / this.blockSize)
    this.blocks[b]! += value - this.arr[index]!
    this.arr[index] = value
  }

  rangeSum(l: number, r: number): number {
    let sum = 0
    const bl = Math.floor(l / this.blockSize)
    const br = Math.floor(r / this.blockSize)
    if (bl === br) {
      for (let i = l; i <= r; i++) sum += this.arr[i]!
      return sum
    }
    for (let i = l; i < (bl + 1) * this.blockSize; i++) {
      sum += this.arr[i]!
    }
    for (let b = bl + 1; b < br; b++) {
      sum += this.blocks[b]!
    }
    for (let i = br * this.blockSize; i <= r; i++) {
      sum += this.arr[i]!
    }
    return sum
  }

  rangeMin(l: number, r: number): number {
    let min = Infinity
    for (let i = l; i <= r; i++) {
      min = Math.min(min, this.arr[i]!)
    }
    return min
  }

  rangeMax(l: number, r: number): number {
    let max = -Infinity
    for (let i = l; i <= r; i++) {
      max = Math.max(max, this.arr[i]!)
    }
    return max
  }

  get length(): number {
    return this.arr.length
  }
}
