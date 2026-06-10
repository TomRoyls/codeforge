export class DynamicArray3<T> {
  private data: T[];
  private _length: number;

  constructor(initialCapacity: number = 8) {
    this.data = new Array<T>(initialCapacity);
    this._length = 0;
  }

  push(value: T): void {
    if (this._length === this.data.length) {
      this.resize(this.data.length * 2);
    }
    this.data[this._length] = value;
    this._length++;
  }

  pop(): T | undefined {
    if (this._length === 0) {
      return undefined;
    }
    this._length--;
    const value = this.data[this._length]!;
    this.data[this._length] = undefined as T;
    return value;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) {
      return undefined;
    }
    return this.data[index]!;
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this._length) {
      return false;
    }
    this.data[index] = value;
    return true;
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      return;
    }
    if (this._length === this.data.length) {
      this.resize(this.data.length * 2);
    }
    for (let i = this._length; i > index; i--) {
      this.data[i] = this.data[i - 1]!;
    }
    this.data[index] = value;
    this._length++;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._length) {
      return undefined;
    }
    const value = this.data[index]!;
    for (let i = index; i < this._length - 1; i++) {
      this.data[i] = this.data[i + 1]!;
    }
    this._length--;
    this.data[this._length] = undefined as T;
    return value;
  }

  get length(): number {
    return this._length;
  }

  get capacity(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  toArray(): T[] {
    return this.data.slice(0, this._length);
  }

  clear(): void {
    for (let i = 0; i < this._length; i++) {
      this.data[i] = undefined as T;
    }
    this._length = 0;
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._length; i++) {
      if (this.data[i] === value) {
        return i;
      }
    }
    return -1;
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      callback(this.data[i]!, i);
    }
  }

  map<U>(fn: (value: T, index: number) => U): DynamicArray3<U> {
    const result = new DynamicArray3<U>(this._length);
    for (let i = 0; i < this._length; i++) {
      result.push(fn(this.data[i]!, i));
    }
    return result;
  }

  filter(fn: (value: T, index: number) => boolean): DynamicArray3<T> {
    const result = new DynamicArray3<T>(this._length);
    for (let i = 0; i < this._length; i++) {
      if (fn(this.data[i]!, i)) {
        result.push(this.data[i]!);
      }
    }
    return result;
  }

  resize(newCapacity: number): void {
    if (newCapacity < this._length) {
      newCapacity = this._length;
    }
    const newData = new Array<T>(newCapacity);
    for (let i = 0; i < this._length; i++) {
      newData[i] = this.data[i]!;
    }
    this.data = newData;
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

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `DynamicArray3()`
  }



  toJSON() {
    return { type: 'DynamicArray3', items: this.toArray() }
  }

  static from<T>(items: T[]): DynamicArray3<T> {
    const instance = new DynamicArray3<T>()
    for (const item of items) {
      instance.push(item)
    }
    return instance
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

  reverse(): T[] {
    return this.toArray().reverse()
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
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


}
