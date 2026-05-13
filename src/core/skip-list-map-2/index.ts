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

export class SkipListMap2<K, V> {
  private maxLevel: number;
  private probability: number;
  private head: Node<K, V>;
  private level: number;
  private _size: number;
  private comparator: (a: K, b: K) => number;

  constructor(comparator?: (a: K, b: K) => number, maxLevel = 16, probability = 0.5) {
    this.maxLevel = maxLevel;
    this.probability = probability;
    this.comparator = comparator || ((a: K, b: K) => {
      const numA = a as unknown as number;
      const numB = b as unknown as number;
      return numA < numB ? -1 : numA > numB ? 1 : 0;
    });
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

    current = current.forward[0]!;

    if (current !== null && this.comparator(current.key, key) === 0) {
      current.value = value;
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

  get(key: K): V | undefined {
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!;
      }
    }

    current = current.forward[0]!;

    if (current !== null && this.comparator(current.key, key) === 0) {
      return current.value;
    }
    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
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

    current = current.forward[0]!;

    if (current !== null && this.comparator(current.key, key) === 0) {
      for (let i = 0; i <= this.level; i++) {
        if (update[i]!.forward[i] !== current) {
          break;
        }
        update[i]!.forward[i] = current.forward[i] ?? null;
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

  clear(): void {
    this.head = new Node<K, V>(null as unknown as K, null as unknown as V, this.maxLevel);
    this.level = 0;
    this._size = 0;
  }

  min(): { key: K; value: V } | undefined {
    const node = this.head.forward[0];
    if (node != null) {
      return { key: node.key, value: node.value };
    }
    return undefined;
  }

  max(): { key: K; value: V } | undefined {
    let current = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null) {
        current = current.forward[i]!;
      }
    }
    if (current !== this.head) {
      return { key: current.key, value: current.value };
    }
    return undefined;
  }

  range(min: K, max: K): { key: K; value: V }[] {
    const result: { key: K; value: V }[] = [];
    let current = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && this.comparator(current.forward[i]!.key, min) < 0) {
        current = current.forward[i]!;
      }
    }

    current = current.forward[0]!;

    while (current !== null && this.comparator(current.key, max) <= 0) {
      result.push({ key: current.key, value: current.value });
      current = current.forward[0]!;
    }

    return result;
  }
}
