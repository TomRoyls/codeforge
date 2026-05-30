import type { ElasticBucketOptions, ElasticBucketStatistics } from './types.js'
import { DEFAULT_ELASTIC_BUCKET_OPTIONS } from './types.js'

interface Chunk<T> {
  data: (T | undefined)[]
  head: number
  tail: number
  count: number
}

export class ElasticBucket<T = unknown> {
  private chunks: Chunk<T>[] = []
  private _frontChunkIdx = 0
  private chunkSize: number
  private _size = 0
  private stats: ElasticBucketStatistics = {
    pushes: 0,
    pops: 0,
    insertAts: 0,
    removeAts: 0,
    resizes: 0,
    chunks: 0,
    compactions: 0,
  }

  constructor(options?: ElasticBucketOptions) {
    const resolved = { ...DEFAULT_ELASTIC_BUCKET_OPTIONS, ...options }
    this.chunkSize = Math.max(1, Math.floor(resolved.chunkSize))
  }

  private createChunk(): Chunk<T> {
    const chunk: Chunk<T> = {
      data: new Array(this.chunkSize),
      head: 0,
      tail: 0,
      count: 0,
    }
    this.stats.chunks++
    return chunk
  }

  private ensureFirstChunk(): void {
    if (this.chunks.length === this._frontChunkIdx) {
      this.chunks.push(this.createChunk())
      this.stats.resizes++
    }
  }

  private get _firstChunk(): Chunk<T> {
    return this.chunks[this._frontChunkIdx]!
  }

  private get _lastChunk(): Chunk<T> {
    return this.chunks[this.chunks.length - 1]!
  }

  private _maybeCompactChunks(): void {
    if (this._frontChunkIdx > 16 && this._frontChunkIdx > this.chunks.length >> 1) {
      this.chunks = this.chunks.slice(this._frontChunkIdx)
      this._frontChunkIdx = 0
    }
  }

  pushFront(value: T): void {
    this.ensureFirstChunk()
    const first = this._firstChunk
    if (first.count === this.chunkSize) {
      const newChunk = this.createChunk()
      newChunk.data[this.chunkSize - 1] = value
      newChunk.head = this.chunkSize - 1
      newChunk.tail = this.chunkSize
      newChunk.count = 1
      this.chunks.splice(this._frontChunkIdx, 0, newChunk)
      this.stats.resizes++
    } else if (first.count === 0) {
      first.data[0] = value
      first.head = 0
      first.tail = 1
      first.count = 1
    } else {
      first.head = (first.head - 1 + this.chunkSize) % this.chunkSize
      first.data[first.head] = value
      first.count++
    }
    this._size++
    this.stats.pushes++
  }

  pushBack(value: T): void {
    this.ensureFirstChunk()
    const last = this._lastChunk
    if (last.count === this.chunkSize) {
      const newChunk = this.createChunk()
      newChunk.data[0] = value
      newChunk.head = 0
      newChunk.tail = 1
      newChunk.count = 1
      this.chunks.push(newChunk)
      this.stats.resizes++
    } else if (last.count === 0) {
      last.data[0] = value
      last.head = 0
      last.tail = 1
      last.count = 1
    } else {
      last.data[last.tail] = value
      last.tail = (last.tail + 1) % this.chunkSize
      last.count++
    }
    this._size++
    this.stats.pushes++
  }

  popFront(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot pop from empty ElasticBucket')
    }
    const first = this._firstChunk
    const value = first.data[first.head]!
    first.data[first.head] = undefined
    first.head = (first.head + 1) % this.chunkSize
    first.count--
    this._size--
    if (first.count === 0 && this.chunks.length - this._frontChunkIdx > 1) {
      this._frontChunkIdx++
      this._maybeCompactChunks()
    }
    this.stats.pops++
    return value
  }

  popBack(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot pop from empty ElasticBucket')
    }
    const last = this._lastChunk
    last.tail = (last.tail - 1 + this.chunkSize) % this.chunkSize
    const value = last.data[last.tail]!
    last.data[last.tail] = undefined
    last.count--
    this._size--
    if (last.count === 0 && this.chunks.length - this._frontChunkIdx > 1) {
      this.chunks.pop()
    }
    this.stats.pops++
    return value
  }

  peekFront(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot peek empty ElasticBucket')
    }
    const first = this._firstChunk
    return first.data[first.head]!
  }

  peekBack(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot peek empty ElasticBucket')
    }
    const last = this._lastChunk
    const idx = (last.tail - 1 + this.chunkSize) % this.chunkSize
    return last.data[idx]!
  }

  private locateIndex(index: number): { chunkIdx: number; posInChunk: number } {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    let remaining = index
    for (let ci = this._frontChunkIdx; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      if (remaining < chunk.count) {
        const posInChunk = (chunk.head + remaining) % this.chunkSize
        return { chunkIdx: ci, posInChunk }
      }
      remaining -= chunk.count
    }
    throw new RangeError(`Index ${index} out of bounds`)
  }

  at(index: number): T {
    const { chunkIdx, posInChunk } = this.locateIndex(index)
    return this.chunks[chunkIdx]!.data[posInChunk]!
  }

  setAt(index: number, value: T): void {
    const { chunkIdx, posInChunk } = this.locateIndex(index)
    this.chunks[chunkIdx]!.data[posInChunk] = value
  }

  insertAt(index: number, value: T): void {
    if (index === 0) {
      this.pushFront(value)
      this.stats.insertAts++
      return
    }
    if (index === this._size) {
      this.pushBack(value)
      this.stats.insertAts++
      return
    }
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds for insertAt [0, ${this._size}]`)
    }

    const { chunkIdx } = this.locateIndex(index)
    const chunk = this.chunks[chunkIdx]!
    const offset = index - this.sumCountsBefore(chunkIdx)

    if (chunk.count < this.chunkSize) {
      const elements = this.extractChunkElements(chunk)
      elements.splice(offset, 0, value)
      this.packChunkFromArray(chunk, elements)
      chunk.count++
    } else {
      const elements = this.extractChunkElements(chunk)
      elements.splice(offset, 0, value)
      const mid = Math.ceil(elements.length / 2)
      const left = elements.slice(0, mid)
      const right = elements.slice(mid)

      this.packChunkFromArray(chunk, left)
      chunk.count = left.length

      const newChunk = this.createChunk()
      this.packChunkFromArray(newChunk, right)
      newChunk.count = right.length

      this.chunks.splice(chunkIdx + 1, 0, newChunk)
      this.stats.resizes++
    }

    this._size++
    this.stats.insertAts++
  }

  private extractChunkElements(chunk: Chunk<T>): T[] {
    const result: T[] = []
    for (let i = 0; i < chunk.count; i++) {
      const pos = (chunk.head + i) % this.chunkSize
      result.push(chunk.data[pos]!)
      chunk.data[pos] = undefined
    }
    return result
  }

  private packChunkFromArray(chunk: Chunk<T>, elements: T[]): void {
    chunk.head = 0
    chunk.tail = 0
    for (let i = 0; i < elements.length; i++) {
      chunk.data[i] = elements[i]!
    }
    chunk.tail = elements.length % this.chunkSize
  }

  private sumCountsBefore(chunkIdx: number): number {
    let sum = 0
    for (let i = this._frontChunkIdx; i < chunkIdx; i++) {
      sum += this.chunks[i]!.count
    }
    return sum
  }

  removeAt(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds for removeAt [0, ${this._size})`)
    }

    if (index === 0) {
      const val = this.popFront()
      this.stats.removeAts++
      return val
    }
    if (index === this._size - 1) {
      const val = this.popBack()
      this.stats.removeAts++
      return val
    }

    const { chunkIdx } = this.locateIndex(index)
    const chunk = this.chunks[chunkIdx]!
    const offset = index - this.sumCountsBefore(chunkIdx)

    const elements = this.extractChunkElements(chunk)
    const value = elements.splice(offset, 1)[0]!

    if (elements.length > 0) {
      this.packChunkFromArray(chunk, elements)
      chunk.count = elements.length
    } else if (this.chunks.length - this._frontChunkIdx > 1) {
      this.chunks.splice(chunkIdx, 1)
    }

    this._size--
    this.stats.removeAts++
    return value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.chunks = []
    this._frontChunkIdx = 0
    this._size = 0
    this.stats = {
      pushes: 0,
      pops: 0,
      insertAts: 0,
      removeAts: 0,
      resizes: 0,
      chunks: 0,
      compactions: 0,
    }
  }

  toArray(): T[] {
    const result: T[] = []
    for (let ci = this._frontChunkIdx; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let i = 0; i < chunk.count; i++) {
        const pos = (chunk.head + i) % this.chunkSize
        result.push(chunk.data[pos]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let ci = this._frontChunkIdx; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let i = 0; i < chunk.count; i++) {
        const pos = (chunk.head + i) % this.chunkSize
        callback(chunk.data[pos]!, idx)
        idx++
      }
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let ci = this._frontChunkIdx
    let i = 0
    const chunks = this.chunks
    const chunkSize = this.chunkSize

    return {
      next(): IteratorResult<T> {
        while (ci < chunks.length) {
          const chunk = chunks[ci]!
          if (i < chunk.count) {
            const pos = (chunk.head + i) % chunkSize
            i++
            return { value: chunk.data[pos]!, done: false }
          }
          ci++
          i = 0
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  capacity(): number {
    let total = 0
    for (let i = this._frontChunkIdx; i < this.chunks.length; i++) {
      total += this.chunkSize
    }
    return total
  }

  compact(): void {
    if (this._size === 0) {
      this.chunks = []
      this._frontChunkIdx = 0
      this.stats.compactions++
      return
    }

    const values = this.toArray()
    const numChunks = Math.ceil(values.length / this.chunkSize)
    this.chunks = []
    this._frontChunkIdx = 0

    for (let ci = 0; ci < numChunks; ci++) {
      const chunk = this.createChunk()
      const start = ci * this.chunkSize
      const end = Math.min(start + this.chunkSize, values.length)
      for (let j = start; j < end; j++) {
        chunk.data[j - start] = values[j]!
      }
      chunk.head = 0
      chunk.tail = end - start
      chunk.count = end - start
      this.chunks.push(chunk)
    }

    this.stats.compactions++
  }

  chunkCount(): number {
    return this.chunks.length - this._frontChunkIdx
  }

  getStatistics(): ElasticBucketStatistics {
    return { ...this.stats, chunks: this.chunks.length - this._frontChunkIdx }
  }
}
