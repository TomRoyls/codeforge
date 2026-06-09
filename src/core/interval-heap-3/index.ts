export class IntervalHeap3<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    const size = this.data.length;

    if (size === 0) {
      this.data.push(value);
      return;
    }

    if (size === 1) {
      const first = this.data[0]!;
      if (this.comparator(first, value) <= 0) {
        this.data.push(value);
      } else {
        this.data[0] = value;
        this.data.push(first);
      }
      return;
    }

    this.data.push(value);
    this.siftUp(size);
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const current = this.data[index]!;
      const parentVal = this.data[parent]!;

      if (this.comparator(current, parentVal) < 0) {
        this.data[index] = parentVal;
        this.data[parent] = current;
        index = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const size = this.data.length;

    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < size && this.comparator(this.data[left]!, this.data[smallest]!) < 0) {
        smallest = left;
      }

      if (right < size && this.comparator(this.data[right]!, this.data[smallest]!) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        const temp = this.data[index]!;
        this.data[index] = this.data[smallest]!;
        this.data[smallest] = temp;
        index = smallest;
      } else {
        break;
      }
    }
  }

  getMin(): T | undefined {
    return this.data.length > 0 ? this.data[0] : undefined;
  }

  getMax(): T | undefined {
    const size = this.data.length;
    if (size === 0) {
      return undefined;
    }
    if (size === 1) {
      return this.data[0];
    }
    if (size === 2) {
      return this.data[1];
    }
    let maxIdx = 1;
    for (let i = 2; i < size; i++) {
      if (this.comparator(this.data[i]!, this.data[maxIdx]!) > 0) {
        maxIdx = i;
      }
    }
    return this.data[maxIdx];
  }

  extractMin(): T | undefined {
    const size = this.data.length;
    if (size === 0) {
      return undefined;
    }
    if (size === 1) {
      return this.data.pop()!;
    }

    const min = this.data[0]!;
    const last = this.data.pop()!;
    this.data[0] = last;
    this.siftDown(0);
    return min;
  }

  extractMax(): T | undefined {
    const size = this.data.length;
    if (size === 0) {
      return undefined;
    }
    if (size === 1) {
      return this.data.pop()!;
    }
    if (size === 2) {
      return this.data.pop()!;
    }

    let maxIdx = 1;
    for (let i = 2; i < size; i++) {
      if (this.comparator(this.data[i]!, this.data[maxIdx]!) > 0) {
        maxIdx = i;
      }
    }
    const max = this.data[maxIdx]!;
    
    const last = this.data.pop()!;
    if (maxIdx < size - 1) {
      this.data[maxIdx] = last;
      this.siftDown(maxIdx);
    }
    
    return max;
  }

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  clear(): void {
    this.data = [];
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.data.length; i++) {
      result.push(this.data[i]!);
    }
    return result;
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
    return `${IntervalHeap3}({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'IntervalHeap3', size: this.size, items: this.toArray() }
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

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }
}
