export class SparseBitSet {
  private chunks: Map<number, number> = new Map()
  private _size: number = 0
  private static readonly BITS_PER_CHUNK = 32

  set(index: number): void {
    if (index < 0) return
    const chunkIndex = Math.floor(index / SparseBitSet.BITS_PER_CHUNK)
    const bitIndex = index % SparseBitSet.BITS_PER_CHUNK
    const mask = 1 << bitIndex
    const current = this.chunks.get(chunkIndex) ?? 0
    if ((current & mask) === 0) {
      this.chunks.set(chunkIndex, current | mask)
      this._size++
    }
  }

  get(index: number): boolean {
    if (index < 0) return false
    const chunkIndex = Math.floor(index / SparseBitSet.BITS_PER_CHUNK)
    const bitIndex = index % SparseBitSet.BITS_PER_CHUNK
    const current = this.chunks.get(chunkIndex)
    if (current === undefined) return false
    return (current & (1 << bitIndex)) !== 0
  }

  clear(index: number): void {
    if (index < 0) return
    const chunkIndex = Math.floor(index / SparseBitSet.BITS_PER_CHUNK)
    const bitIndex = index % SparseBitSet.BITS_PER_CHUNK
    const current = this.chunks.get(chunkIndex)
    if (current === undefined) return
    const mask = 1 << bitIndex
    if ((current & mask) !== 0) {
      const updated = current & ~mask
      if (updated === 0) {
        this.chunks.delete(chunkIndex)
      } else {
        this.chunks.set(chunkIndex, updated)
      }
      this._size--
    }
  }

  flip(index: number): void {
    if (index < 0) return
    if (this.get(index)) {
      this.clear(index)
    } else {
      this.set(index)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get memoryChunks(): number {
    return this.chunks.size
  }

  and(other: SparseBitSet): void {
    for (const [chunkIndex, chunk] of this.chunks) {
      const otherChunk = other.chunks.get(chunkIndex) ?? 0
      const result = chunk & otherChunk
      const prevSize = popcount(chunk)
      const newSize = popcount(result)
      this._size += newSize - prevSize
      if (result === 0) {
        this.chunks.delete(chunkIndex)
      } else {
        this.chunks.set(chunkIndex, result)
      }
    }
  }

  or(other: SparseBitSet): void {
    for (const [chunkIndex, otherChunk] of other.chunks) {
      const current = this.chunks.get(chunkIndex) ?? 0
      const prevSize = popcount(current)
      const newSize = popcount(otherChunk)
      this._size += newSize - prevSize
      if (current === 0) {
        this.chunks.set(chunkIndex, otherChunk)
      } else {
        const result = current | otherChunk
        this.chunks.set(chunkIndex, result)
        this._size += popcount(result) - newSize
      }
    }
  }

  xor(other: SparseBitSet): void {
    const allKeys = new Set([...this.chunks.keys(), ...other.chunks.keys()])
    for (const chunkIndex of allKeys) {
      const a = this.chunks.get(chunkIndex) ?? 0
      const b = other.chunks.get(chunkIndex) ?? 0
      const prevSize = popcount(a)
      const result = a ^ b
      const newSize = popcount(result)
      this._size += newSize - prevSize
      if (result === 0) {
        this.chunks.delete(chunkIndex)
      } else {
        this.chunks.set(chunkIndex, result)
      }
    }
  }

  nextSetBit(fromIndex: number): number {
    if (fromIndex < 0) fromIndex = 0
    const sortedKeys = [...this.chunks.keys()].sort((a, b) => a - b)
    let startChunk = Math.floor(fromIndex / SparseBitSet.BITS_PER_CHUNK)
    let startBit = fromIndex % SparseBitSet.BITS_PER_CHUNK

    for (const ci of sortedKeys) {
      if (ci < startChunk) continue
      const chunk = this.chunks.get(ci)!
      const from = ci === startChunk ? startBit : 0
      for (let b = from; b < 32; b++) {
        if ((chunk & (1 << b)) !== 0) {
          return ci * 32 + b
        }
      }
      startChunk = ci + 1
      startBit = 0
    }
    return -1
  }

  toArray(): number[] {
    const result: number[] = []
    const sortedKeys = [...this.chunks.keys()].sort((a, b) => a - b)
    for (const ci of sortedKeys) {
      const chunk = this.chunks.get(ci)!
      for (let b = 0; b < 32; b++) {
        if ((chunk & (1 << b)) !== 0) {
          result.push(ci * 32 + b)
        }
      }
    }
    return result
  }
}

function popcount(n: number): number {
  n = n - ((n >>> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333)
  return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}
