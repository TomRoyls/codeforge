export class ChunkedList2<T> {
  private chunks: T[][] = [];
  private chunkSize: number;
  private _size: number = 0;

  constructor(chunkSize?: number) {
    this.chunkSize = chunkSize ?? 32;
  }

  push(value: T): void {
    if (this.chunks.length === 0 || this.chunks[this.chunks.length - 1]!.length === this.chunkSize) {
      this.chunks.push([]);
    }
    const currentChunk = this.chunks[this.chunks.length - 1]!;
    currentChunk.push(value);
    this._size++;
  }

  pop(): T | undefined {
    if (this.chunks.length === 0) {
      return undefined;
    }
    const currentChunk = this.chunks[this.chunks.length - 1]!;
    const value = currentChunk.pop();
    if (value !== undefined) {
      this._size--;
    }
    if (currentChunk.length === 0) {
      this.chunks.pop();
    }
    return value;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    const chunkIndex = Math.floor(index / this.chunkSize);
    const elementIndex = index % this.chunkSize;
    return this.chunks[chunkIndex]![elementIndex];
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      return;
    }
    const chunkIndex = Math.floor(index / this.chunkSize);
    const elementIndex = index % this.chunkSize;
    this.chunks[chunkIndex]![elementIndex] = value;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.chunks = [];
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const chunk of this.chunks) {
      for (const element of chunk) {
        result.push(element);
      }
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let index = 0;
    for (const chunk of this.chunks) {
      for (const element of chunk) {
        callback(element, index);
        index++;
      }
    }
  }
}
