export class PersistentStack2<T> {
  private constructor(
    private readonly head: Node<T> | null,
    private readonly _size: number
  ) {}

  static from<T>(items: T[]): PersistentStack2<T> {
    let stack = new PersistentStack2<T>(null, 0);
    for (let i = 0; i < items.length; i++) {
      stack = stack.push(items[i]!);
    }
    return stack;
  }

  push(value: T): PersistentStack2<T> {
    return new PersistentStack2<T>(
      { value, next: this.head },
      this._size + 1
    );
  }

  pop(): PersistentStack2<T> {
    return new PersistentStack2<T>(this.head ? this.head.next : null, Math.max(0, this._size - 1));
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current: Node<T> | null = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current: Node<T> | null = this.head;
    let index = 0;
    while (current !== null) {
      callback(current.value, index);
      current = current.next;
      index++;
    }
  }

  map<U>(fn: (value: T) => U): PersistentStack2<U> {
  const arr: U[] = [];
  let current: Node<T> | null = this.head;
  while (current !== null) {
    arr.push(fn(current.value));
    current = current.next;
  }
  return PersistentStack2.from(arr.reverse());
  }

  filter(fn: (value: T) => boolean): PersistentStack2<T> {
    const arr = this.toArray().filter(fn);
    return PersistentStack2.from(arr.reverse());
  }

  reverse(): PersistentStack2<T> {
    const arr = this.toArray();
    return PersistentStack2.from(arr);
  }

  concat(other: PersistentStack2<T>): PersistentStack2<T> {
    const thisArr = this.toArray();
    const otherArr = other.toArray();
    return PersistentStack2.from([...thisArr, ...otherArr].reverse());
  }

  every(fn: (value: T) => boolean): boolean {
    let current: Node<T> | null = this.head;
    while (current !== null) {
      if (!fn(current.value)) {
        return false;
      }
      current = current.next;
    }
    return true;
  }

  some(fn: (value: T) => boolean): boolean {
    let current: Node<T> | null = this.head;
    while (current !== null) {
      if (fn(current.value)) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  find(fn: (value: T) => boolean): T | undefined {
    let current: Node<T> | null = this.head;
    while (current !== null) {
      if (fn(current.value)) {
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  includes(value: T): boolean {
    return this.some(v => v === value);
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

  clone(): PersistentStack2<T> {
    return PersistentStack2.from(this.toArray())
  }

  toString(): string {
    return `PersistentStack2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PersistentStack2', size: this.size, items: this.toArray() }
  }
}

interface Node<T> {
  value: T;
  next: Node<T> | null;
}
