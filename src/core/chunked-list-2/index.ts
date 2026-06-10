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
    return `${ChunkedList2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ChunkedList2', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }


  drainN(n: number): T[] {
    const result: T[] = []
    for (let i = 0; i < n && this.size > 0; i++) {
      result.push(this.pop()!)
    }
    return result
  }
}
