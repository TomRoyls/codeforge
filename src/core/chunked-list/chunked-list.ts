import type { ChunkedListOptions, ChunkedListStats } from './types.js'
import { DEFAULT_CHUNK_SIZE } from './types.js'

interface Chunk<T> {
  elements: T[]
}

const defaultCompare = <T>(a: T, b: T): number => (a < b ? -1 : a > b ? 1 : 0)

export class ChunkedList<T = unknown> {
  private chunks: Chunk<T>[] = []
  private chunkSize: number
  private _length: number = 0

  constructor(chunkSize?: number)
  constructor(options?: Partial<ChunkedListOptions>)
  constructor(chunkSizeOrOptions?: number | Partial<ChunkedListOptions>) {
    if (typeof chunkSizeOrOptions === 'number') {
      this.chunkSize = Math.max(1, chunkSizeOrOptions)
    } else if (chunkSizeOrOptions && typeof chunkSizeOrOptions === 'object') {
      this.chunkSize = Math.max(1, chunkSizeOrOptions.chunkSize ?? DEFAULT_CHUNK_SIZE)
    } else {
      this.chunkSize = DEFAULT_CHUNK_SIZE
    }
  }

  private resolveIndex(index: number): { chunkIndex: number; elementIndex: number } {
    let remaining = index
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunkLen = this.chunks[ci]!.elements.length
      if (remaining < chunkLen) {
        return { chunkIndex: ci, elementIndex: remaining }
      }
      remaining -= chunkLen
    }
    return { chunkIndex: -1, elementIndex: -1 }
  }

  append(value: T): void {
    const lastChunk = this.chunks[this.chunks.length - 1]
    if (!lastChunk || lastChunk.elements.length === this.chunkSize) {
      const newChunk: Chunk<T> = { elements: [value] }
      this.chunks.push(newChunk)
    } else {
      lastChunk.elements.push(value)
    }
    this._length++
  }

  prepend(value: T): void {
    if (this.chunks.length === 0) {
      this.chunks.push({ elements: [value] })
    } else {
      const firstChunk = this.chunks[0]!
      if (firstChunk.elements.length < this.chunkSize) {
        firstChunk.elements.unshift(value)
      } else {
        this.chunks.unshift({ elements: [value] })
      }
    }
    this._length++
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const { chunkIndex, elementIndex } = this.resolveIndex(index)
    return this.chunks[chunkIndex]!.elements[elementIndex]
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds for ChunkedList of length ${this._length}`)
    }
    const { chunkIndex, elementIndex } = this.resolveIndex(index)
    this.chunks[chunkIndex]!.elements[elementIndex] = value
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError(`Index ${index} out of bounds for insert on ChunkedList of length ${this._length}`)
    }
    if (index === 0) {
      this.prepend(value)
      return
    }
    if (index === this._length) {
      this.append(value)
      return
    }
    const { chunkIndex, elementIndex } = this.resolveIndex(index)
    const chunk = this.chunks[chunkIndex]!
    if (chunk.elements.length < this.chunkSize) {
      chunk.elements.splice(elementIndex, 0, value)
    } else {
      const rightHalf = chunk.elements.splice(elementIndex)
      chunk.elements.push(value)
      const newChunk: Chunk<T> = { elements: rightHalf }
      this.chunks.splice(chunkIndex + 1, 0, newChunk)
    }
    this._length++
  }

  remove(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const { chunkIndex, elementIndex } = this.resolveIndex(index)
    const chunk = this.chunks[chunkIndex]!
    const removed = chunk.elements.splice(elementIndex, 1)[0]!
    this._length--
    if (chunk.elements.length === 0) {
      this.chunks.splice(chunkIndex, 1)
    }
    return removed
  }

  indexOf(value: T): number {
    let globalIndex = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        if (defaultCompare(chunk.elements[ei]!, value) === 0) {
          return globalIndex
        }
        globalIndex++
      }
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  toArray(): T[] {
    const result: T[] = []
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        result.push(chunk.elements[ei]!)
      }
    }
    return result
  }

  get length(): number {
    return this._length
  }

  isEmpty(): boolean {
    return this._length === 0
  }

  clear(): void {
    this.chunks = []
    this._length = 0
  }

  forEach(callback: (item: T, index: number) => void): void {
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        callback(chunk.elements[ei]!, idx)
        idx++
      }
    }
  }

  map<U>(callback: (item: T, index: number) => U): ChunkedList<U> {
    const result = new ChunkedList<U>(this.chunkSize)
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        result.append(callback(chunk.elements[ei]!, idx))
        idx++
      }
    }
    return result
  }

  filter(predicate: (item: T, index: number) => boolean): ChunkedList<T> {
    const result = new ChunkedList<T>(this.chunkSize)
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        if (predicate(chunk.elements[ei]!, idx)) {
          result.append(chunk.elements[ei]!)
        }
        idx++
      }
    }
    return result
  }

  reduce<U>(callback: (accumulator: U, item: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        acc = callback(acc, chunk.elements[ei]!, idx)
        idx++
      }
    }
    return acc
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.elements.length; ei++) {
        yield chunk.elements[ei]!
      }
    }
  }

  get chunkCount(): number {
    return this.chunks.length
  }

  getChunk(index: number): T[] | undefined {
    if (index < 0 || index >= this.chunks.length) return undefined
    return [...this.chunks[index]!.elements]
  }

  getStats(): ChunkedListStats {
    const totalChunks = this.chunks.length
    const utilizedChunks = totalChunks
    const maxCapacity = totalChunks * this.chunkSize
    const utilizationRatio = maxCapacity === 0 ? 0 : this._length / maxCapacity
    return { totalChunks, utilizedChunks, utilizationRatio }
  }
}

export { DEFAULT_CHUNK_SIZE } from './types.js'
export type { ChunkedListOptions, ChunkedListStats } from './types.js'
