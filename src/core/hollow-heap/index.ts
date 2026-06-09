import type { HollowHeapOptions } from './types.js';

class HollowHeapNode<T> {
  value: T;
  rank: number;
  children: HollowHeapNode<T>[];
  next: HollowHeapNode<T> | null;
  isHollow: boolean;

  constructor(value: T) {
    this.value = value;
    this.rank = 0;
    this.children = [];
    this.next = null;
    this.isHollow = false;
  }
}

export class HollowHeap<T> {
  private roots: HollowHeapNode<T>[];
  private itemCount: number;
  private comparator: (a: T, b: T) => number;
  private minRoot: HollowHeapNode<T> | null;

  constructor(options?: HollowHeapOptions & { comparator?: (a: T, b: T) => number }) {
    this.roots = [];
    this.itemCount = 0;
    this.comparator = options?.comparator || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
    this.minRoot = null;
  }

  insert(value: T): HollowHeapNode<T> {
    const node = new HollowHeapNode(value);
    this.roots.push(node);
    this.updateMin(node);
    this.itemCount++;
    return node;
  }

  extractMin(): T | undefined {
    if (this.minRoot === null || this.minRoot === undefined) {
      return undefined;
    }

    const minValue = this.minRoot.value;
    const minNode = this.minRoot;
    this.minRoot = null;

    if (!minNode.isHollow) {
      minNode.isHollow = true;
      this.itemCount--;
      this.cleanup();
    }

    return minValue;
  }

  peek(): T | undefined {
    return this.minRoot?.value;
  }

  meld(other: HollowHeap<T>): void {
    for (const root of other.roots) {
      this.roots.push(root);
      this.updateMin(root);
    }
    this.itemCount += other.itemCount;
    other.roots = [];
    other.itemCount = 0;
    other.minRoot = null;
  }

  decreaseKey(node: HollowHeapNode<T>, newValue: T): void {
    if (this.comparator(newValue, node.value) > 0) {
      throw new Error('New value must be less than or equal to current value');
    }

    if (node.isHollow) {
      throw new Error('Node has already been deleted');
    }

    node.value = newValue;
    if (this.minRoot === null || this.comparator(newValue, this.minRoot.value) < 0) {
      this.minRoot = node;
    }
  }

  delete(node: HollowHeapNode<T>): void {
    if (node.isHollow) {
      return;
    }

    node.isHollow = true;
    this.itemCount--;

    if (node === this.minRoot) {
      this.minRoot = null;
      this.cleanup();
    }
  }

  get size(): number {
    return this.itemCount;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  clear(): void {
    this.roots = [];
    this.itemCount = 0;
    this.minRoot = null;
  }

  toArray(): T[] {
    const result: T[] = [];
    const visited = new Set<HollowHeapNode<T>>();
    const queue: HollowHeapNode<T>[] = [...this.roots];
    let _qi = 0;

    while (_qi < queue.length) {
      const node = queue[_qi++];
      if (!node) {
        break;
      }
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);

      if (!node.isHollow) {
        result.push(node.value);
      }

      for (const child of node.children) {
        queue.push(child);
      }
    }

    return result.sort((a, b) => this.comparator(a, b));
  }

  forEach(callback: (value: T) => void): void {
    const values = this.toArray();
    for (const value of values) {
      callback(value);
    }
  }

  private updateMin(node: HollowHeapNode<T>): void {
    if (this.minRoot === null || this.comparator(node.value, this.minRoot.value) < 0) {
      this.minRoot = node;
    }
  }

  private   cleanup(): void {
    const rankBuckets = new Map<number, HollowHeapNode<T>>();
    const newRoots: HollowHeapNode<T>[] = [];
    const toProcess: HollowHeapNode<T>[] = [];
    const visited = new Set<HollowHeapNode<T>>();

    for (const root of this.roots) {
      if (!visited.has(root)) {
        toProcess.push(root);
        visited.add(root);
      }
    }

    let _qi = 0;
    while (_qi < toProcess.length) {
      const node = toProcess[_qi++]!;

      if (node.isHollow) {
        for (const child of node.children) {
          if (!visited.has(child)) {
            toProcess.push(child);
            visited.add(child);
          }
        }
      } else {
        let current = node;
        let iterationCount = 0;
        const maxIterations = 1000;

        while (rankBuckets.has(current.rank) && iterationCount < maxIterations) {
          const other = rankBuckets.get(current.rank)!;
          rankBuckets.delete(current.rank);
          current = this.linkNodes(current, other);
          iterationCount++;
        }

        if (iterationCount >= maxIterations) {
          break;
        }

        rankBuckets.set(current.rank, current);
      }
    }

    for (const node of Array.from(rankBuckets.values())) {
      newRoots.push(node);
    }

    this.roots = newRoots;
    this.recomputeMin();
  }

  private linkNodes(a: HollowHeapNode<T>, b: HollowHeapNode<T>): HollowHeapNode<T> {
    if (this.comparator(a.value, b.value) > 0) {
      b.children.push(a);
      b.rank = Math.max(b.rank, a.rank + 1);
      return b;
    } else {
      a.children.push(b);
      a.rank = Math.max(a.rank, b.rank + 1);
      return a;
    }
  }

  private recomputeMin(): void {
    this.minRoot = null;
    for (const root of this.roots) {
      if (!root.isHollow && (this.minRoot === null || this.comparator(root.value, this.minRoot.value) < 0)) {
        this.minRoot = root;
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

  toString(): string {
    return `${HollowHeap}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HollowHeap', size: this.size, items: this.toArray() }
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

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }
}

export type { HollowHeapOptions } from './types.js';
