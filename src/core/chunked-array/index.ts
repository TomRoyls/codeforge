import type { ChunkedArrayOptions } from './types.js'
import { DEFAULT_CHUNK_SIZE } from './types.js'

export class ChunkedArray<T = unknown> {
  private chunks: T[][] = []
  private _chunkSize: number
  private _length: number = 0

  constructor(chunkSize?: number)
  constructor(options?: Partial<ChunkedArrayOptions>)
  constructor(chunkSizeOrOptions?: number | Partial<ChunkedArrayOptions>) {
    if (typeof chunkSizeOrOptions === 'number') {
      this._chunkSize = Math.max(1, chunkSizeOrOptions)
    } else if (chunkSizeOrOptions && typeof chunkSizeOrOptions === 'object') {
      this._chunkSize = Math.max(1, chunkSizeOrOptions.chunkSize ?? DEFAULT_CHUNK_SIZE)
    } else {
      this._chunkSize = DEFAULT_CHUNK_SIZE
    }
  }

  private locate(index: number): { ci: number; ei: number } {
    let remaining = index
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunkLen = this.chunks[ci]!.length
      if (remaining < chunkLen) {
        return { ci, ei: remaining }
      }
      remaining -= chunkLen
    }
    const ci = Math.floor(index / this._chunkSize)
    const ei = index % this._chunkSize
    return { ci, ei }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const { ci, ei } = this.locate(index)
    return this.chunks[ci]![ei]
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(
        `Index ${index} out of bounds for ChunkedArray of size ${this._length}`
      )
    }
    const { ci, ei } = this.locate(index)
    this.chunks[ci]![ei] = value
  }

  push(value: T): number {
    const { ci } = this.locate(this._length)
    if (ci >= this.chunks.length) {
      this.chunks.push([value])
    } else {
      this.chunks[ci]!.push(value)
    }
    this._length++
    return this._length
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined
    this._length--
    const { ci } = this.locate(this._length)
    const chunk = this.chunks[ci]!
    const value = chunk.pop()!
    if (chunk.length === 0) {
      this.chunks.splice(ci, 1)
    }
    return value
  }

  unshift(value: T): number {
    if (this.chunks.length === 0) {
      this.chunks.push([value])
    } else {
      const first = this.chunks[0]!
      if (first.length < this._chunkSize) {
        first.unshift(value)
      } else {
        this.chunks.unshift([value])
      }
    }
    this._length++
    return this._length
  }

  shift(): T | undefined {
    if (this._length === 0) return undefined
    const first = this.chunks[0]!
    const value = first.shift()!
    this._length--
    if (first.length === 0) {
      this.chunks.splice(0, 1)
    } else {
      this.rebalanceForward(0)
    }
    return value
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError(
        `Index ${index} out of bounds for insert on ChunkedArray of size ${this._length}`
      )
    }
    if (index === 0) {
      this.unshift(value)
      return
    }
    if (index === this._length) {
      this.push(value)
      return
    }
    const { ci, ei } = this.locate(index)
    const chunk = this.chunks[ci]!
    if (chunk.length < this._chunkSize) {
      chunk.splice(ei, 0, value)
    } else {
      const right = chunk.splice(ei)
      chunk.push(value)
      this.chunks.splice(ci + 1, 0, right)
    }
    this._length++
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    if (index === 0) return this.shift()
    if (index === this._length - 1) return this.pop()
    const { ci, ei } = this.locate(index)
    const chunk = this.chunks[ci]!
    const removed = chunk.splice(ei, 1)[0]!
    this._length--
    if (chunk.length === 0) {
      this.chunks.splice(ci, 1)
    }
    return removed
  }

  get size(): number {
    return this._length
  }

  isEmpty(): boolean {
    return this._length === 0
  }

  clear(): void {
    this.chunks = []
    this._length = 0
  }

  indexOf(value: T): number {
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        if (chunk[ei] === value) {
          return ci * this._chunkSize + ei
        }
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  toArray(): T[] {
    const result: T[] = []
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        result.push(chunk[ei]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        callback(chunk[ei]!, idx)
        idx++
      }
    }
  }

  map<U>(callback: (value: T, index: number) => U): ChunkedArray<U> {
    const result = new ChunkedArray<U>(this._chunkSize)
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        result.push(callback(chunk[ei]!, idx))
        idx++
      }
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): ChunkedArray<T> {
    const result = new ChunkedArray<T>(this._chunkSize)
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        if (predicate(chunk[ei]!, idx)) {
          result.push(chunk[ei]!)
        }
        idx++
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        acc = callback(acc, chunk[ei]!, idx)
        idx++
      }
    }
    return acc
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        yield chunk[ei]!
      }
    }
  }

  get chunkCount(): number {
    return this.chunks.length
  }

  get chunkSize(): number {
    return this._chunkSize
  }

  private rebalanceForward(startCi: number): void {
    let ci = startCi
    while (ci < this.chunks.length - 1) {
      const current = this.chunks[ci]!
      const next = this.chunks[ci + 1]!
      if (current.length === 0) {
        this.chunks.splice(ci, 1)
        continue
      }
      const needed = this._chunkSize - current.length
      if (needed > 0 && next.length > 0) {
        const take = Math.min(needed, next.length)
        for (let i = 0; i < take; i++) {
          current.push(next.shift()!)
        }
        if (next.length === 0) {
          this.chunks.splice(ci + 1, 1)
        }
      }
      ci++
    }
  }

  toString(): string {
    return `${ChunkedArray}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ChunkedArray', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }
}

export { DEFAULT_CHUNK_SIZE } from './types.js'
export type { ChunkedArrayOptions } from './types.js'
