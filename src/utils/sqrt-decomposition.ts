export class SqrtDecomposition {
  private arr: number[]
  private blockSize: number
  private blocks: number[]
  private lazy: number[]
  readonly size: number

  constructor(arr: number[]) {
    this.arr = [...arr]
    this.size = this.arr.length
    this.blockSize = Math.floor(Math.sqrt(this.size)) || 1
    const blockCount = Math.ceil(this.size / this.blockSize)
    this.blocks = new Array(blockCount).fill(0)
    this.lazy = new Array(blockCount).fill(0)
    this._build()
  }

  private _build(): void {
    for (let i = 0; i < this.size; i++) {
      const blockIndex = Math.floor(i / this.blockSize)
      this.blocks[blockIndex]! += this.arr[i]!
    }
  }

  private _pushLazy(blockIndex: number): void {
    if (this.lazy[blockIndex]! !== 0) {
      const start = blockIndex * this.blockSize
      const end = Math.min(start + this.blockSize, this.size)
      for (let i = start; i < end; i++) {
        this.arr[i]! += this.lazy[blockIndex]!
      }
      this.lazy[blockIndex]! = 0
    }
  }

  rangeQuery(l: number, r: number): number {
    let sum = 0
    l = Math.max(0, Math.min(l, this.size))
    r = Math.max(0, Math.min(r, this.size))

    let i = l
    while (i < r) {
      const blockIndex = Math.floor(i / this.blockSize)
      const blockStart = blockIndex * this.blockSize
      const blockEnd = Math.min(blockStart + this.blockSize, this.size)

      if (l <= blockStart && r >= blockEnd) {
        sum += this.blocks[blockIndex]!
        i = blockEnd
      } else {
        this._pushLazy(blockIndex)
        sum += this.arr[i]!
        i++
      }
    }
    return sum
  }

  rangeAdd(l: number, r: number, val: number): void {
    l = Math.max(0, Math.min(l, this.size))
    r = Math.max(0, Math.min(r, this.size))

    let i = l
    while (i < r) {
      const blockIndex = Math.floor(i / this.blockSize)
      const blockStart = blockIndex * this.blockSize
      const blockEnd = Math.min(blockStart + this.blockSize, this.size)

      if (l <= blockStart && r >= blockEnd) {
        this.blocks[blockIndex]! += val * (blockEnd - blockStart)
        this.lazy[blockIndex]! += val
        i = blockEnd
      } else {
        this._pushLazy(blockIndex)
        this.arr[i]! += val
        this.blocks[blockIndex]! += val
        i++
      }
    }
  }

  pointUpdate(idx: number, val: number): void {
    if (idx < 0 || idx >= this.size) {
      throw new RangeError(`Index ${idx} out of bounds [0, ${this.size})`)
    }

    const blockIndex = Math.floor(idx / this.blockSize)
    this._pushLazy(blockIndex)
    const diff = val - this.arr[idx]!
    this.arr[idx]! = val
    this.blocks[blockIndex]! += diff
  }

  get(idx: number): number {
    if (idx < 0 || idx >= this.size) {
      throw new RangeError(`Index ${idx} out of bounds [0, ${this.size})`)
    }

    const blockIndex = Math.floor(idx / this.blockSize)
    this._pushLazy(blockIndex)
    return this.arr[idx]!
  }

  toArray(): number[] {
    for (let i = 0; i < this.lazy.length; i++) {
      this._pushLazy(i)
    }
    return [...this.arr]
  }
}

export { SqrtDecomposition as default }