export class VectorHeap2 {
  private heap: Float64Array;
  private length: number = 0;

  constructor(capacity: number = 1024) {
    this.heap = new Float64Array(capacity);
  }

  get size(): number {
    return this.length;
  }

  get capacity(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  reserve(n: number): void {
    if (n > this.heap.length) {
      const newHeap = new Float64Array(n);
      newHeap.set(this.heap.subarray(0, this.length));
      this.heap = newHeap;
    }
  }

  clear(): void {
    this.length = 0;
  }

  push(value: number): void {
    if (this.length >= this.heap.length) {
      this.reserve(this.heap.length * 2);
    }
    this.heap[this.length] = value;
    this.length++;
    this.heapifyUp(this.length - 1);
  }

  pop(): number | undefined {
    if (this.length === 0) {
      return undefined;
    }
    const min = this.heap[0]!;
    this.length--;
    if (this.length > 0) {
      this.heap[0] = this.heap[this.length]!;
      this.heapifyDown(0);
    }
    return min;
  }

  peek(): number | undefined {
    if (this.length === 0) {
      return undefined;
    }
    return this.heap[0]!;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.length; i++) {
      result.push(this.heap[i]!);
    }
    return result;
  }

  contains(value: number): boolean {
    if (Number.isNaN(value)) {
      for (let i = 0; i < this.length; i++) {
        if (Number.isNaN(this.heap[i]!)) {
          return true;
        }
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        if (this.heap[i] === value) {
          return true;
        }
      }
    }
    return false;
  }

  remove(value: number): boolean {
    if (Number.isNaN(value)) {
      for (let i = 0; i < this.length; i++) {
        if (Number.isNaN(this.heap[i]!)) {
          this.swap(i, this.length - 1);
          this.length--;
          this.heapifyUp(i);
          this.heapifyDown(i);
          return true;
        }
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        if (this.heap[i] === value) {
          this.swap(i, this.length - 1);
          this.length--;
          this.heapifyUp(i);
          this.heapifyDown(i);
          return true;
        }
      }
    }
    return false;
  }

  update(oldValue: number, newValue: number): boolean {
    if (Number.isNaN(oldValue)) {
      for (let i = 0; i < this.length; i++) {
        if (Number.isNaN(this.heap[i]!)) {
          this.heap[i] = newValue;
          if (Number.isNaN(newValue)) {
            return true;
          } else if (newValue < 0) {
            this.heapifyUp(i);
          } else {
            this.heapifyDown(i);
          }
          return true;
        }
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        if (this.heap[i] === oldValue) {
          this.heap[i] = newValue;
          if (Number.isNaN(newValue)) {
            return true;
          } else if (newValue < oldValue) {
            this.heapifyUp(i);
          } else {
            this.heapifyDown(i);
          }
          return true;
        }
      }
    }
    return false;
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = temp;
  }

  private heapifyUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.heap[i]! < this.heap[p]!) {
        this.swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }

  private heapifyDown(i: number): void {
    while (true) {
      const l = this.left(i);
      const r = this.right(i);
      let smallest = i;

      if (l < this.length && this.heap[l]! < this.heap[smallest]!) {
        smallest = l;
      }
      if (r < this.length && this.heap[r]! < this.heap[smallest]!) {
        smallest = r;
      }

      if (smallest !== i) {
        this.swap(i, smallest);
        i = smallest;
      } else {
        break;
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

  has(value: number): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'VectorHeap2', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `VectorHeap2({ size: ${this.size} })`
  }
}
