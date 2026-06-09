export class LRUCache4<K, V> {
  private _capacity: number;
  private _ttl: number | null;
  private map: Map<K, Node<K, V>>;
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number, ttl?: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    this._capacity = capacity;
    this._ttl = ttl !== undefined ? ttl : null;
    this.map = new Map();
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) {
      return undefined;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      return undefined;
    }
    node.timestamp = Date.now();
    this.moveToHead(node);
    return node.value;
  }

  set(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.timestamp = Date.now();
      this.moveToHead(existing);
      return;
    }

    if (this.map.size >= this._capacity) {
      this.evict();
    }

    const newNode = { key, value, prev: null, next: null, timestamp: Date.now() };
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
    const node = this.map.get(key);
    if (!node) {
      return false;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      return false;
    }
    return true;
  }

  peek(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) {
      return undefined;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      return undefined;
    }
    return node.value;
  }

  keys(): K[] {
    this.cleanupExpired();
    const result: K[] = [];
    let current = this.head;
    while (current) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }

  values(): V[] {
    this.cleanupExpired();
    const result: V[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  entries(): [K, V][] {
    this.cleanupExpired();
    const result: [K, V][] = [];
    let current = this.head;
    while (current) {
      result.push([current.key, current.value]);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.cleanupExpired();
    let current = this.head;
    while (current) {
      callback(current.value, current.key);
      current = current.next;
    }
  }

  get size(): number {
    this.cleanupExpired();
    return this.map.size;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  get capacity(): number {
    return this._capacity;
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
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

  getTimeComplexity(operation: string): string {
    const complexities: Record<string, string> = {
      get: 'O(1) average',
      set: 'O(1) average',
      delete: 'O(1)',
      has: 'O(1)',
      peek: 'O(1)',
      keys: 'O(n)',
      values: 'O(n)',
      entries: 'O(n)',
      forEach: 'O(n)',
      size: 'O(n)',
      clear: 'O(1)',
      resize: 'O(k) where k = size - newCapacity'
    };
    return complexities[operation] || 'Unknown operation';
  }

  private isExpired(node: Node<K, V>): boolean {
    if (this._ttl === null) {
      return false;
    }
    return Date.now() - node.timestamp > this._ttl;
  }

  private cleanupExpired(): void {
    if (this._ttl === null) {
      return;
    }
    const now = Date.now();
    const keysToDelete: K[] = [];
    let current = this.tail;
    while (current) {
      if (now - current.timestamp > this._ttl) {
        keysToDelete.push(current.key);
        current = current.prev;
      } else {
        break;
      }
    }
    for (const key of keysToDelete) {
      this.delete(key);
    }
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
    return `LRUCache4({ size: ${this.size} })`
  }
}

interface Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null;
  next: Node<K, V> | null;
  timestamp: number;
}
