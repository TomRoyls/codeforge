class SkipListNode<T> {
  value: T;
  next: (SkipListNode<T> | null)[];

  constructor(value: T, level: number) {
    this.value = value;
    this.next = new Array(level + 1).fill(null);
  }
}

export class SkipList<T> {
  private head: SkipListNode<T>;
  private maxLevel: number;
  private level: number;
  private sizeCount: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.maxLevel = 32;
    this.level = 0;
    this.sizeCount = 0;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.head = new SkipListNode<T>(null as unknown as T, this.maxLevel);
  }

  private randomLevel(): number {
    let lvl = 0;
    while (Math.random() < 0.5 && lvl < this.maxLevel - 1) {
      lvl++;
    }
    return lvl;
  }

  private createUpdate(value: T): (SkipListNode<T> | null)[] {
    const update: (SkipListNode<T> | null)[] = new Array(this.maxLevel + 1).fill(null);
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] !== null && this.comparator(current.next[i]!.value, value) < 0) {
        current = current.next[i]!;
      }
      update[i] = current;
    }

    return update;
  }

  insert(value: T): void {
    const update = this.createUpdate(value);
    const nodeLevel = this.randomLevel();

    if (nodeLevel > this.level) {
      for (let i = this.level + 1; i <= nodeLevel; i++) {
        update[i] = this.head;
      }
      this.level = nodeLevel;
    }

    const newNode = new SkipListNode<T>(value, nodeLevel);

    for (let i = 0; i <= nodeLevel; i++) {
      newNode.next[i] = update[i]!.next[i] ?? null;
      update[i]!.next[i] = newNode;
    }

    this.sizeCount++;
  }

  delete(value: T): boolean {
    const update = this.createUpdate(value);
    let current = this.head;

    current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] !== null && this.comparator(current.next[i]!.value, value) < 0) {
        current = current.next[i]!;
      }
    }

    current = current.next[0]!;

    if (current !== null && this.comparator(current.value, value) === 0) {
      for (let i = 0; i <= this.level; i++) {
        if (update[i]!.next[i] !== current) {
          break;
        }
        update[i]!.next[i] = current.next[i] ?? null;
      }

      while (this.level > 0 && this.head.next[this.level] === null) {
        this.level--;
      }

      this.sizeCount--;
      return true;
    }

    return false;
  }

  search(value: T): boolean {
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] !== null && this.comparator(current.next[i]!.value, value) < 0) {
        current = current.next[i]!;
      }
    }

    current = current.next[0]!;

    return current !== null && this.comparator(current.value, value) === 0;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  min(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.head.next[0]!.value;
  }

  max(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] !== null) {
        current = current.next[i]!;
      }
    }

    return current.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head.next[0] ?? null;

    while (current !== null) {
      result.push(current.value);
      current = current.next[0] ?? null;
    }

    return result;
  }

  size(): number {
    return this.sizeCount;
  }

  isEmpty(): boolean {
    return this.sizeCount === 0;
  }

  clear(): void {
    this.head = new SkipListNode<T>(null as unknown as T, this.maxLevel);
    this.level = 0;
    this.sizeCount = 0;
  }

  getTimeComplexity(): string {
    return "Search: O(log n), Insert: O(log n), Delete: O(log n), Space: O(n)";
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

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `SkipList()`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'SkipList', items: this.toArray() }
  }
}
