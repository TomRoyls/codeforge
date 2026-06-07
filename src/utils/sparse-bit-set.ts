export class SparseBitSet {
  private chunks: Map<number, Uint32Array> = new Map()
  private _size: number = 0
  private static readonly BITS_PER_CHUNK = 1024
  private static readonly WORDS_PER_CHUNK = SparseBitSet.BITS_PER_CHUNK / 32

  private chunkIndex(bit: number): number {
    return (bit / SparseBitSet.BITS_PER_CHUNK) | 0
  }

  private wordIndex(bit: number): number {
    return ((bit % SparseBitSet.BITS_PER_CHUNK) / 32) | 0
  }

  private bitMask(bit: number): number {
    return 1 << (bit % 32)
  }

  set(bit: number): boolean {
    if (bit < 0) return false
    const ci = this.chunkIndex(bit)
    let chunk = this.chunks.get(ci)
    if (!chunk) {
      chunk = new Uint32Array(SparseBitSet.WORDS_PER_CHUNK)
      this.chunks.set(ci, chunk)
    }
    const wi = this.wordIndex(bit)
    const mask = this.bitMask(bit)
    const wasSet = (chunk[wi]! & mask) !== 0
    if (!wasSet) {
      chunk[wi]! |= mask
      this._size++
    }
    return !wasSet
  }

  clear(bit: number): boolean {
    if (bit < 0) return false
    const ci = this.chunkIndex(bit)
    const chunk = this.chunks.get(ci)
    if (!chunk) return false
    const wi = this.wordIndex(bit)
    const mask = this.bitMask(bit)
    const wasSet = (chunk[wi]! & mask) !== 0
    if (wasSet) {
      chunk[wi]! &= ~mask
      this._size--
    }
    return wasSet
  }

  has(bit: number): boolean {
    if (bit < 0) return false
    const ci = this.chunkIndex(bit)
    const chunk = this.chunks.get(ci)
    if (!chunk) return false
    const wi = this.wordIndex(bit)
    return (chunk[wi]! & this.bitMask(bit)) !== 0
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get chunkCount(): number {
    return this.chunks.size
  }

  nextSetBit(from: number): number {
    let bit = Math.max(0, from)
    let ci = this.chunkIndex(bit)
    const sortedChunks = Array.from(this.chunks.keys()).sort((a, b) => a - b)
    for (const chunkIdx of sortedChunks) {
      if (chunkIdx < ci) continue
      const startBit = chunkIdx === ci ? bit : chunkIdx * SparseBitSet.BITS_PER_CHUNK
      const endBit = (chunkIdx + 1) * SparseBitSet.BITS_PER_CHUNK
      const chunk = this.chunks.get(chunkIdx)!
      for (let b = startBit; b < endBit; b++) {
        const wi = this.wordIndex(b)
        if (chunk[wi]! & this.bitMask(b)) return b
      }
      ci = chunkIdx + 1
    }
    return -1
  }

  prevSetBit(from: number): number {
    if (from < 0) return -1
    let ci = this.chunkIndex(from)
    const sortedChunks = Array.from(this.chunks.keys()).sort((a, b) => b - a)
    for (const chunkIdx of sortedChunks) {
      if (chunkIdx > ci) continue
      const startBit = chunkIdx === ci ? from : (chunkIdx + 1) * SparseBitSet.BITS_PER_CHUNK - 1
      const endBit = chunkIdx * SparseBitSet.BITS_PER_CHUNK - 1
      const chunk = this.chunks.get(chunkIdx)!
      for (let b = startBit; b > endBit; b--) {
        const wi = this.wordIndex(b)
        if (chunk[wi]! & this.bitMask(b)) return b
      }
    }
    return -1
  }

  and(other: SparseBitSet): SparseBitSet {
    const result = new SparseBitSet()
    this.chunks.forEach((chunk, ci) => {
      const otherChunk = other.chunks.get(ci)
      if (!otherChunk) return
      for (let wi = 0; wi < chunk.length; wi++) {
        const val = chunk[wi]! & otherChunk[wi]!
        if (val !== 0) {
          const base = ci * SparseBitSet.BITS_PER_CHUNK + wi * 32
          for (let b = 0; b < 32; b++) {
            if (val & (1 << b)) result.set(base + b)
          }
        }
      }
    })
    return result
  }

  or(other: SparseBitSet): SparseBitSet {
    const result = this.clone()
    other.forEach((bit) => result.set(bit))
    return result
  }

  xor(other: SparseBitSet): SparseBitSet {
    const result = this.clone()
    other.forEach((bit) => {
      if (result.has(bit)) result.clear(bit)
      else result.set(bit)
    })
    return result
  }

  forEach(callback: (bit: number) => void): void {
    this.chunks.forEach((chunk, ci) => {
      for (let wi = 0; wi < chunk.length; wi++) {
        const val = chunk[wi]!
        if (val === 0) continue
        const base = ci * SparseBitSet.BITS_PER_CHUNK + wi * 32
        for (let b = 0; b < 32; b++) {
          if (val & (1 << b)) callback(base + b)
        }
      }
    })
  }

  toArray(): number[] {
    const result: number[] = []
    this.forEach((bit) => result.push(bit))
    return result
  }

  clone(): SparseBitSet {
    const copy = new SparseBitSet()
    this.forEach((bit) => copy.set(bit))
    return copy
  }

  reset(): void {
    this.chunks.clear()
    this._size = 0
  }
}
