export class SkipListMap3<T> {
  private _size: number;
  private maxLevel: number;
  private head: Node<T>;
  private level: number;

  constructor(maxLevel: number = 16) {
    this.maxLevel = maxLevel;
    this._size = 0;
    this.level = 1;
    this.head = new Node(-Infinity, null as T, this.maxLevel);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  private randomLevel(): number {
    let level = 1;
    while (Math.random() < 0.5 && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  private update(key: number): Node<T>[] {
    const update: Node<T>[] = new Array(this.maxLevel).fill(this.head);
    let current: Node<T> | null | undefined = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current!.next[i] && current!.next[i]!.key < key) {
        current = current!.next[i] ?? null;
      }
      update[i] = current!;
    }

    return update;
  }

  set(key: number, value: T): void {
    const update: Node<T>[] = this.update(key);
    let current: Node<T> | null | undefined = update[0]!.next[0];

    if (current && current.key === key) {
      current.value = value;
      return;
    }

    const newNodeLevel = this.randomLevel();
    if (newNodeLevel > this.level) {
      for (let i = this.level; i < newNodeLevel; i++) {
        update[i] = this.head;
      }
      this.level = newNodeLevel;
    }

    const newNode = new Node(key, value, newNodeLevel);
    for (let i = 0; i < newNodeLevel; i++) {
      newNode.next[i] = update[i]!.next[i]!;
      update[i]!.next[i] = newNode;
    }

    this._size++;
  }

  get(key: number): T | undefined {
    let current: Node<T> | null | undefined = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current!.next[i] && current!.next[i]!.key < key) {
        current = current!.next[i] ?? null;
      }
    }

    current = current!.next[0];
    if (current && current.key === key) {
      return current.value;
    }

    return undefined;
  }

  has(key: number): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: number): boolean {
    const update: Node<T>[] = this.update(key);
    let current: Node<T> | null | undefined = update[0]!.next[0];

    if (!current || current.key !== key) {
      return false;
    }

    for (let i = 0; i < this.level; i++) {
      if (update[i]!.next[i] !== current) {
        break;
      }
      update[i]!.next[i] = current!.next[i]!;
    }

    while (this.level > 1 && this.head.next[this.level - 1] === null) {
      this.level--;
    }

    this._size--;
    return true;
  }

  min(): T | undefined {
    const first = this.head.next[0];
    if (first) {
      return first.value;
    }
    return undefined;
  }

  max(): T | undefined {
    let current: Node<T> | null | undefined = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current!.next[i]) {
        current = current!.next[i] ?? null;
      }
    }

    if (current !== this.head) {
      return current!.value;
    }
    return undefined;
  }

  toArray(): [number, T][] {
    const result: [number, T][] = [];
    let current: Node<T> | null | undefined = this.head.next[0];

    while (current) {
      result.push([current.key, current.value]);
      current = current.next[0];
    }

    return result;
  }

  clear(): void {
    this.head = new Node(-Infinity, null as T, this.maxLevel);
    this.level = 1;
    this._size = 0;
  }

  forEach(callback: (value: T, key: number) => void): void {
    let current: Node<T> | null | undefined = this.head.next[0];

    while (current) {
      callback(current.value, current.key);
      current = current.next[0];
    }
  }

  range(min: number, max: number): [number, T][] {
    const result: [number, T][] = [];
    let current: Node<T> | null | undefined = this.head.next[0];

    while (current && current.key <= max) {
      if (current.key >= min) {
        result.push([current.key, current.value]);
      }
      current = current.next[0];
    }

    return result;
  }
}

class Node<T> {
  key: number;
  value: T;
  next: (Node<T> | null | undefined)[];

  constructor(key: number, value: T, level: number) {
    this.key = key;
    this.value = value;
    this.next = new Array(level).fill(null);
  }
}
