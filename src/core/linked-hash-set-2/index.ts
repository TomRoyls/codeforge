type Node<T> = {
  value: T;
  prev: Node<T> | null;
  next: Node<T> | null;
};

export class LinkedHashSet<T> {
  private map: Map<T, Node<T>>;
  private head: Node<T> | null;
  private tail: Node<T> | null;
  private _size: number;

  constructor() {
    this.map = new Map();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  add(value: T): void {
    if (this.map.has(value)) {
      return;
    }

    const newNode: Node<T> = {
      value,
      prev: this.tail,
      next: null
    };

    this.map.set(value, newNode);

    if (this.tail === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this._size++;
  }

  delete(value: T): boolean {
    const node = this.map.get(value);
    if (node === undefined) {
      return false;
    }

    this.map.delete(value);

    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this._size--;
    return true;
  }

  has(value: T): boolean {
    return this.map.has(value);
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  values(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  first(): T | undefined {
    return this.head?.value;
  }

  last(): T | undefined {
    return this.tail?.value;
  }

  forEach(callback: (value: T) => void): void {
    let current = this.head;
    while (current !== null) {
      callback(current.value);
      current = current.next;
    }
  }

  toArray(): T[] {
    return this.values();
  }

  getTimeComplexity(): string {
    return {
      add: 'O(1)',
      delete: 'O(1)',
      has: 'O(1)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(n)',
      values: 'O(n)',
      first: 'O(1)',
      last: 'O(1)',
      forEach: 'O(n)',
      toArray: 'O(n)'
    } as any as string;
  }
}
