export interface PQEntry {
  id: number;
  priority: number;
}

export class IndexedPQ2 {
  private heap: PQEntry[];
  private indexMap: Map<number, number>;
  private _size: number;

  constructor(capacity: number = 256) {
    this.heap = new Array(capacity);
    this.indexMap = new Map();
    this._size = 0;
  }

  private greater(i: number, j: number): boolean {
    const entryI = this.heap[i]!;
    const entryJ = this.heap[j]!;
    if (entryI.priority !== entryJ.priority) {
      return entryI.priority > entryJ.priority;
    }
    return entryI.id > entryJ.id;
  }

  private swap(i: number, j: number): void {
    const entryI = this.heap[i]!;
    const entryJ = this.heap[j]!;
    this.heap[i] = entryJ;
    this.heap[j] = entryI;
    this.indexMap.set(entryJ.id, i);
    this.indexMap.set(entryI.id, j);
  }

  private swim(k: number): void {
    while (k > 0) {
      const parent = Math.floor((k - 1) / 2);
      if (this.greater(k, parent)) break;
      this.swap(k, parent);
      k = parent;
    }
  }

  private sink(k: number): void {
    const n = this._size;
    while (true) {
      let left = 2 * k + 1;
      let right = 2 * k + 2;
      let smallest = k;
      if (left < n && this.greater(smallest, left)) {
        smallest = left;
      }
      if (right < n && this.greater(smallest, right)) {
        smallest = right;
      }
      if (smallest === k) break;
      this.swap(k, smallest);
      k = smallest;
    }
  }

  private ensureCapacity(): void {
    if (this._size < this.heap.length) return;
    const newHeap = new Array(this.heap.length * 2);
    for (let i = 0; i < this.heap.length; i++) {
      newHeap[i] = this.heap[i]!;
    }
    this.heap = newHeap;
  }

  insert(id: number, priority: number): void {
    if (this.indexMap.has(id)) {
      throw new Error(`ID ${id} already exists in the priority queue`);
    }
    this.ensureCapacity();
    const index = this._size;
    this.heap[index] = { id, priority };
    this.indexMap.set(id, index);
    this._size++;
    this.swim(index);
  }

  delete(id: number): boolean {
    const index = this.indexMap.get(id);
    if (index === undefined) return false;
    const lastIndex = this._size - 1;
    if (index !== lastIndex) {
      this.swap(index, lastIndex);
      this.heap[lastIndex] = undefined!;
      this._size--;
      this.swim(index);
      this.sink(index);
    } else {
      this.heap[lastIndex] = undefined!;
      this._size--;
    }
    this.indexMap.delete(id);
    return true;
  }

  update(id: number, newPriority: number): boolean {
    const index = this.indexMap.get(id);
    if (index === undefined) return false;
    const oldPriority = this.heap[index]!.priority;
    this.heap[index]!.priority = newPriority;
    if (newPriority < oldPriority) {
      this.swim(index);
    } else {
      this.sink(index);
    }
    return true;
  }

  contains(id: number): boolean {
    return this.indexMap.has(id);
  }

  peek(): { id: number; priority: number } | undefined {
    if (this._size === 0) return undefined;
    return this.heap[0];
  }

  extractMin(): { id: number; priority: number } | undefined {
    if (this._size === 0) return undefined;
    const min = this.heap[0]!;
    this.delete(min.id);
    return min;
  }

  getPriority(id: number): number | undefined {
    const index = this.indexMap.get(id);
    if (index === undefined) return undefined;
    return this.heap[index]!.priority;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._size = 0;
    this.indexMap.clear();
    for (let i = 0; i < this.heap.length; i++) {
      this.heap[i] = undefined!;
    }
  }

  toString(): string {
    return `${IndexedPQ2}({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'IndexedPQ2'
  }

  includes(id: number): boolean {
    return this.contains(id)
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
