class DoublyLinkedList3Node<T> {
  prev: DoublyLinkedList3Node<T> | null;
  value: T;
  next: DoublyLinkedList3Node<T> | null;

  constructor(value: T) {
    this.prev = null;
    this.value = value;
    this.next = null;
  }
}

export class DoublyLinkedList3<T> {
  private _head: DoublyLinkedList3Node<T> | null;
  private _tail: DoublyLinkedList3Node<T> | null;
  private _size: number;

  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  append(value: T): void {
    const newNode = new DoublyLinkedList3Node(value);
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

  prepend(value: T): void {
    const newNode = new DoublyLinkedList3Node(value);
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

  remove(value: T): boolean {
    let current = this._head;
    while (current) {
      if (current.value === value) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this._head = current.next;
        }
        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this._tail = current.prev;
        }
        this._size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    let current = this._head;
    let i = 0;
    while (current && i < index) {
      current = current.next;
      i++;
    }
    if (current) {
      if (current.prev) {
        current.prev.next = current.next;
      } else {
        this._head = current.next;
      }
      if (current.next) {
        current.next.prev = current.prev;
      } else {
        this._tail = current.prev;
      }
      this._size--;
      return current.value;
    }
    return undefined;
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      return;
    }
    if (index === 0) {
      this.prepend(value);
    } else if (index === this._size) {
      this.append(value);
    } else {
      const newNode = new DoublyLinkedList3Node(value);
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

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    let current = this._head;
    let i = 0;
    while (current && i < index) {
      current = current.next;
      i++;
    }
    return current?.value;
  }

  set(index: number, value: T): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    let current = this._head;
    let i = 0;
    while (current && i < index) {
      current = current.next;
      i++;
    }
    if (current) {
      const oldValue = current.value;
      current.value = value;
      return oldValue;
    }
    return undefined;
  }

  indexOf(value: T): number {
    let current = this._head;
    let i = 0;
    while (current) {
      if (current.value === value) {
        return i;
      }
      current = current.next;
      i++;
    }
    return -1;
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  head(): T | undefined {
    return this._head?.value;
  }

  tail(): T | undefined {
    return this._tail?.value;
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

  forEachReverse(callback: (value: T, index: number) => void): void {
    let current = this._tail;
    let i = this._size - 1;
    while (current) {
      callback(current.value, i);
      current = current.prev;
      i--;
    }
  }

  map<U>(fn: (value: T, index: number) => U): DoublyLinkedList3<U> {
    const result = new DoublyLinkedList3<U>();
    let current = this._head;
    let i = 0;
    while (current) {
      result.append(fn(current.value, i));
      current = current.next;
      i++;
    }
    return result;
  }

  filter(fn: (value: T, index: number) => boolean): DoublyLinkedList3<T> {
    const result = new DoublyLinkedList3<T>();
    let current = this._head;
    let i = 0;
    while (current) {
      if (fn(current.value, i)) {
        result.append(current.value);
      }
      current = current.next;
      i++;
    }
    return result;
  }

  find(fn: (value: T, index: number) => boolean): T | undefined {
    let current = this._head;
    let i = 0;
    while (current) {
      if (fn(current.value, i)) {
        return current.value;
      }
      current = current.next;
      i++;
    }
    return undefined;
  }

  every(fn: (value: T, index: number) => boolean): boolean {
    let current = this._head;
    let i = 0;
    while (current) {
      if (!fn(current.value, i)) {
        return false;
      }
      current = current.next;
      i++;
    }
    return true;
  }

  some(fn: (value: T, index: number) => boolean): boolean {
    let current = this._head;
    let i = 0;
    while (current) {
      if (fn(current.value, i)) {
        return true;
      }
      current = current.next;
      i++;
    }
    return false;
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
    return `${DoublyLinkedList3}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'DoublyLinkedList3', size: this.size, items: this.toArray() }
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

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }


  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }
}
