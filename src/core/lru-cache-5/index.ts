export class LRUCache5<K, V> {
  private capacity: number;
  private map: Map<K, Node<K, V>>;
  private head: Node<K, V> | null;
  private tail: Node<K, V> | null;
  private _size: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    this.capacity = capacity;
    this.map = new Map();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) {
      return undefined;
    }
    this.moveToFront(node);
    return node.value;
  }

  set(key: K, value: V): void {
    const existingNode = this.map.get(key);
    if (existingNode) {
      existingNode.value = value;
      this.moveToFront(existingNode);
      return;
    }

    const newNode = { key, value, prev: null, next: null };
    this.map.set(key, newNode);

    if (this._size === this.capacity) {
      this.evict();
    }

    this.addToFront(newNode);
    this._size++;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) {
      return false;
    }

    this.removeNode(node);
    this.map.delete(key);
    this._size--;
    return true;
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  get capacityValue(): number {
    return this.capacity;
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

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    let current = this.head;
    while (current) {
      result.push([current.key, current.value]);
      current = current.next;
    }
    return result;
  }

  private moveToFront(node: Node<K, V>): void {
    if (node === this.head) {
      return;
    }

    this.removeNode(node);
    this.addToFront(node);
  }

  private addToFront(node: Node<K, V>): void {
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
    const prev = node.prev;
    const next = node.next;

    if (prev) {
      prev.next = next;
    } else {
      this.head = next;
    }

    if (next) {
      next.prev = prev;
    } else {
      this.tail = prev;
    }
  }

  private evict(): void {
    if (!this.tail) {
      return;
    }

    this.map.delete(this.tail.key);
    this.removeNode(this.tail);
    this._size--;
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
}

interface Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null;
  next: Node<K, V> | null;
}
