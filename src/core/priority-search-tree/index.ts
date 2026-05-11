import type { Comparator, PriorityEntry, PrioritySearchTreeOptions } from "./types.js";

export class PrioritySearchTree<K, P = number> {
  private heap: PriorityEntry<K, P>[] = [];
  private keyMap: Map<K, number> = new Map();
  private priorityComparator: Comparator<P>;
  private keyComparator: Comparator<K>;

  constructor(options?: PrioritySearchTreeOptions<K, P>) {
    const defaultPriorityComp: Comparator<P> = (a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return a < b ? -1 : a > b ? 1 : 0;
      }
      const aNum = Number(a);
      const bNum = Number(b);
      if (aNum < bNum) return -1;
      if (aNum > bNum) return 1;
      return 0;
    };
    const defaultKeyComp: Comparator<K> = (a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return a < b ? -1 : a > b ? 1 : 0;
      }
      const aNum = Number(a);
      const bNum = Number(b);
      if (aNum < bNum) return -1;
      if (aNum > bNum) return 1;
      return 0;
    };
    this.priorityComparator = options?.priorityComparator ?? defaultPriorityComp;
    this.keyComparator = options?.keyComparator ?? defaultKeyComp;
  }

  private at(index: number): PriorityEntry<K, P> {
    return this.heap[index]!;
  }

  insert(key: K, priority: P): void {
    if (this.keyMap.has(key)) {
      throw new Error(`Duplicate key: ${String(key)}`);
    }
    const entry: PriorityEntry<K, P> = { key, priority };
    const index = this.heap.length;
    this.heap.push(entry);
    this.keyMap.set(key, index);
    this.bubbleUp(index);
  }

  delete(key: K): PriorityEntry<K, P> {
    const index = this.keyMap.get(key);
    if (index === undefined) {
      throw new Error(`Key not found: ${String(key)}`);
    }
    const entry = this.at(index);
    const lastIndex = this.heap.length - 1;
    if (index === lastIndex) {
      this.heap.pop();
      this.keyMap.delete(key);
      return entry;
    }
    this.swap(index, lastIndex);
    this.heap.pop();
    this.keyMap.delete(key);
    if (index < this.heap.length) {
      this.bubbleUp(index);
      this.sinkDown(index);
    }
    return entry;
  }

  extractMin(): PriorityEntry<K, P> {
    if (this.heap.length === 0) {
      throw new Error("PrioritySearchTree is empty");
    }
    const entry = this.at(0);
    this.delete(entry.key);
    return entry;
  }

  extractMax(): PriorityEntry<K, P> {
    if (this.heap.length === 0) {
      throw new Error("PrioritySearchTree is empty");
    }
    let maxIndex = 0;
    for (let i = 1; i < this.heap.length; i++) {
      if (this.priorityComparator(this.at(i).priority, this.at(maxIndex).priority) > 0) {
        maxIndex = i;
      }
    }
    const entry = this.at(maxIndex);
    this.delete(entry.key);
    return entry;
  }

  peek(): PriorityEntry<K, P> {
    if (this.heap.length === 0) {
      throw new Error("PrioritySearchTree is empty");
    }
    return this.at(0);
  }

  peekMax(): PriorityEntry<K, P> {
    if (this.heap.length === 0) {
      throw new Error("PrioritySearchTree is empty");
    }
    let maxIndex = 0;
    for (let i = 1; i < this.heap.length; i++) {
      if (this.priorityComparator(this.at(i).priority, this.at(maxIndex).priority) > 0) {
        maxIndex = i;
      }
    }
    return this.at(maxIndex);
  }

  get(key: K): P | undefined {
    const index = this.keyMap.get(key);
    if (index === undefined) return undefined;
    return this.at(index).priority;
  }

  has(key: K): boolean {
    return this.keyMap.has(key);
  }

  updatePriority(key: K, newPriority: P): void {
    const index = this.keyMap.get(key);
    if (index === undefined) {
      throw new Error(`Key not found: ${String(key)}`);
    }
    const oldPriority = this.at(index).priority;
    this.at(index).priority = newPriority;
    const cmp = this.priorityComparator(newPriority, oldPriority);
    if (cmp < 0) {
      this.bubbleUp(index);
    } else if (cmp > 0) {
      this.sinkDown(index);
    }
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
    this.keyMap.clear();
  }

  toArray(): PriorityEntry<K, P>[] {
    return [...this.heap];
  }

  forEach(callback: (entry: PriorityEntry<K, P>, index: number) => void): void {
    this.heap.forEach((entry, index) => {
      callback(entry, index);
    });
  }

  keys(): K[] {
    return this.heap.map((entry) => entry.key);
  }

  sortByPriority(): PriorityEntry<K, P>[] {
    const sorted = [...this.heap];
    sorted.sort((a, b) => this.priorityComparator(a.priority, b.priority));
    return sorted;
  }

  findByPriority(priority: P): PriorityEntry<K, P>[] {
    return this.heap.filter((entry) => this.priorityComparator(entry.priority, priority) === 0);
  }

  findByPriorityRange(minPriority: P, maxPriority: P): PriorityEntry<K, P>[] {
    return this.heap.filter(
      (entry) =>
        this.priorityComparator(entry.priority, minPriority) >= 0 &&
        this.priorityComparator(entry.priority, maxPriority) <= 0,
    );
  }

  drain(): PriorityEntry<K, P>[] {
    const result: PriorityEntry<K, P>[] = [];
    while (this.heap.length > 0) {
      result.push(this.extractMin());
    }
    return result;
  }

  merge(other: PrioritySearchTree<K, P>): void {
    for (const entry of other.heap) {
      if (!this.keyMap.has(entry.key)) {
        this.insert(entry.key, entry.priority);
      }
    }
  }

  clone(): PrioritySearchTree<K, P> {
    const newTree = new PrioritySearchTree<K, P>({
      priorityComparator: this.priorityComparator,
      keyComparator: this.keyComparator,
    });
    for (const entry of this.heap) {
      const index = newTree.heap.length;
      newTree.heap.push({ key: entry.key, priority: entry.priority });
      newTree.keyMap.set(entry.key, index);
    }
    for (let i = Math.floor(newTree.heap.length / 2) - 1; i >= 0; i--) {
      newTree.sinkDown(i);
    }
    return newTree;
  }

  containsAll(keys: K[]): boolean {
    return keys.every((key) => this.keyMap.has(key));
  }

  containsAny(keys: K[]): boolean {
    return keys.some((key) => this.keyMap.has(key));
  }

  values(): P[] {
    return this.heap.map((entry) => entry.priority);
  }

  entries(): [K, P][] {
    return this.heap.map((entry) => [entry.key, entry.priority]);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.priorityComparator(this.at(index).priority, this.at(parentIndex).priority) < 0) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      if (leftChild < length && this.priorityComparator(this.at(leftChild).priority, this.at(smallest).priority) < 0) {
        smallest = leftChild;
      }
      if (rightChild < length && this.priorityComparator(this.at(rightChild).priority, this.at(smallest).priority) < 0) {
        smallest = rightChild;
      }
      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const a = this.at(i);
    const b = this.at(j);
    this.heap.splice(i, 1, b);
    this.heap.splice(j, 1, a);
    this.keyMap.set(a.key, j);
    this.keyMap.set(b.key, i);
  }
}

export type { Comparator, PriorityEntry, PrioritySearchTreeOptions } from "./types.js";
