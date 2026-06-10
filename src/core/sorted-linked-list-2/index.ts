class Node<T> {
  value: T;
  next: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class SortedLinkedList2<T> {
  private head: Node<T> | null;
  private comparator: (a: T, b: T) => number;
  private count: number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.head = null;
    this.comparator = comparator ?? ((a: T, b: T) => Number(a) - Number(b));
    this.count = 0;
  }

  insert(item: T): void {
    const newNode = new Node(item);

    if (this.head === null) {
      this.head = newNode;
    } else if (this.comparator(item, this.head!.value) <= 0) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      let current = this.head;
      while (current!.next !== null && this.comparator(item, current!.next!.value) > 0) {
        current = current!.next;
      }
      newNode.next = current!.next;
      current!.next = newNode;
    }
    this.count++;
  }

  has(item: T): boolean {
    let current = this.head;
    while (current !== null) {
      const cmp = this.comparator(item, current!.value);
      if (cmp === 0) {
        return true;
      } else if (cmp < 0) {
        return false;
      }
      current = current!.next;
    }
    return false;
  }

  delete(item: T): boolean {
    if (this.head === null) {
      return false;
    }

    if (this.comparator(item, this.head!.value) === 0) {
      this.head = this.head!.next;
      this.count--;
      return true;
    }

    let current = this.head;
    while (current!.next !== null) {
      if (this.comparator(item, current!.next!.value) === 0) {
        current!.next = current!.next!.next;
        this.count--;
        return true;
      } else if (this.comparator(item, current!.next!.value) < 0) {
        return false;
      }
      current = current!.next;
    }
    return false;
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.head = null;
    this.count = 0;
  }

  min(): T | undefined {
    if (this.head === null) {
      return undefined;
    }
    return this.head!.value;
  }

  max(): T | undefined {
    if (this.head === null) {
      return undefined;
    }
    let current = this.head;
    while (current!.next !== null) {
      current = current!.next;
    }
    return current!.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current!.value);
      current = current!.next;
    }
    return result;
  }

  forEach(callback: (item: T, index: number) => void): void {
    let current = this.head;
    let index = 0;
    while (current !== null) {
      callback(current!.value, index);
      current = current!.next;
      index++;
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

  isEmpty(): boolean {
    return this.size() === 0
  }

  toString(): string {
    return `SortedLinkedList2()`
  }

  toJSON() {
    return { type: 'SortedLinkedList2', items: this.toArray() }
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


  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
