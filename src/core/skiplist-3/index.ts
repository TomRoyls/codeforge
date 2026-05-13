class SkipListNode3<T> {
  value: T;
  next: (SkipListNode3<T> | null)[];

  constructor(value: T, level: number) {
    this.value = value;
    this.next = new Array(level + 1).fill(null);
  }
}

export class SkipList3<T> {
  private head: SkipListNode3<T>;
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
    this.head = new SkipListNode3<T>(null as unknown as T, this.maxLevel);
  }

  private randomLevel(): number {
    let lvl = 0;
    while (Math.random() < 0.5 && lvl < this.maxLevel - 1) {
      lvl++;
    }
    return lvl;
  }

  private createUpdate(value: T): (SkipListNode3<T> | null)[] {
    const update: (SkipListNode3<T> | null)[] = new Array(this.maxLevel + 1).fill(null);
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

    const newNode = new SkipListNode3<T>(value, nodeLevel);

    for (let i = 0; i <= nodeLevel; i++) {
      const updateNode = update[i]!;
      if (updateNode) {
        newNode.next[i] = updateNode.next[i]!;
        updateNode.next[i] = newNode;
      }
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
        const updateNode = update[i]!;
        if (updateNode && updateNode.next[i] !== current) {
          break;
        }
        if (updateNode) {
          updateNode.next[i] = current.next[i]!;
        }
      }

      while (this.level > 0 && this.head.next[this.level]! === null) {
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

  findMin(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return this.head.next[0]!.value;
  }

  findMax(): T | undefined {
    if (this.isEmpty) {
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

  rangeQuery(low: T, high: T): T[] {
    const result: T[] = [];
    let current: SkipListNode3<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.next[i] !== null && this.comparator(current.next[i]!.value, low) < 0) {
        current = current.next[i]!;
      }
    }

    const nextNode = current.next[0]!;
    current = nextNode !== null ? nextNode : null;

    while (current !== null && this.comparator(current.value, high) <= 0) {
      if (this.comparator(current.value, low) >= 0) {
        result.push(current.value);
      }
      current = current.next[0]!;
    }

    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head.next[0]!;
    let index = 0;

    while (current !== null) {
      callback(current.value, index);
      const next = current.next[0]!;
      current = next;
      index++;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    let current: SkipListNode3<T> | null | undefined = this.head.next[0];

    while (current !== null && current !== undefined) {
      result.push(current.value);
      const next = current.next[0];
      current = next;
    }

    return result;
  }

  getRank(value: T): number {
    const update = this.createUpdate(value);
    let current = this.head;
    let rank = 0;

    for (let i = this.level; i >= 0; i--) {
      if (update[i]! !== null && update[i]! !== current) {
        const node = update[i]!;
        if (node && node !== current) {
          let count = 0;
          let temp: SkipListNode3<T> | null = this.head.next[0]!;
          while (temp !== null && temp !== node) {
            count++;
            temp = temp.next[0]!;
          }
          rank = Math.max(rank, count);
        }
      }
    }

    current = this.head.next[0]!;
    let index = 0;
    while (current !== null && this.comparator(current.value, value) < 0) {
      index++;
      current = current.next[0]!;
    }

    if (current !== null && this.comparator(current.value, value) === 0) {
      return index;
    }

    return -1;
  }

  getByRank(rank: number): T | undefined {
    if (rank < 0 || rank >= this.sizeCount) {
      return undefined;
    }

    let current: SkipListNode3<T> | null = this.head.next[0]!;
    let index = 0;

    while (current !== null && index < rank) {
      index++;
      current = current.next[0]!;
    }

    return current !== null ? current.value : undefined;
  }

  get size(): number {
    return this.sizeCount;
  }

  get isEmpty(): boolean {
    return this.sizeCount === 0;
  }

  clear(): void {
    this.head = new SkipListNode3<T>(null as unknown as T, this.maxLevel);
    this.level = 0;
    this.sizeCount = 0;
  }

  getTimeComplexity(): string {
    return "Search: O(log n), Insert: O(log n), Delete: O(log n), Space: O(n)";
  }
}
