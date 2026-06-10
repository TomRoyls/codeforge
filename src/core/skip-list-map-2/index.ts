class Node<K, V> {
  key: K;
  value: V;
  forward: (Node<K, V> | null)[];

  constructor(key: K, value: V, level: number) {
    this.key = key;
    this.value = value;
    this.forward = new Array(level + 1).fill(null);
  }
}

interface SkipListOptions<K> {
  maxLevel?: number;
  probability?: number;
  comparator?: (a: K, b: K) => number;
}

export class SkipListMap2<K, V> {
  private maxLevel: number;
  private probability: number;
  private head: Node<K, V>;
  private level: number;
  private _size: number;
  private comparator: (a: K, b: K) => number;

  constructor(optionsOrComparator?: SkipListOptions<K> | ((a: K, b: K) => number), maxLevel = 16, probability = 0.5) {
    if (typeof optionsOrComparator === 'function') {
      this.maxLevel = maxLevel;
      this.probability = probability;
      this.comparator = optionsOrComparator;
    } else if (optionsOrComparator && typeof optionsOrComparator === 'object') {
      this.maxLevel = optionsOrComparator.maxLevel ?? 16;
      this.probability = optionsOrComparator.probability ?? 0.5;
      this.comparator = optionsOrComparator.comparator ?? ((a: K, b: K) => {
        const numA = a as unknown as number;
        const numB = b as unknown as number;
        return numA < numB ? -1 : numA > numB ? 1 : 0;
      });
    } else {
      this.maxLevel = maxLevel;
      this.probability = probability;
      this.comparator = (a: K, b: K) => {
        const numA = a as unknown as number;
        const numB = b as unknown as number;
        return numA < numB ? -1 : numA > numB ? 1 : 0;
      };
    }
    this.head = new Node<K, V>(null as unknown as K, null as unknown as V, this.maxLevel);
    this.level = 0;
    this._size = 0;
  }

  private randomLevel(): number {
    let lvl = 0;
    while (Math.random() < this.probability && lvl < this.maxLevel) {
      lvl++;
    }
    return lvl;
  }

  set(key: K, value: V): void {
    const update = new Array(this.maxLevel + 1).fill(null) as Node<K, V>[];
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    const next = current.forward[0] ?? null;

    if (next !== null && this.comparator(next.key, key) === 0) {
      next.value = value;
    } else {
      const lvl = this.randomLevel();
      if (lvl > this.level) {
        for (let i = this.level + 1; i <= lvl; i++) {
          update[i] = this.head;
        }
        this.level = lvl;
      }

      const newNode = new Node<K, V>(key, value, lvl);
      for (let i = 0; i <= lvl; i++) {
        newNode.forward[i] = update[i]!.forward[i] ?? null;
        update[i]!.forward[i] = newNode;
      }
      this._size++;
    }
  }

  private findNode(key: K): Node<K, V> | null {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!;
      }
    }
    const node = current.forward[0] ?? null;
    if (node !== null && this.comparator(node.key, key) === 0) {
      return node;
    }
    return null;
  }

  get(key: K): V | undefined {
    const node = this.findNode(key);
    return node !== null ? node.value : undefined;
  }

  has(key: K): boolean {
    return this.findNode(key) !== null;
  }

  delete(key: K): boolean {
    const update = new Array(this.maxLevel + 1).fill(null) as Node<K, V>[];
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    const target = current.forward[0] ?? null;

    if (target !== null && this.comparator(target.key, key) === 0) {
      for (let i = 0; i <= this.level; i++) {
        if (update[i]!.forward[i] !== target) {
          break;
        }
        update[i]!.forward[i] = target.forward[i] ?? null;
      }

      while (this.level > 0 && this.head.forward[this.level] === null) {
        this.level--;
      }

      this._size--;
      return true;
    }

    return false;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.head = new Node<K, V>(null as unknown as K, null as unknown as V, this.maxLevel);
    this.level = 0;
    this._size = 0;
  }

  min(): K | undefined {
    const node = this.head.forward[0] ?? null;
    return node != null ? node.key : undefined;
  }

  max(): K | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null) {
        current = current.forward[i]!;
      }
    }
    if (current !== this.head) {
      return current.key;
    }
    return undefined;
  }

  minEntry(): [K, V] | undefined {
    const node = this.head.forward[0] ?? null;
    return node != null ? [node.key, node.value] : undefined;
  }

  maxEntry(): [K, V] | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null) {
        current = current.forward[i]!;
      }
    }
    if (current !== this.head) {
      return [current.key, current.value];
    }
    return undefined;
  }

  floor(key: K): K | undefined {
    const entry = this.floorEntry(key);
    return entry !== undefined ? entry[0] : undefined;
  }

  ceiling(key: K): K | undefined {
    const entry = this.ceilingEntry(key);
    return entry !== undefined ? entry[0] : undefined;
  }

  lower(key: K): K | undefined {
    const entry = this.lowerEntry(key);
    return entry !== undefined ? entry[0] : undefined;
  }

  higher(key: K): K | undefined {
    const entry = this.higherEntry(key);
    return entry !== undefined ? entry[0] : undefined;
  }

  floorEntry(key: K): [K, V] | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) <= 0) {
        current = current.forward[i]!;
      }
    }
    if (current !== this.head) {
      return [current.key, current.value];
    }
    return undefined;
  }

  ceilingEntry(key: K): [K, V] | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!;
      }
    }
    const node = current.forward[0] ?? null;
    return node !== null ? [node.key, node.value] : undefined;
  }

  lowerEntry(key: K): [K, V] | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!;
      }
    }
    if (current !== this.head) {
      return [current.key, current.value];
    }
    return undefined;
  }

  higherEntry(key: K): [K, V] | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) <= 0) {
        current = current.forward[i]!;
      }
    }
    const node = current.forward[0] ?? null;
    return node !== null ? [node.key, node.value] : undefined;
  }

  *range(min: K, max: K): IterableIterator<[K, V]> {
    if (this.comparator(min, max) > 0) return;

    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, min) < 0) {
        current = current.forward[i]!;
      }
    }

    let node = current.forward[0] ?? null;
    while (node !== null && this.comparator(node.key, max) <= 0) {
      yield [node.key, node.value];
      node = node.forward[0] ?? null;
    }
  }

  *rangeEntries(min: K, max: K): IterableIterator<[K, V]> {
    yield* this.range(min, max);
  }

  *keys(): IterableIterator<K> {
    let node = this.head.forward[0] ?? null;
    while (node !== null) {
      yield node.key;
      node = node.forward[0] ?? null;
    }
  }

  *values(): IterableIterator<V> {
    let node = this.head.forward[0] ?? null;
    while (node !== null) {
      yield node.value;
      node = node.forward[0] ?? null;
    }
  }

  *entries(): IterableIterator<[K, V]> {
    let node = this.head.forward[0] ?? null;
    while (node !== null) {
      yield [node.key, node.value];
      node = node.forward[0] ?? null;
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  toArray(): [K, V][] {
    const result: [K, V][] = [];
    let node = this.head.forward[0] ?? null;
    while (node !== null) {
      result.push([node.key, node.value]);
      node = node.forward[0] ?? null;
    }
    return result;
  }

  forEach(callback: (value: V, key: K, map: this) => void): void {
    let node = this.head.forward[0] ?? null;
    while (node !== null) {
      callback(node.value, node.key, this);
      node = node.forward[0] ?? null;
    }
  }

  indexOf(key: K): number {
    let index = 0;
    let node: Node<K, V> | null = this.head.forward[0] ?? null;
    while (node !== null) {
      if (this.comparator(node.key, key) === 0) {
        return index;
      }
      index++;
      node = node.forward[0] ?? null;
    }
    return -1;
  }

  at(index: number): [K, V] | undefined {
    if (index < 0) return undefined;
    let i = 0;
    let node: Node<K, V> | null = this.head.forward[0] ?? null;
    while (node !== null) {
      if (i === index) {
        return [node.key, node.value];
      }
      i++;
      node = node.forward[0] ?? null;
    }
    return undefined;
  }

  toString(): string {
    return `SkipListMap2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SkipListMap2', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'SkipListMap2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
