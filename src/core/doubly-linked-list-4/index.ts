class DoublyLinkedList4Node<T> {
  prev: DoublyLinkedList4Node<T> | null;
  value: T;
  next: DoublyLinkedList4Node<T> | null;

  constructor(value: T) {
    this.prev = null;
    this.value = value;
    this.next = null;
  }
}

export class DoublyLinkedList4<T> {
  private _head: DoublyLinkedList4Node<T> | null;
  private _tail: DoublyLinkedList4Node<T> | null;
  private _size: number;

  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  push(value: T): void {
    const newNode = new DoublyLinkedList4Node(value);
    if (this.isEmpty()) {
      this._head = newNode;
      this._tail = newNode;
    } else {
      if (this._tail) {
        this._tail.next = newNode;
        newNode.prev = this._tail;
        this._tail = newNode;
      }
    }
    this._size++;
  }

  pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const value = this._tail?.value;
    if (this._size === 1) {
      this._head = null;
      this._tail = null;
    } else {
      if (this._tail) {
        this._tail = this._tail.prev;
        if (this._tail) {
          this._tail.next = null;
        }
      }
    }
    this._size--;
    return value;
  }

  shift(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const value = this._head?.value;
    if (this._size === 1) {
      this._head = null;
      this._tail = null;
    } else {
      if (this._head) {
        this._head = this._head.next;
        if (this._head) {
          this._head.prev = null;
        }
      }
    }
    this._size--;
    return value;
  }

  unshift(value: T): void {
    const newNode = new DoublyLinkedList4Node(value);
    if (this.isEmpty()) {
      this._head = newNode;
      this._tail = newNode;
    } else {
      if (this._head) {
        newNode.next = this._head;
        this._head.prev = newNode;
        this._head = newNode;
      }
    }
    this._size++;
  }

  peek(): T | undefined {
    return this._head?.value;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  getTimeComplexity(method: string): string {
    const complexities: Record<string, string> = {
      push: 'O(1)',
      pop: 'O(1)',
      shift: 'O(1)',
      unshift: 'O(1)',
      peek: 'O(1)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(1)',
      forEach: 'O(n)',
      filter: 'O(n)',
      map: 'O(n)',
      reduce: 'O(n)',
      toArray: 'O(n)',
      findLast: 'O(n)',
      findLastIndex: 'O(n)',
      reverse: 'O(n)',
      insertAt: 'O(n)',
      removeAt: 'O(n)',
      concat: 'O(n + m)'
    };
    return complexities[method] || 'Unknown';
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this._head;
    let i = 0;
    while (current) {
      callback(current.value, i);
      current = current.next;
      i++;
    }
  }

  filter(fn: (value: T, index: number) => boolean): DoublyLinkedList4<T> {
    const result = new DoublyLinkedList4<T>();
    let current = this._head;
    let i = 0;
    while (current) {
      if (fn(current.value, i)) {
        result.push(current.value);
      }
      current = current.next;
      i++;
    }
    return result;
  }

  map<U>(fn: (value: T, index: number) => U): DoublyLinkedList4<U> {
    const result = new DoublyLinkedList4<U>();
    let current = this._head;
    let i = 0;
    while (current) {
      result.push(fn(current.value, i));
      current = current.next;
      i++;
    }
    return result;
  }

  reduce<U>(fn: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue;
    let current = this._head;
    let i = 0;
    while (current) {
      acc = fn(acc, current.value, i);
      current = current.next;
      i++;
    }
    return acc;
  }

  findLast(fn: (value: T, index: number) => boolean): T | undefined {
    let current = this._tail;
    let i = this._size - 1;
    while (current) {
      if (fn(current.value, i)) {
        return current.value;
      }
      current = current.prev;
      i--;
    }
    return undefined;
  }

  findLastIndex(fn: (value: T, index: number) => boolean): number {
    let current = this._tail;
    let i = this._size - 1;
    while (current) {
      if (fn(current.value, i)) {
        return i;
      }
      current = current.prev;
      i--;
    }
    return -1;
  }

  reverse(): void {
    let current = this._head;
    while (current) {
      const temp = current.prev;
      current.prev = current.next;
      current.next = temp;
      current = current.prev;
    }
    const temp = this._head;
    this._head = this._tail;
    this._tail = temp;
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      return;
    }
    if (index === 0) {
      this.unshift(value);
    } else if (index === this._size) {
      this.push(value);
    } else {
      const newNode = new DoublyLinkedList4Node(value);
      let current = this._head;
      let i = 0;
      while (current && i < index) {
        current = current.next;
        i++;
      }
      if (current && current.prev) {
        current.prev.next = newNode;
        newNode.prev = current.prev;
        newNode.next = current;
        current.prev = newNode;
        this._size++;
      }
    }
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    if (index === 0) {
      return this.shift();
    }
    if (index === this._size - 1) {
      return this.pop();
    }
    let current = this._head;
    let i = 0;
    while (current && i < index) {
      current = current.next;
      i++;
    }
    if (current && current.prev && current.next) {
      current.prev.next = current.next;
      current.next.prev = current.prev;
      this._size--;
      return current.value;
    }
    return undefined;
  }

  concat(other: DoublyLinkedList4<T>): DoublyLinkedList4<T> {
    const result = new DoublyLinkedList4<T>();
    let current = this._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    current = other._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
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

  toString(): string {
    return `${DoublyLinkedList4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'DoublyLinkedList4', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }
}
