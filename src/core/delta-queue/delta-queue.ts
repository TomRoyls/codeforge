export class DeltaQueue {
  private _deltas: number[] = []
  private _head = 0
  private _lastValue: number | undefined = undefined
  private _capacity: number | undefined
  private _cacheValid = false
  private _runningSums: number[] = []
  private _prefixSums: number[] = []

  constructor(capacity?: number) {
    this._capacity = capacity
  }

  private _size(): number {
    return this._deltas.length - this._head
  }

  private _compact(): void {
    if (this._head > 0) {
      this._deltas = this._deltas.slice(this._head)
      this._head = 0
    }
  }

  private _invalidate(): void {
    this._cacheValid = false
  }

  private _ensureCache(): void {
    if (this._cacheValid) return
    this._runningSums = []
    this._prefixSums = []
    let running = 0
    let prefix = 0
    for (let i = this._head; i < this._deltas.length; i++) {
      running += this._deltas[i]!
      prefix += running
      this._runningSums[i - this._head] = running
      this._prefixSums[i - this._head] = prefix
    }
    this._cacheValid = true
  }

  push(value: number): void {
    if (this._size() === 0) {
      this._deltas.push(value)
      this._lastValue = value
    } else {
      const delta = value - this._lastValue!
      this._deltas.push(delta)
      this._lastValue = value
    }
    if (this._capacity !== undefined && this._size() > this._capacity) {
      this._compact()
      if (this._deltas.length > 1) {
        this._deltas[0] = this._deltas[0]! + this._deltas[1]!
        this._deltas.splice(1, 1)
      } else {
        this._head++
        this._lastValue = undefined
      }
    }
    this._invalidate()
  }

  pop(): number | undefined {
    if (this._size() === 0) return undefined
    const value = this._lastValue!
    const poppedDelta = this._deltas.pop()!
    if (this._size() === 0) {
      this._lastValue = undefined
    } else {
      this._lastValue = value - poppedDelta
    }
    this._invalidate()
    return value
  }

  peek(): number | undefined {
    if (this._size() === 0) return undefined
    return this._lastValue
  }

  at(index: number): number {
    if (index < 0 || index >= this._size()) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size() - 1}]`)
    }
    this._ensureCache()
    return this._runningSums[index]!
  }

  deltaAt(index: number): number {
    if (index < 0 || index >= this._size()) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size() - 1}]`)
    }
    return this._deltas[this._head + index]!
  }

  prefixSum(index?: number): number {
    if (this._size() === 0) return 0
    this._ensureCache()
    const i = index ?? this._size() - 1
    if (i < 0 || i >= this._size()) {
      throw new RangeError(`Index ${i} out of bounds [0, ${this._size() - 1}]`)
    }
    return this._prefixSums[i]!
  }

  rangeSum(from: number, to: number): number {
    if (this._size() === 0 && from === 0 && to === -1) return 0
    if (from < 0 || to >= this._size() || from > to) {
      throw new RangeError(`Invalid range [${from}, ${to}] for size ${this._size()}`)
    }
    this._ensureCache()
    const upper = this._prefixSums[to]!
    const lower = from > 0 ? this._prefixSums[from - 1]! : 0
    return upper - lower
  }

  reconstruct(): number[] {
    if (this._size() === 0) return []
    this._ensureCache()
    return [...this._runningSums]
  }

  get size(): number {
    return this._size()
  }

  isEmpty(): boolean {
    return this._size() === 0
  }

  clear(): void {
    this._deltas = []
    this._head = 0
    this._lastValue = undefined
    this._invalidate()
  }

  min(): number | undefined {
    if (this._size() === 0) return undefined
    this._ensureCache()
    let result = this._runningSums[0]!
    for (let i = 1; i < this._runningSums.length; i++) {
      const v = this._runningSums[i]!
      if (v < result) result = v
    }
    return result
  }

  max(): number | undefined {
    if (this._size() === 0) return undefined
    this._ensureCache()
    let result = this._runningSums[0]!
    for (let i = 1; i < this._runningSums.length; i++) {
      const v = this._runningSums[i]!
      if (v > result) result = v
    }
    return result
  }

  mean(): number | undefined {
    if (this._size() === 0) return undefined
    this._ensureCache()
    return this._prefixSums[this._prefixSums.length - 1]! / this._size()
  }

  get deltas(): number[] {
    return this._deltas.slice(this._head)
  }

  toArray(): number[] {
    return this.reconstruct()
  }

  static fromArray(values: number[], capacity?: number): DeltaQueue {
    const dq = new DeltaQueue(capacity)
    for (const v of values) {
      dq.push(v)
    }
    return dq
  }

  compress(): DeltaQueue {
    if (this._size() === 0) return new DeltaQueue(this._capacity)
    this._ensureCache()
    const compressed = new DeltaQueue(this._capacity)
    for (let i = 0; i < this._runningSums.length; i++) {
      if (i === 0 || this._deltas[this._head + i]! !== 0) {
        compressed.push(this._runningSums[i]!)
      }
    }
    return compressed
  }
}

export type { DeltaQueueOptions } from './types.js'
