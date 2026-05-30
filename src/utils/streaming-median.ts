export class StreamingMedian {
  private low: number[] = []
  private high: number[] = []
  private _count: number = 0
  private _total: number = 0

  push(value: number): void {
    this._count++
    this._total += value
    if (this.low.length === 0 || value <= this.low[0]!) {
      this.lowPush(value)
    } else {
      this.highPush(value)
    }
    this.rebalance()
  }

  median(): number {
    if (this._count === 0) return 0
    if (this._count % 2 === 1) {
      return this.low[0]!
    }
    return (this.low[0]! + this.high[0]!) / 2
  }

  mean(): number {
    if (this._count === 0) return 0
    return this._total / this._count
  }

  min(): number {
    if (this._count === 0) return 0
    const lowHeap = this.low
    let min = lowHeap[0] ?? Infinity
    for (let i = 1; i < lowHeap.length; i++) {
      if (lowHeap[i]! < min) min = lowHeap[i]!
    }
    for (let i = 0; i < this.high.length; i++) {
      if (this.high[i]! < min) min = this.high[i]!
    }
    return min
  }

  max(): number {
    if (this._count === 0) return 0
    let max = this.low[0] ?? -Infinity
    for (let i = 1; i < this.low.length; i++) {
      if (this.low[i]! > max) max = this.low[i]!
    }
    for (let i = 0; i < this.high.length; i++) {
      if (this.high[i]! > max) max = this.high[i]!
    }
    return max
  }

  get count(): number {
    return this._count
  }

  get sum(): number {
    return this._total
  }

  private lowPush(value: number): void {
    this.low.push(value)
    let i = this.low.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.low[parent]! < this.low[i]!) {
        const tmp = this.low[parent]!
        this.low[parent] = this.low[i]!
        this.low[i] = tmp
        i = parent
      } else {
        break
      }
    }
  }

  private highPush(value: number): void {
    this.high.push(value)
    let i = this.high.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.high[parent]! > this.high[i]!) {
        const tmp = this.high[parent]!
        this.high[parent] = this.high[i]!
        this.high[i] = tmp
        i = parent
      } else {
        break
      }
    }
  }

  private lowPop(): number | undefined {
    if (this.low.length === 0) return undefined
    const top = this.low[0]
    const last = this.low.pop()!
    if (this.low.length > 0) {
      this.low[0] = last
      this.heapifyDown(this.low, false)
    }
    return top
  }

  private highPop(): number | undefined {
    if (this.high.length === 0) return undefined
    const top = this.high[0]
    const last = this.high.pop()!
    if (this.high.length > 0) {
      this.high[0] = last
      this.heapifyDown(this.high, true)
    }
    return top
  }

  private heapifyDown(heap: number[], isMin: boolean): void {
    let i = 0
    while (true) {
      let target = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < heap.length) {
        if (isMin ? heap[left]! < heap[target]! : heap[left]! > heap[target]!) {
          target = left
        }
      }
      if (right < heap.length) {
        if (isMin ? heap[right]! < heap[target]! : heap[right]! > heap[target]!) {
          target = right
        }
      }
      if (target === i) break
      const tmp = heap[target]!
      heap[target] = heap[i]!
      heap[i] = tmp
      i = target
    }
  }

  private rebalance(): void {
    if (this.low.length > this.high.length + 1) {
      const val = this.lowPop()
      if (val !== undefined) this.highPush(val)
    } else if (this.high.length > this.low.length) {
      const val = this.highPop()
      if (val !== undefined) this.lowPush(val)
    }
  }
}
