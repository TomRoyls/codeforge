import type { GapBufferOptions } from "./types.js";

export class GapBuffer<T> {
  private buffer: (T | undefined)[];
  private _gapStart: number;
  private _gapEnd: number;
  private _size: number;

  constructor(initialCapacity: number = 8) {
    const capacity = Math.max(1, initialCapacity);
    this.buffer = new Array(capacity);
    this._gapStart = 0;
    this._gapEnd = capacity;
    this._size = 0;
  }

  static fromArray<U>(items: U[], options?: GapBufferOptions): GapBuffer<U> {
    const capacity = Math.max(items.length, options?.initialCapacity ?? items.length);
    const gb = new GapBuffer<U>(capacity);
    for (const item of items) {
      gb.insert(item);
    }
    return gb;
  }

  private grow(): void {
    const oldCapacity = this.buffer.length;
    const newCapacity = oldCapacity * 2;
    const newBuffer = new Array<T | undefined>(newCapacity);

    for (let i = 0; i < this._gapStart; i++) {
      newBuffer[i] = this.buffer[i];
    }

    const rightCount = this._size - this._gapStart;
    const newGapEnd = newCapacity - rightCount;
    for (let i = 0; i < rightCount; i++) {
      newBuffer[newGapEnd + i] = this.buffer[this._gapEnd + i];
    }

    this.buffer = newBuffer;
    this._gapEnd = newGapEnd;
  }

  private moveTo(position: number): void {
    const pos = Math.max(0, Math.min(this._size, position));
    if (pos === this._gapStart) return;

    if (this._gapStart === this._gapEnd) {
      this.grow();
    }

    const gapSize = this._gapEnd - this._gapStart;

    if (pos < this._gapStart) {
      const count = this._gapStart - pos;
      for (let i = count - 1; i >= 0; i--) {
        this.buffer[pos + gapSize + i] = this.buffer[pos + i];
        this.buffer[pos + i] = undefined;
      }
      this._gapStart = pos;
      this._gapEnd = pos + gapSize;
    } else {
      const count = pos - this._gapStart;
      for (let i = 0; i < count; i++) {
        this.buffer[this._gapStart + i] = this.buffer[this._gapEnd + i];
        this.buffer[this._gapEnd + i] = undefined;
      }
      this._gapStart = pos;
      this._gapEnd = pos + gapSize;
    }
  }

  insert(item: T): void {
    if (this._gapStart === this._gapEnd) {
      this.grow();
    }
    this.buffer[this._gapStart] = item;
    this._gapStart++;
    this._size++;
  }

  delete(): T | undefined {
    if (this._gapStart === 0) {
      return undefined;
    }
    this._gapStart--;
    this._size--;
    const item = this.buffer[this._gapStart];
    this.buffer[this._gapStart] = undefined;
    return item;
  }

  getCursor(): number {
    return this._gapStart;
  }

  setCursor(pos: number): void {
    this.moveTo(pos);
  }

  moveLeft(): void {
    if (this._gapStart > 0) {
      this.moveTo(this._gapStart - 1);
    }
  }

  moveRight(): void {
    if (this._gapStart < this._size) {
      this.moveTo(this._gapStart + 1);
    }
  }

  moveStart(): void {
    this.moveTo(0);
  }

  moveEnd(): void {
    this.moveTo(this._size);
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    if (index < this._gapStart) {
      return this.buffer[index];
    }
    return this.buffer[index + (this._gapEnd - this._gapStart)];
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this._size) {
      return false;
    }
    if (index < this._gapStart) {
      this.buffer[index] = value;
    } else {
      this.buffer[index + (this._gapEnd - this._gapStart)] = value;
    }
    return true;
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this.buffer.length;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.buffer = new Array(this.buffer.length);
    this._gapStart = 0;
    this._gapEnd = this.buffer.length;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._gapStart; i++) {
      result.push(this.buffer[i]!);
    }
    const rightCount = this._size - this._gapStart;
    for (let i = 0; i < rightCount; i++) {
      result.push(this.buffer[this._gapEnd + i]!);
    }
    return result;
  }

  toString(): string {
    return this.toArray().map(String).join(",");
  }

  [Symbol.iterator](): Iterator<T> {
    const arr = this.toArray();
    let idx = 0;
    return {
      next(): IteratorResult<T> {
        if (idx < arr.length) {
          const value = arr[idx]!;
          idx++;
          return { value, done: false };
        }
        return { done: true } as IteratorResult<T>;
      },
    };
  }

  slice(start: number = 0, end: number = this._size): T[] {
    const s = Math.max(0, start);
    const e = Math.min(this._size, end);
    const result: T[] = [];
    for (let i = s; i < e; i++) {
      const item = this.get(i);
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      const val = this.get(i);
      if (val !== undefined && val === item) {
        return i;
      }
    }
    return -1;
  }

  contains(item: T): boolean {
    return this.indexOf(item) !== -1;
  }

  forEach(cb: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const val = this.get(i);
      if (val !== undefined) {
        cb(val, i);
      }
    }
  }

  get gapSize(): number {
    return this._gapEnd - this._gapStart;
  }
}
