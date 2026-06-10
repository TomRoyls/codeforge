export class DWaveHeap<T> {
  private heap: T[] = [];
  private cmp: (a: T, b: T) => number;
  private readonly d: number;

  constructor(d?: number, comparator?: (a: T, b: T) => number) {
    this.d = d ?? 2;
    if (this.d < 2) this.d = 2;
    this.cmp = comparator ?? this.defaultComparator;
  }

  private defaultComparator(a: T, b: T): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  insert(value: T): void {
    this.heap.push(value);
    this.waveUp(this.heap.length - 1);
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.waveDown(0);
    }
    return min;
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) return undefined;
    let maxIdx = 0;
    for (let i = 1; i < this.heap.length; i++) {
      if (this.cmp(this.heap[i]!, this.heap[maxIdx]!) > 0) {
        maxIdx = i;
      }
    }
    const max = this.heap[maxIdx]!;
    const last = this.heap.pop()!;
    if (maxIdx < this.heap.length) {
      this.heap[maxIdx] = last;
      this.waveUp(maxIdx);
      this.waveDown(maxIdx);
    }
    return max;
  }

  peekMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    return this.heap[0];
  }

  peekMax(): T | undefined {
    if (this.heap.length === 0) return undefined;
    let maxVal = this.heap[0];
    for (let i = 1; i < this.heap.length; i++) {
      if (this.cmp(this.heap[i]!, maxVal!) > 0) {
        maxVal = this.heap[i];
      }
    }
    return maxVal;
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  contains(value: T): boolean {
    return this.heap.includes(value);
  }

  toArray(): T[] {
    return [...this.heap];
  }

  clear(): void {
    this.heap.length = 0;
  }

  heapify(items: T[]): void {
    this.heap = [...items];
    for (let i = Math.floor(this.heap.length / this.d) - 1; i >= 0; i--) {
      this.waveDown(i);
    }
  }

  merge(other: DWaveHeap<T>): DWaveHeap<T> {
    const result = new DWaveHeap<T>(this.d, this.cmp);
    for (const item of this.heap) result.insert(item);
    for (const item of other.heap) result.insert(item);
    return result;
  }

  delete(value: T): boolean {
    const idx = this.heap.indexOf(value);
    if (idx === -1) return false;
    const last = this.heap.pop()!;
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this.waveUp(idx);
      this.waveDown(idx);
    }
    return true;
  }

  private waveUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index);
      if (this.cmp(this.heap[index]!, this.heap[p]!) < 0) {
        this.swap(index, p);
        index = p;
      } else {
        break;
      }
    }
  }

  private waveDown(index: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = index;
      for (let k = 0; k < this.d; k++) {
        const c = this.d * index + k + 1;
        if (c < n && this.cmp(this.heap[c]!, this.heap[smallest]!) < 0) {
          smallest = c;
        }
      }
      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / this.d);
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = tmp;
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
    return `${DWaveHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'DWaveHeap', size: this.size, items: this.toArray() }
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
}
