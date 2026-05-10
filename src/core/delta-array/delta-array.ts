import type { DeltaArrayOptions } from './types.js'

export class DeltaArray {
  private _base: number
  private _deltas: number[] = []

  constructor(initialValues?: number[], options?: DeltaArrayOptions) {
    this._base = options?.base ?? 0
    if (initialValues !== undefined && initialValues.length > 0) {
      this._deltas[0] = initialValues[0]! - this._base
      for (let i = 1; i < initialValues.length; i++) {
        this._deltas[i] = initialValues[i]! - initialValues[i - 1]!
      }
    }
  }

  private _prefixSum(index: number): number {
    let sum = 0
    for (let i = 0; i <= index; i++) {
      sum += this._deltas[i]!
    }
    return sum
  }

  get(index: number): number {
    if (index < 0 || index >= this._deltas.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._deltas.length - 1}]`)
    }
    return this._base + this._prefixSum(index)
  }

  set(index: number, value: number): void {
    if (index < 0 || index >= this._deltas.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._deltas.length - 1}]`)
    }
    const oldValue = this._base + this._prefixSum(index)
    const diff = value - oldValue
    this._deltas[index] = this._deltas[index]! + diff
    if (index + 1 < this._deltas.length) {
      this._deltas[index + 1] = this._deltas[index + 1]! - diff
    }
  }

  push(value: number): void {
    if (this._deltas.length === 0) {
      this._deltas.push(value - this._base)
    } else {
      const lastPrefixSum = this._prefixSum(this._deltas.length - 1)
      const lastValue = this._base + lastPrefixSum
      this._deltas.push(value - lastValue)
    }
  }

  pop(): number | undefined {
    if (this._deltas.length === 0) return undefined
    const lastPrefixSum = this._prefixSum(this._deltas.length - 1)
    const value = this._base + lastPrefixSum
    this._deltas.pop()
    return value
  }

  get length(): number {
    return this._deltas.length
  }

  clear(): void {
    this._deltas = []
  }

  toArray(): number[] {
    const result: number[] = []
    let running = this._base
    for (let i = 0; i < this._deltas.length; i++) {
      running += this._deltas[i]!
      result.push(running)
    }
    return result
  }

  getDeltas(): number[] {
    return [...this._deltas]
  }

  getDelta(index: number): number {
    if (index < 0 || index >= this._deltas.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._deltas.length - 1}]`)
    }
    return this._deltas[index]!
  }

  getPrefixSum(index: number): number {
    if (index < 0 || index >= this._deltas.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._deltas.length - 1}]`)
    }
    return this._prefixSum(index)
  }

  compress(): void {
    if (this._deltas.length === 0) return
    const values = this.toArray()
    const sum = values.reduce((a, b) => a + b, 0)
    const newBase = sum / values.length
    this._base = newBase
    this._deltas[0] = values[0]! - newBase
    for (let i = 1; i < values.length; i++) {
      this._deltas[i] = values[i]! - values[i - 1]!
    }
  }

  slice(start: number, end?: number): DeltaArray {
    const values = this.toArray().slice(start, end)
    return new DeltaArray(values, { base: this._base })
  }

  map(fn: (v: number, i: number) => number): DeltaArray {
    const values = this.toArray().map((v, i) => fn(v, i))
    return new DeltaArray(values)
  }

  forEach(fn: (v: number, i: number) => void): void {
    let running = this._base
    for (let i = 0; i < this._deltas.length; i++) {
      running += this._deltas[i]!
      fn(running, i)
    }
  }

  reduce(fn: (acc: number, v: number, i: number) => number, initial: number): number {
    let acc = initial
    let running = this._base
    for (let i = 0; i < this._deltas.length; i++) {
      running += this._deltas[i]!
      acc = fn(acc, running, i)
    }
    return acc
  }
}

export type { DeltaArrayOptions } from './types.js'
