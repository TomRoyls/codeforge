export class RadixHeap {
  private buckets: number[][] = []
  private last = 0
  private _size = 0
  private b: number

  constructor(maxVal: number = 2 ** 31) {
    this.b = Math.ceil(Math.log2(maxVal + 1)) + 2
    for (let i = 0; i <= this.b; i++) this.buckets.push([])
  }

  push(val: number): void {
    this.buckets[this.bucket(val)]!.push(val)
    this._size++
  }

  pop(): number | undefined {
    if (this._size === 0) return undefined
    if (this.buckets[0]!.length === 0) this.refill()
    if (this.buckets[0]!.length === 0) return undefined
    this._size--
    return this.buckets[0]!.pop()!
  }

  private refill(): void {
    let minBucket = -1
    let minVal = Infinity
    for (let i = 1; i <= this.b; i++) {
      for (const v of this.buckets[i]!) {
        if (v < minVal) { minVal = v; minBucket = i }
      }
    }
    if (minBucket === -1) return
    const vals = this.buckets[minBucket]!
    this.buckets[minBucket] = []
    this.last = minVal
    for (const v of vals) {
      this.buckets[this.bucket(v)]!.push(v)
    }
  }

  private bucket(val: number): number {
    if (val < this.last) return 0
    const diff = val - this.last
    if (diff === 0) return 0
    return Math.floor(Math.log2(diff)) + 1
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }
}
