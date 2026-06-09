import type { UnrolledLinkedListNode } from './types.js';

const DEFAULT_BLOCK_SIZE = 32;

export class UnrolledLinkedList<T> {
  #head: UnrolledLinkedListNode<T> | null;
  #tail: UnrolledLinkedListNode<T> | null;
  #_size: number;
  readonly #blockSize: number;

  constructor(blockSize = DEFAULT_BLOCK_SIZE) {
    this.#head = null;
    this.#tail = null;
    this.#_size = 0;
    this.#blockSize = blockSize;
  }

  get size(): number {
    return this.#_size;
  }

  get isEmpty(): boolean {
    return this.#_size === 0;
  }

  #createNode(): UnrolledLinkedListNode<T> {
    return {
      elements: new Array<T>(this.#blockSize),
      count: 0,
      next: null,
      prev: null
    };
  }

  append(item: T): void {
    if (this.#tail === null) {
      this.#tail = this.#createNode();
      this.#head = this.#tail;
    }

    const node = this.#tail;
    if (node.count < this.#blockSize) {
      node.elements[node.count] = item;
      node.count++;
    } else {
      const newNode = this.#createNode();
      newNode.elements[0] = item;
      newNode.count = 1;
      newNode.prev = node;
      node.next = newNode;
      this.#tail = newNode;
    }

    this.#_size++;
  }

  prepend(item: T): void {
    if (this.#head === null) {
      this.#head = this.#createNode();
      this.#tail = this.#head;
    }

    const node = this.#head;
    if (node.count < this.#blockSize) {
      for (let i = node.count; i > 0; i--) {
        node.elements[i] = node.elements[i - 1]!;
      }
      node.elements[0] = item;
      node.count++;
    } else {
      const newNode = this.#createNode();
      newNode.elements[0] = item;
      newNode.count = 1;
      newNode.next = node;
      node.prev = newNode;
      this.#head = newNode;
    }

    this.#_size++;
  }

  #findNodeAndOffset(index: number): { node: UnrolledLinkedListNode<T>; offset: number } | null {
    let currentIndex = 0;
    let current = this.#head;

    while (current !== null && currentIndex + current.count <= index) {
      currentIndex += current.count;
      current = current.next;
    }

    if (current === null || index < currentIndex) {
      return null;
    }

    return { node: current, offset: index - currentIndex };
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.#_size) {
      return undefined;
    }

    const result = this.#findNodeAndOffset(index);
    if (result === null) {
      return undefined;
    }

    return result.node.elements[result.offset];
  }

  set(index: number, item: T): boolean {
    if (index < 0 || index >= this.#_size) {
      return false;
    }

    const result = this.#findNodeAndOffset(index);
    if (result === null) {
      return false;
    }

    result.node.elements[result.offset] = item;
    return true;
  }

  insert(index: number, item: T): boolean {
    if (index < 0 || index > this.#_size) {
      return false;
    }

    if (index === this.#_size) {
      this.append(item);
      return true;
    }

    if (index === 0) {
      this.prepend(item);
      return true;
    }

    const result = this.#findNodeAndOffset(index);
    if (result === null) {
      return false;
    }

    const { node, offset } = result;

    if (node.count < this.#blockSize) {
      for (let i = node.count; i > offset; i--) {
        node.elements[i] = node.elements[i - 1]!;
      }
      node.elements[offset] = item;
      node.count++;
    } else {
      const newNode = this.#createNode();
      const half = Math.floor(this.#blockSize / 2);

      for (let i = half; i < this.#blockSize; i++) {
        newNode.elements[i - half] = node.elements[i]!;
      }

      newNode.count = this.#blockSize - half;
      node.count = half;

      newNode.next = node.next;
      newNode.prev = node;
      if (node.next !== null) {
        node.next.prev = newNode;
      } else {
        this.#tail = newNode;
      }
      node.next = newNode;

      if (offset < half) {
        for (let i = node.count; i > offset; i--) {
          node.elements[i] = node.elements[i - 1]!;
        }
        node.elements[offset] = item;
        node.count++;
      } else {
        const newOffset = offset - half;
        for (let i = newNode.count; i > newOffset; i--) {
          newNode.elements[i] = newNode.elements[i - 1]!;
        }
        newNode.elements[newOffset] = item;
        newNode.count++;
      }
    }

    this.#_size++;
    return true;
  }

  remove(index: number): T | undefined {
    if (index < 0 || index >= this.#_size) {
      return undefined;
    }

    const result = this.#findNodeAndOffset(index);
    if (result === null) {
      return undefined;
    }

    const { node, offset } = result;
    const removed = node.elements[offset];

    for (let i = offset; i < node.count - 1; i++) {
      node.elements[i] = node.elements[i + 1]!;
    }
    node.elements[node.count - 1] = undefined as T;
    node.count--;

    const mergeThreshold = Math.floor(this.#blockSize / 4);

    if (node.count < mergeThreshold) {
      if (node.prev !== null && node.prev.count + node.count <= this.#blockSize) {
        const prevNode = node.prev;
        for (let i = 0; i < node.count; i++) {
          prevNode.elements[prevNode.count + i] = node.elements[i]!;
        }
        prevNode.count += node.count;
        prevNode.next = node.next;
        if (node.next !== null) {
          node.next.prev = prevNode;
        } else {
          this.#tail = prevNode;
        }
      } else if (node.next !== null && node.count + node.next.count <= this.#blockSize) {
        const nextNode = node.next;
        for (let i = 0; i < nextNode.count; i++) {
          node.elements[node.count + i] = nextNode.elements[i]!;
        }
        node.count += nextNode.count;
        node.next = nextNode.next;
        if (nextNode.next !== null) {
          nextNode.next.prev = node;
        } else {
          this.#tail = node;
        }
      }
    }

    if (node.count === 0) {
      if (node.prev !== null) {
        node.prev.next = node.next;
      } else {
        this.#head = node.next;
      }
      if (node.next !== null) {
        node.next.prev = node.prev;
      } else {
        this.#tail = node.prev;
      }
    }

    this.#_size--;
    return removed;
  }

  indexOf(item: T): number {
    let currentIndex = 0;
    let current = this.#head;

    while (current !== null) {
      for (let i = 0; i < current.count; i++) {
        if (current.elements[i] === item) {
          return currentIndex + i;
        }
      }
      currentIndex += current.count;
      current = current.next;
    }

    return -1;
  }

  contains(item: T): boolean {
    return this.indexOf(item) !== -1;
  }

  clear(): void {
    this.#head = null;
    this.#tail = null;
    this.#_size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.#head;

    while (current !== null) {
      for (let i = 0; i < current.count; i++) {
        result.push(current.elements[i]!);
      }
      current = current.next;
    }

    return result;
  }

  forEach(callback: (item: T, index: number) => void): void {
    let index = 0;
    let current = this.#head;

    while (current !== null) {
      for (let i = 0; i < current.count; i++) {
        callback(current.elements[i]!, index);
        index++;
      }
      current = current.next;
    }
  }

  *[Symbol.iterator](): Generator<T> {
    let current = this.#head;

    while (current !== null) {
      for (let i = 0; i < current.count; i++) {
        yield current.elements[i]!;
      }
      current = current.next;
    }
  }

  has(item: T): boolean {
    return this.contains(item)
  }

}
