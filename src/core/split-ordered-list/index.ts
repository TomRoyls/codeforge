import type { SplitOrderedListOptions } from "./types.js";

class Node<T> {
  key: number;
  value: T;
  reversedHash: number;
  next: Node<T> | null;

  constructor(key: number, value: T) {
    this.key = key;
    this.value = value;
    this.reversedHash = this.reverseHash(key);
    this.next = null;
  }

  reverseHash(hash: number): number {
    let reversed = 0;
    let n = hash;
    while (n > 0) {
      reversed = (reversed << 1) | (n & 1);
      n >>= 1;
    }
    return reversed;
  }
}

export class SplitOrderedList<T> {
  private head: Node<T> | null = null;
  private _size = 0;

  constructor(_options: SplitOrderedListOptions = {}) {}

  insert(key: number, value: T): boolean {
    const newNode = new Node(key, value);
    if (this.head === null) {
      this.head = newNode;
      this._size++;
      return true;
    }

    if (this.head.key === key) {
      this.head.value = value;
      return false;
    }

    if (this.head.reversedHash > newNode.reversedHash) {
      newNode.next = this.head;
      this.head = newNode;
      this._size++;
      return true;
    }

    let current = this.head;
    while (current.next !== null && current.next.reversedHash < newNode.reversedHash) {
      current = current.next;
    }

    if (current.next !== null && current.next.key === key) {
      current.next.value = value;
      return false;
    }

    newNode.next = current.next;
    current.next = newNode;
    this._size++;
    return true;
  }

  delete(key: number): boolean {
    if (this.head === null) {
      return false;
    }

    if (this.head.key === key) {
      this.head = this.head.next;
      this._size--;
      return true;
    }

    let current = this.head;
    while (current.next !== null && current.next.key !== key) {
      current = current.next;
    }

    if (current.next === null) {
      return false;
    }

    current.next = current.next.next;
    this._size--;
    return true;
  }

  has(key: number): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.key === key) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  get(key: number): T | null {
    let current = this.head;
    while (current !== null) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }
    return null;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.head = null;
    this._size = 0;
  }

  toArray(): Array<[number, T]> {
    const result: Array<[number, T]> = [];
    let current = this.head;
    while (current !== null) {
      result.push([current.key, current.value]);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, key: number) => void): void {
    let current = this.head;
    while (current !== null) {
      callback(current.value, current.key);
      current = current.next;
    }
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
}

export type { SplitOrderedListOptions };
