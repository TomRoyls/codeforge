const DEFAULT_COMPARATOR = <T,>(a: T, b: T): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

export interface DoubleEndedPQ2Options<T> {
  comparator?: (a: T, b: T) => number;
}

export class DoubleEndedPQ2<T = number> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(options?: DoubleEndedPQ2Options<T>) {
    this.compare = options?.comparator ?? DEFAULT_COMPARATOR;
  }

  push(item: T): void {
    this.heap.push(item);
    if (this.heap.length > 1) {
      this.bubbleUp(this.heap.length - 1);
    }
  }

  popMin(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ2 is empty');
    }
    const min = this.heap[0]!;
    this.removeAt(0);
    return min;
  }

  popMax(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ2 is empty');
    }
    const maxIndex = this.findMaxIndex();
    const max = this.heap[maxIndex]!;
    this.removeAt(maxIndex);
    return max;
  }

  peekMin(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ2 is empty');
    }
    return this.heap[0]!;
  }

  peekMax(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ2 is empty');
    }
    const maxIndex = this.findMaxIndex();
    return this.heap[maxIndex]!;
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
  }

  toArray(): T[] {
    return [...this.heap];
  }

  toSortedArray(): T[] {
    const sorted = [...this.heap];
    sorted.sort(this.compare);
    return sorted;
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        return true;
      }
    }
    return false;
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  }

  clone(): DoubleEndedPQ2<T> {
    const cloned = new DoubleEndedPQ2<T>({ comparator: this.compare });
    cloned.heap = [...this.heap];
    return cloned;
  }

  static fromArray<U>(items: U[], options?: DoubleEndedPQ2Options<U>): DoubleEndedPQ2<U> {
    const pq = new DoubleEndedPQ2<U>(options);
    for (const item of items) {
      pq.push(item);
    }
    return pq;
  }

  forEach(callback: (item: T) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!);
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const heap = this.heap;
    return {
      next(): IteratorResult<T> {
        if (index < heap.length) {
          return { value: heap[index++]!, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      },
    };
  }

  private findMaxIndex(): number {
    if (this.heap.length === 1) return 0;
    if (this.heap.length === 2) return 1;
    return this.compare(this.heap[1]!, this.heap[2]!) > 0 ? 1 : 2;
  }

  private removeAt(index: number): void {
    const last = this.heap.pop();
    if (index >= this.heap.length || last === undefined) {
      return;
    }
    this.heap[index] = last;
    this.bubbleUp(index);
    this.trickleDown(index);
  }

  private isMinLevel(index: number): boolean {
    let level = 0;
    let i = index + 1;
    while (i > 1) {
      i >>= 1;
      level++;
    }
    return level % 2 === 0;
  }

  private parentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private grandparentIndex(index: number): number {
    return Math.floor((Math.floor((index - 1) / 2) - 1) / 2);
  }

  private bubbleUp(index: number): void {
    if (this.isMinLevel(index)) {
      if (index > 0) {
        const p = this.parentIndex(index);
        if (this.compare(this.heap[index]!, this.heap[p]!) > 0) {
          this.swap(index, p);
          this.bubbleUpMax(p);
          return;
        }
      }
      this.bubbleUpMin(index);
    } else {
      if (index > 0) {
        const p = this.parentIndex(index);
        if (this.compare(this.heap[index]!, this.heap[p]!) < 0) {
          this.swap(index, p);
          this.bubbleUpMin(p);
          return;
        }
      }
      this.bubbleUpMax(index);
    }
  }

  private bubbleUpMin(index: number): void {
    while (index > 2) {
      const gp = this.grandparentIndex(index);
      if (gp >= 0 && this.compare(this.heap[index]!, this.heap[gp]!) < 0) {
        this.swap(index, gp);
        index = gp;
      } else {
        break;
      }
    }
  }

  private bubbleUpMax(index: number): void {
    while (index > 2) {
      const gp = this.grandparentIndex(index);
      if (gp >= 0 && this.compare(this.heap[index]!, this.heap[gp]!) > 0) {
        this.swap(index, gp);
        index = gp;
      } else {
        break;
      }
    }
  }

  private trickleDown(index: number): void {
    if (this.isMinLevel(index)) {
      this.trickleDownMin(index);
    } else {
      this.trickleDownMax(index);
    }
  }

  private trickleDownMin(index: number): void {
    while (2 * index + 1 < this.heap.length) {
      const m = this.indexOfSmallestDescendant(index);
      if (this.isGrandchild(index, m)) {
        if (this.compare(this.heap[m]!, this.heap[index]!) < 0) {
          this.swap(index, m);
          const p = this.parentIndex(m);
          if (p >= 0 && this.compare(this.heap[m]!, this.heap[p]!) > 0) {
            this.swap(m, p);
          }
          index = m;
        } else {
          break;
        }
      } else {
        if (this.compare(this.heap[m]!, this.heap[index]!) < 0) {
          this.swap(index, m);
        }
        break;
      }
    }
  }

  private trickleDownMax(index: number): void {
    while (2 * index + 1 < this.heap.length) {
      const m = this.indexOfLargestDescendant(index);
      if (this.isGrandchild(index, m)) {
        if (this.compare(this.heap[m]!, this.heap[index]!) > 0) {
          this.swap(index, m);
          const p = this.parentIndex(m);
          if (p >= 0 && this.compare(this.heap[m]!, this.heap[p]!) < 0) {
            this.swap(m, p);
          }
          index = m;
        } else {
          break;
        }
      } else {
        if (this.compare(this.heap[m]!, this.heap[index]!) > 0) {
          this.swap(index, m);
        }
        break;
      }
    }
  }

  private indexOfSmallestDescendant(index: number): number {
    const fc = 2 * index + 1;
    let smallest = fc;
    if (fc + 1 < this.heap.length && this.compare(this.heap[fc + 1]!, this.heap[smallest]!) < 0) {
      smallest = fc + 1;
    }
    for (let gc = 4 * index + 3; gc <= 4 * index + 6; gc++) {
      if (gc < this.heap.length && this.compare(this.heap[gc]!, this.heap[smallest]!) < 0) {
        smallest = gc;
      }
    }
    return smallest;
  }

  private indexOfLargestDescendant(index: number): number {
    const fc = 2 * index + 1;
    let largest = fc;
    if (fc + 1 < this.heap.length && this.compare(this.heap[fc + 1]!, this.heap[largest]!) > 0) {
      largest = fc + 1;
    }
    for (let gc = 4 * index + 3; gc <= 4 * index + 6; gc++) {
      if (gc < this.heap.length && this.compare(this.heap[gc]!, this.heap[largest]!) > 0) {
        largest = gc;
      }
    }
    return largest;
  }

  private isGrandchild(index: number, candidate: number): boolean {
    return candidate >= 4 * index + 3 && candidate <= 4 * index + 6;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = temp;
  }

  toString(): string {
    return `${DoubleEndedPQ2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(item: T): boolean {
    return this.contains(item)
  }

  toJSON() {
    return { type: 'DoubleEndedPQ2', size: this.size, items: this.toArray() }
  }

  peek(): T {
    return this.peekMin()
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
}
