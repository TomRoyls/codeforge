export class QuadHeap<T> {
  private data: T[];
  private compare: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.data = [];
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      if (Object.is(a, -0) && Object.is(b, 0)) return -1;
      if (Object.is(a, 0) && Object.is(b, -0)) return 1;
      return 0;
    });
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 4);
  }

  private child1(index: number): number {
    return 4 * index + 1;
  }

  private child2(index: number): number {
    return 4 * index + 2;
  }

  private child3(index: number): number {
    return 4 * index + 3;
  }

  private child4(index: number): number {
    return 4 * index + 4;
  }

  private swap(i: number, j: number): void {
    const temp = this.data[i]!;
    this.data[i] = this.data[j]!;
    this.data[j] = temp;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIdx = this.parent(index);
      if (this.compare(this.data[index]!, this.data[parentIdx]!) < 0) {
        this.swap(index, parentIdx);
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let smallest = index;
      const c1 = this.child1(index);
      const c2 = this.child2(index);
      const c3 = this.child3(index);
      const c4 = this.child4(index);

      if (c1 < this.data.length && this.compare(this.data[c1]!, this.data[smallest]!) < 0) {
        smallest = c1;
      }
      if (c2 < this.data.length && this.compare(this.data[c2]!, this.data[smallest]!) < 0) {
        smallest = c2;
      }
      if (c3 < this.data.length && this.compare(this.data[c3]!, this.data[smallest]!) < 0) {
        smallest = c3;
      }
      if (c4 < this.data.length && this.compare(this.data[c4]!, this.data[smallest]!) < 0) {
        smallest = c4;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  insert(value: T): number {
    this.data.push(value);
    this.heapifyUp(this.data.length - 1);
    return this.data.length - 1;
  }

  extractMin(): T | null {
    if (this.data.length === 0) {
      return null;
    }
    const min = this.data[0]!;
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.heapifyDown(0);
    }
    return min;
  }

  peek(): T | null {
    if (this.data.length === 0) {
      return null;
    }
    return this.data[0]!;
  }

  size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  clear(): void {
    this.data = [];
  }

  toArray(): T[] {
    const result = [...this.data];
    return result;
  }

  heapify(values: T[]): void {
    this.data = [...values];
    for (let i = Math.floor((this.data.length - 1) / 4); i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  replace(value: T): T | null {
    if (this.data.length === 0) {
      return null;
    }
    const min = this.data[0]!;
    this.data[0] = value;
    this.heapifyDown(0);
    return min;
  }

  pushPop(value: T): T | null {
    if (this.data.length === 0) {
      this.data.push(value);
      return null;
    }
    const min = this.data[0]!;
    if (this.compare(value, min) < 0) {
      return value;
    }
    this.data[0] = value;
    this.heapifyDown(0);
    return min;
  }
}
