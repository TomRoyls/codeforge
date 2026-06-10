import type { SortedLinkedListOptions } from './types.js';

class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class SortedLinkedList<T> {
  private head: Node<T> | null = null;
  private comparator: (a: T, b: T) => number;
  private _size: number = 0;

  constructor(options?: SortedLinkedListOptions<T>) {
    this.comparator = options?.comparator ?? ((a: T, b: T) => {
      if (a === b) return 0;
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      return String(a).localeCompare(String(b));
    });
  }

  insert(value: T): void {
    const newNode = new Node(value);

    if (this.head === null) {
      this.head = newNode;
      this._size++;
      return;
    }

    if (this.comparator(value, this.head.value) <= 0) {
      newNode.next = this.head;
      this.head = newNode;
      this._size++;
      return;
    }

    let current = this.head;
    while (current.next !== null && this.comparator(value, current.next.value) > 0) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
    this._size++;
  }

  delete(value: T): boolean {
    if (this.head === null) return false;

    if (this.comparator(value, this.head.value) === 0) {
      this.head = this.head.next;
      this._size--;
      return true;
    }

    let current = this.head;
    while (current.next !== null) {
      if (this.comparator(value, current.next.value) === 0) {
        current.next = current.next.next;
        this._size--;
        return true;
      }
      if (this.comparator(value, current.next.value) < 0) break;
      current = current.next;
    }

    return false;
  }

  has(value: T): boolean {
    let current = this.head;
    while (current !== null) {
      if (this.comparator(value, current.value) === 0) return true;
      if (this.comparator(value, current.value) < 0) break;
      current = current.next;
    }
    return false;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;

    let current = this.head;
    let i = 0;
    while (current !== null && i < index) {
      current = current.next;
      i++;
    }
    return current!.value;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.head = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head;
    let index = 0;
    while (current !== null) {
      callback(current.value, index);
      current = current.next;
      index++;
    }
  }

  min(): T | undefined {
    return this.head?.value;
  }

  max(): T | undefined {
    let current = this.head;
    if (current === null) return undefined;

    while (current.next !== null) {
      current = current.next;
    }
    return current.value;
  }

  indexOf(value: T): number {
    let current = this.head;
    let index = 0;
    while (current !== null) {
      if (this.comparator(value, current.value) === 0) return index;
      if (this.comparator(value, current.value) < 0) break;
      current = current.next;
      index++;
    }
    return -1;
  }

  range(min?: T, max?: T): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current !== null) {
      const value = current.value;
      const includeMin = min === undefined || this.comparator(value, min) >= 0;
      const includeMax = max === undefined || this.comparator(value, max) <= 0;

      if (includeMin && includeMax) {
        result.push(value);
      }
      if (includeMax && max !== undefined && this.comparator(value, max) > 0) break;
      if (!includeMin && min !== undefined && this.comparator(value, min) < 0) {
        current = current.next;
        continue;
      }

      current = current.next;
    }
    return result;
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  iterator(): Iterator<T> {
    return this[Symbol.iterator]();
  }

  toString(): string {
    return `SortedLinkedList({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SortedLinkedList', size: this.size, items: this.toArray() }
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
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }
}
