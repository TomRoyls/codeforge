class Node<T> {
  value: T;
  forward: (Node<T> | null)[];
  backward: (Node<T> | null)[];

  constructor(value: T, level: number) {
    this.value = value;
    this.forward = new Array(level + 1).fill(null);
    this.backward = new Array(level + 1).fill(null);
  }
}

export class SkipList4<T> {
  private maxLevel: number;
  private level: number;
  private head: Node<T>;
  private tail: Node<T>;
  private compare: (a: T, b: T) => number;
  private _size: number;

  constructor(compare?: (a: T, b: T) => number, maxHeight: number = 32) {
    this.maxLevel = maxHeight;
    this.level = 0;
    this.compare = compare || ((a: T, b: T) => {
      if (a === b) return 0;
      return (a as unknown as number) < (b as unknown as number) ? -1 : 1;
    });
    this.head = new Node<T>(undefined as unknown as T, this.maxLevel);
    this.tail = new Node<T>(undefined as unknown as T, this.maxLevel);
    this._size = 0;

    for (let i = 0; i <= this.maxLevel; i++) {
      this.head.forward[i]! = this.tail;
      this.tail.backward[i]! = this.head;
    }
  }

  private randomLevel(): number {
    let level = 0;
    while (Math.random() < 0.5 && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  insert(value: T): void {
    const update: Node<T>[] = new Array(this.maxLevel + 1).fill(this.head);
    let current: Node<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current && current.forward[i]! !== this.tail) {
        const cmp = this.compare(current.forward[i]!.value, value);
        if (cmp < 0) {
          current = current.forward[i]!;
        } else if (cmp === 0) {
          return;
        } else {
          break;
        }
      }
      update[i] = current!;
    }

    const newNodeLevel = this.randomLevel();
    if (newNodeLevel > this.level) {
      for (let i = this.level + 1; i <= newNodeLevel; i++) {
        update[i] = this.head;
      }
      this.level = newNodeLevel;
    }

    const newNode = new Node<T>(value, newNodeLevel);

    for (let i = 0; i <= newNodeLevel; i++) {
      newNode.forward[i] = update[i]!.forward[i]!;
      newNode.backward[i] = update[i]!;
      if (update[i]!.forward[i]) {
        update[i]!.forward[i]!.backward[i] = newNode;
      }
      update[i]!.forward[i]! = newNode;
    }

    this._size++;
  }

  remove(value: T): boolean {
    const update: Node<T>[] = new Array(this.maxLevel + 1).fill(this.head);
    let current: Node<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current && current.forward[i]! !== this.tail) {
        const cmp = this.compare(current.forward[i]!.value, value);
        if (cmp < 0) {
          current = current.forward[i]!;
        } else if (cmp === 0) {
          break;
        } else {
          break;
        }
      }
      update[i] = current!;
    }

    current = current ? current.forward[0]! : null;

    if (!current || current === this.tail || this.compare(current.value, value) !== 0) {
      return false;
    }

    for (let i = 0; i <= this.level; i++) {
      if (update[i]!.forward[i] !== current) {
        break;
      }
      update[i]!.forward[i] = current.forward[i]!;
      if (current.forward[i]) {
        current.forward[i]!.backward[i] = update[i]!;
      }
    }

    while (this.level > 0 && this.head.forward[this.level] === this.tail) {
      this.level--;
    }

    this._size--;
    return true;
  }

  search(value: T): boolean {
    let current: Node<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current && current.forward[i]! !== this.tail) {
        const cmp = this.compare(current.forward[i]!.value, value);
        if (cmp < 0) {
          current = current.forward[i]!;
        } else if (cmp === 0) {
          return true;
        } else {
          break;
        }
      }
    }

    return false;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  min(): T | undefined {
    const first = this.head.forward[0]!;
    return first !== this.tail ? first!.value : undefined;
  }

  max(): T | undefined {
    const last = this.tail.backward[0]!;
    return last !== this.head ? last!.value : undefined;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.level = 0;
    this._size = 0;

    for (let i = 0; i <= this.maxLevel; i++) {
      this.head.forward[i]! = this.tail;
      this.tail.backward[i]! = this.head;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    let current: Node<T> | null = this.head.forward[0]!;

    while (current && current !== this.tail) {
      result.push(current.value);
      current = current.forward[0]!;
    }

    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current: Node<T> | null = this.head.forward[0]!;
    let index = 0;

    while (current && current !== this.tail) {
      callback(current.value, index++);
      current = current.forward[0]!;
    }
  }

  predecessor(value: T): T | undefined {
    let current: Node<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current && current.forward[i]! !== this.tail) {
        const cmp = this.compare(current.forward[i]!.value, value);
        if (cmp < 0) {
          current = current.forward[i]!;
        } else {
          break;
        }
      }
    }

    if (current !== this.head) {
      return current!.value;
    }

    return undefined;
  }

  successor(value: T): T | undefined {
    let current: Node<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current && current.forward[i]! !== this.tail) {
        const cmp = this.compare(current.forward[i]!.value, value);
        if (cmp <= 0) {
          current = current.forward[i]!;
        } else {
          break;
        }
      }
    }

    if (current && current.forward[0]! !== this.tail) {
      return current.forward[0]!.value;
    }

    return undefined;
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = [];
    let current: Node<T> | null = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current && current.forward[i]! !== this.tail) {
        const cmp = this.compare(current.forward[i]!.value, low);
        if (cmp < 0) {
          current = current.forward[i]!;
        } else {
          break;
        }
      }
    }

    current = current ? current.forward[0]! : null;

    while (current && current !== this.tail) {
      if (this.compare(current.value, high) > 0) {
        break;
      }
      result.push(current.value);
      current = current.forward[0]!;
    }

    return result;
  }

  height(): number {
    return this.level;
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
    return `SkipList4({ size: ${this.size} })`
  }
}
