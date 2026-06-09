import type { HalvingHeapOptions } from './types.js';

class HalvingHeapNode<T> {
  children: HalvingHeapNode<T>[];
  rank: number;
  value: T;

  constructor(value: T) {
    this.value = value;
    this.rank = 0;
    this.children = [];
  }
}

export class HalvingHeap<T> {
  private capacity: number | undefined;
  private comparator: (a: T, b: T) => number;
  private itemCount: number;
  private roots: HalvingHeapNode<T>[];

  constructor(options?: HalvingHeapOptions & { comparator?: (a: T, b: T) => number }) {
    this.roots = [];
    this.itemCount = 0;
    this.comparator = options?.comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
    this.capacity = options?.capacity;
  }

  get size(): number {
    return this.itemCount;
  }

  clear(): void {
    this.roots = [];
    this.itemCount = 0;
  }

  extractMin(): T | undefined {
    if (this.roots.length === 0) {
      return undefined;
    }

    let minIndex = 0;
    for (let i = 1; i < this.roots.length; i++) {
      if (this.comparator(this.roots[i]!.value, this.roots[minIndex]!.value) < 0) {
        minIndex = i;
      }
    }

    const minNode = this.roots.splice(minIndex, 1)[0]!;
    this.itemCount--;

    for (const child of minNode.children) {
      this.roots.push(child);
    }

    this.halve();

    return minNode.value;
  }

  forEach(callback: (value: T) => void): void {
    const values = this.toArray();
    for (const value of values) {
      callback(value);
    }
  }

  insert(value: T): void {
    const node = new HalvingHeapNode(value);
    this.roots.push(node);
    this.itemCount++;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  meld(other: HalvingHeap<T>): void {
    for (const root of other.roots) {
      this.roots.push(root);
    }

    this.itemCount += other.itemCount;
    other.roots = [];
    other.itemCount = 0;

    this.halve();
  }

  peek(): T | undefined {
    if (this.roots.length === 0) {
      return undefined;
    }

    let minValue = this.roots[0]!.value;
    for (let i = 1; i < this.roots.length; i++) {
      if (this.comparator(this.roots[i]!.value, minValue) < 0) {
        minValue = this.roots[i]!.value;
      }
    }

    return minValue;
  }

  toArray(): T[] {
    const result: T[] = [];
    const allNodes: HalvingHeapNode<T>[] = [];

    const collect = (nodes: HalvingHeapNode<T>[]): void => {
      for (const node of nodes) {
        allNodes.push(node);
        collect(node.children);
      }
    };

    collect(this.roots);

    for (const node of allNodes) {
      result.push(node.value);
    }

    return result.sort((a, b) => this.comparator(a, b));
  }

  private halve(): void {
    const rankMap = new Map<number, HalvingHeapNode<T>>();
    const newRoots: HalvingHeapNode<T>[] = [];

    for (const root of this.roots) {
      let current = root;
      const maxIterations = 1000;
      let iterationCount = 0;

      while (rankMap.has(current.rank) && iterationCount < maxIterations) {
        const other = rankMap.get(current.rank)!;
        rankMap.delete(current.rank);
        current = this.link(current, other);
        iterationCount++;
      }

      if (iterationCount >= maxIterations) {
        break;
      }

      rankMap.set(current.rank, current);
    }

    for (const node of rankMap.values()) {
      newRoots.push(node);
    }

    this.roots = newRoots;

    const targetCount = Math.ceil(this.roots.length / 2);

    while (this.roots.length > targetCount) {
      const a = this.roots.pop()!;
      const b = this.roots.pop()!;

      if (b) {
        const linked = this.link(a, b);
        this.roots.push(linked);
      } else {
        this.roots.push(a);
        break;
      }
    }

    if (this.capacity !== undefined && this.roots.length > this.capacity) {
      this.roots = this.roots.slice(0, this.capacity);
    }
  }

  private link(a: HalvingHeapNode<T>, b: HalvingHeapNode<T>): HalvingHeapNode<T> {
    if (this.comparator(a.value, b.value) <= 0) {
      a.children.push(b);
      a.rank = Math.max(a.rank, b.rank + 1);
      return a;
    }

    b.children.push(a);
    b.rank = Math.max(b.rank, a.rank + 1);
    return b;
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
}

export type { HalvingHeapOptions } from './types.js';
