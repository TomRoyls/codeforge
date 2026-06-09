import type { SparseBitmapOptions } from "./types.js";

const CHUNK_BITS = 32;

export class SparseBitmap {
  private chunks: Map<number, number>;

  constructor(_options: SparseBitmapOptions = {}) {
    this.chunks = new Map();
  }

  set(bit: number): void {
    if (bit < 0) return;
    const chunkIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    const chunk = this.chunks.get(chunkIndex) ?? 0;
    const newChunk = chunk | (1 << bitIndex);
    this.chunks.set(chunkIndex, newChunk);
  }

  clear(bit?: number): void {
    if (bit === undefined) {
      this.chunks.clear();
      return;
    }
    if (bit < 0) return;
    const chunkIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    const chunk = this.chunks.get(chunkIndex);
    if (chunk !== undefined) {
      const bitValue = 1 << bitIndex;
      const mask = ~bitValue;
      const newChunk = chunk & mask;
      if (newChunk === 0) {
        this.chunks.delete(chunkIndex);
      } else {
        this.chunks.set(chunkIndex, newChunk);
      }
    }
  }

  get(bit: number): boolean {
    if (bit < 0) return false;
    const chunkIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    const chunk = this.chunks.get(chunkIndex);
    if (chunk === undefined) return false;
    return ((chunk >> bitIndex) & 1) === 1;
  }

  flip(bit: number): void {
    if (bit < 0) return;
    const chunkIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    const chunk = this.chunks.get(chunkIndex) ?? 0;
    const newChunk = chunk ^ (1 << bitIndex);
    if (newChunk === 0) {
      this.chunks.delete(chunkIndex);
    } else {
      this.chunks.set(chunkIndex, newChunk);
    }
  }

  has(bit: number): boolean {
    return this.get(bit);
  }

  setRange(from: number, to: number): void {
    if (from < 0 || to < 0) return;
    if (from > to) return;
    for (let i = from; i <= to; i++) {
      this.set(i);
    }
  }

  clearRange(from: number, to: number): void {
    if (from < 0 || to < 0) return;
    if (from > to) return;
    for (let i = from; i <= to; i++) {
      this.clear(i);
    }
  }

  get cardinality(): number {
    let count = 0;
    for (const chunk of this.chunks.values()) {
      let n = chunk;
      while (n !== 0) {
        n &= n - 1;
        count++;
      }
    }
    return count;
  }

  get size(): number {
    return this.chunks.size;
  }

  get isEmpty(): boolean {
    return this.chunks.size === 0;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (const [chunkIndex, chunk] of this.chunks) {
      for (let i = 0; i < CHUNK_BITS; i++) {
        if ((chunk >> i) & 1) {
          result.push(chunkIndex * 32 + i);
        }
      }
    }
    return result;
  }

  forEach(callback: (bit: number) => void): void {
    for (const [chunkIndex, chunk] of this.chunks) {
      for (let i = 0; i < CHUNK_BITS; i++) {
        if ((chunk >> i) & 1) {
          callback(chunkIndex * 32 + i);
        }
      }
    }
  }

  and(other: SparseBitmap): SparseBitmap {
    const result = new SparseBitmap();
    for (const [index, chunk] of this.chunks) {
      const otherChunk = other.chunks.get(index);
      if (otherChunk !== undefined) {
        const newChunk = chunk & otherChunk;
        if (newChunk !== 0) {
          result.chunks.set(index, newChunk);
        }
      }
    }
    return result;
  }

  or(other: SparseBitmap): SparseBitmap {
    const result = new SparseBitmap();
    for (const [index, chunk] of this.chunks) {
      result.chunks.set(index, chunk);
    }
    for (const [index, chunk] of other.chunks) {
      const existingChunk = result.chunks.get(index) ?? 0;
      const newChunk = existingChunk | chunk;
      result.chunks.set(index, newChunk);
    }
    return result;
  }

  xor(other: SparseBitmap): SparseBitmap {
    const result = new SparseBitmap();
    for (const [index, chunk] of this.chunks) {
      result.chunks.set(index, chunk);
    }
    for (const [index, chunk] of other.chunks) {
      const existingChunk = result.chunks.get(index) ?? 0;
      const newChunk = existingChunk ^ chunk;
      if (newChunk !== 0) {
        result.chunks.set(index, newChunk);
      } else {
        result.chunks.delete(index);
      }
    }
    return result;
  }

  not(maxBit: number): SparseBitmap {
    const result = new SparseBitmap();
    const maxChunkIndex = Math.floor(maxBit / 32);
    for (let i = 0; i <= maxChunkIndex; i++) {
      const chunk = this.chunks.get(i) ?? 0;
      let mask: number;
      if (i < maxChunkIndex || (maxBit % 32) === 31) {
        mask = 0xffffffff;
      } else {
        mask = (1 << ((maxBit % 32) + 1)) - 1;
      }
      const newChunk = (~chunk) & mask;
      if (newChunk !== 0) {
        result.chunks.set(i, newChunk);
      }
    }
    return result;
  }

  clone(): SparseBitmap {
    const result = new SparseBitmap();
    for (const [index, chunk] of this.chunks) {
      result.chunks.set(index, chunk);
    }
    return result;
  }

  equals(other: SparseBitmap): boolean {
    if (this.chunks.size !== other.chunks.size) return false;
    for (const [index, chunk] of this.chunks) {
      const otherChunk = other.chunks.get(index);
      if (otherChunk !== chunk) return false;
    }
    return true;
  }

  isSubsetOf(other: SparseBitmap): boolean {
    for (const [index, chunk] of this.chunks) {
      const otherChunk = other.chunks.get(index);
      if (otherChunk === undefined) return false;
      if ((chunk & otherChunk) !== chunk) return false;
    }
    return true;
  }

  intersects(other: SparseBitmap): boolean {
    if (this.chunks.size < other.chunks.size) {
      for (const [index, chunk] of this.chunks) {
        const otherChunk = other.chunks.get(index);
        if (otherChunk !== undefined && (chunk & otherChunk) !== 0) {
          return true;
        }
      }
    } else {
      for (const [index, chunk] of other.chunks) {
        const myChunk = this.chunks.get(index);
        if (myChunk !== undefined && (chunk & myChunk) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `SparseBitmap({ size: ${this.size} })`
  }
}
