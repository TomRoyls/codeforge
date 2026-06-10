export class LRUCache3<K, V> {
  private _capacity: number;
  private map: Map<K, Node<K, V>>;
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    this._capacity = capacity;
    this.map = new Map();
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) {
      return undefined;
    }
    this.moveToHead(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    if (this.map.size >= this._capacity) {
      this.evict();
    }

    const newNode = { key, value, prev: null, next: null };
    this.map.set(key, newNode);
    this.addToHead(newNode);
  }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) {
      return false;
    }
    this.removeNode(node);
    this.map.delete(key);
    return true;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  get size(): number {
    return this.map.size;
  }

  get capacity(): number {
    return this._capacity;
  }

  isEmpty(): boolean {
    return this.map.size === 0;
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
  }

  forEach(callback: (value: V, key: K) => void): void {
    let current = this.head;
    while (current) {
      callback(current.value, current.key);
      current = current.next;
    }
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
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    let current = this.head;
    while (current) {
      result.push([current.key, current.value]);
      current = current.next;
    }
    return result;
  }

  peekLeastRecentlyUsed(): [K, V] | undefined {
    if (!this.tail) {
      return undefined;
    }
    return [this.tail.key, this.tail.value];
  }

  peekMostRecentlyUsed(): [K, V] | undefined {
    if (!this.head) {
      return undefined;
    }
    return [this.head.key, this.head.value];
  }

  resize(newCapacity: number): void {
    if (newCapacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    while (this.map.size > newCapacity) {
      this.evict();
    }
    this._capacity = newCapacity;
  }

  private moveToHead(node: Node<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: Node<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: Node<K, V>): void {
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
  }

  private evict(): void {
    if (!this.tail) {
      return;
    }
    this.map.delete(this.tail.key);
    this.removeNode(this.tail);
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

  toString(): string {
    return `LRUCache3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LRUCache3', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'LRUCache3'
  }
}

interface Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null;
  next: Node<K, V> | null;
}
