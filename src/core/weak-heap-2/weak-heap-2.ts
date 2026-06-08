import type { WeakHeap2Options } from './types.js';

export type Comparator<T> = (a: T, b: T) => number;

export type WeakHeapNode<T> = {
  value: T;
  index: number;
  id: number;
};

const DEFAULT_CAPACITY = 128;

export class WeakHeap2<T> {
  private heap: (T | undefined)[];
  private _size: number;
  private comparator: Comparator<T>;
  private nextId: number;
  private nodeMap: Map<number, WeakHeapNode<T>>;
  private capacity: number;

  constructor(comparator?: Comparator<T>, options?: WeakHeap2Options) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.capacity = options?.capacity || DEFAULT_CAPACITY;
    this.heap = new Array(this.capacity);
    this._size = 0;
    this.nextId = 0;
    this.nodeMap = new Map();
  }

  insert(value: T): WeakHeapNode<T> {
    if (this._size >= this.capacity) {
      this._resize();
    }

    const node: WeakHeapNode<T> = {
      value,
      index: this._size,
      id: this.nextId++,
    };

    this.heap[this._size] = value;
    this.nodeMap.set(node.id, node);
    this._size++;

    this._siftUp(node.index);
    return node;
  }

  extractMin(): T | undefined {
    if (this._size === 0) {
      return undefined;
    }

    const min = this.heap[0]!;
    const id = this._findNodeId(0);
    if (id !== undefined) {
      this.nodeMap.delete(id);
    }

    this._size--;

    if (this._size > 0) {
      this.heap[0] = this.heap[this._size]!;
      this.heap[this._size] = undefined;
      const movedNode = this._findNodeByIndex(this._size);
      if (movedNode) movedNode.index = 0;
      this._siftDown(0);
    } else {
      this.heap[0] = undefined;
    }

    return min;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  decreaseKey(node: WeakHeapNode<T>, newValue: T): void {
    if (this.comparator(newValue, node.value) >= 0) {
      return;
    }

    this.heap[node.index] = newValue;
    node.value = newValue;
    this._siftUp(node.index);
  }

  merge(other: WeakHeap2<T>): void {
    const elements = other.toArray();
    for (const element of elements) {
      this.insert(element);
    }
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.heap[i] = undefined;
    }
    this._size = 0;
    this.nodeMap.clear();
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const value = this.heap[i];
      if (value !== undefined) {
        result.push(value);
      }
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const value = this.heap[i];
      if (value !== undefined) {
        callback(value, i);
      }
    }
  }

  private _parent(index: number): number {
    return (index - 1) >> 1;
  }

  private _leftChild(index: number): number {
    return (index << 1) + 1;
  }

  private _rightChild(index: number): number {
    return (index << 1) + 2;
  }

  private _swap(i: number, j: number): void {
    const temp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = temp;

    const nodeAtI = this._findNodeByIndex(i);
    const nodeAtJ = this._findNodeByIndex(j);
    if (nodeAtI) nodeAtI.index = j;
    if (nodeAtJ) nodeAtJ.index = i;
  }

  private _findNodeByIndex(index: number): WeakHeapNode<T> | undefined {
    for (const [, node] of this.nodeMap) {
      if (node.index === index) {
        return node;
      }
    }
    return undefined;
  }

  private _findNodeId(index: number): number | undefined {
    for (const [id, node] of this.nodeMap) {
      if (node.index === index) {
        return id;
      }
    }
    return undefined;
  }

  private _siftUp(index: number): void {
    while (index > 0) {
      const parent = this._parent(index);
      if (this.comparator(this.heap[index]!, this.heap[parent]!) < 0) {
        this._swap(index, parent);
        index = parent;
      } else {
        break;
      }
    }
  }

  private _siftDown(index: number): void {
    while (true) {
      const left = this._leftChild(index);
      const right = this._rightChild(index);
      let smallest = index;

      if (left < this._size && this.heap[left] !== undefined && this.comparator(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left;
      }

      if (right < this._size && this.heap[right] !== undefined && this.comparator(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        this._swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private _resize(): void {
    const newCapacity = this.capacity * 2;
    const newHeap = new Array(newCapacity);

    for (let i = 0; i < this._size; i++) {
      newHeap[i] = this.heap[i];
    }

    this.heap = newHeap;
    this.capacity = newCapacity;
  }
}
