export class LinkedHashMap<K, V> {
  private buckets: Map<K, [V, Node<K>]>;
  private head: Node<K> | null;
  private tail: Node<K> | null;
  private _size: number;

  constructor(_initialCapacity: number = 16, _loadFactor: number = 0.75) {
    this.buckets = new Map();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  set(key: K, value: V): void {
    const existing = this.buckets.get(key);
    if (existing) {
      existing[0] = value;
      return;
    }

    const newNode = { key, prev: this.tail, next: null };
    if (this.tail) {
      this.tail.next = newNode;
    }
    this.tail = newNode;
    if (!this.head) {
      this.head = newNode;
    }

    this.buckets.set(key, [value, newNode]);
    this._size++;
  }

  get(key: K): V | undefined {
    const entry = this.buckets.get(key);
    return entry ? entry[0] : undefined;
  }

  delete(key: K): boolean {
    const entry = this.buckets.get(key);
    if (!entry) {
      return false;
    }

    const node = entry[1];

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.buckets.delete(key);
    this._size--;
    return true;
  }

  has(key: K): boolean {
    return this.buckets.has(key);
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.buckets.clear();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  keys(): K[] {
    const result: K[] = [];
    let current = this.head;
    while (current) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let current = this.head;
    while (current) {
      const entry = this.buckets.get(current.key)!;
      result.push(entry[0]);
      current = current.next;
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    let current = this.head;
    while (current) {
      const entry = this.buckets.get(current.key)!;
      result.push([current.key, entry[0]]);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: V, key: K) => void): void {
    let current = this.head;
    while (current) {
      const entry = this.buckets.get(current.key)!;
      callback(entry[0], current.key);
      current = current.next;
    }
  }

  getTimeComplexity(): string {
    return "O(1) average case, O(n) worst case";
  }

  first(): [K, V] | undefined {
    if (!this.head) {
      return undefined;
    }
    const entry = this.buckets.get(this.head.key)!;
    return [this.head.key, entry[0]];
  }

  last(): [K, V] | undefined {
    if (!this.tail) {
      return undefined;
    }
    const entry = this.buckets.get(this.tail.key)!;
    return [this.tail.key, entry[0]];
  }

  deleteFirst(): boolean {
    if (!this.head) {
      return false;
    }
    return this.delete(this.head.key);
  }

  deleteLast(): boolean {
    if (!this.tail) {
      return false;
    }
    return this.delete(this.tail.key);
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  toArray(): any[] {
    return [...this]
  }
}

interface Node<K> {
  key: K;
  prev: Node<K> | null;
  next: Node<K> | null;
}
