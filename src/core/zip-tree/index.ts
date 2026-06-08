import type { ZipTreeOptions } from './types.js';

export type { ZipTreeOptions } from './types.js';

type ZipNode<K, V> = {
  key: K;
  value: V;
  rank: number;
  left: ZipNode<K, V> | null;
  right: ZipNode<K, V> | null;
};

export class ZipTree<K, V> {
  private root: ZipNode<K, V> | null = null;
  private _size: number = 0;
  private compare: (a: K, b: K) => number;

  constructor(options?: ZipTreeOptions<K, V>) {
    this.compare =
      options?.comparator ??
      ((a: K, b: K) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
  }

  private generateRank(): number {
    return Math.floor(Math.random() * 2147483647);
  }

  private zip(
    left: ZipNode<K, V> | null,
    right: ZipNode<K, V> | null
  ): ZipNode<K, V> | null {
    if (left === null) return right;
    if (right === null) return left;
    if (left.rank >= right.rank) {
      const newRight = this.zip(left.right, right);
      return { ...left, right: newRight };
    }
    const newLeft = this.zip(left, right.left);
    return { ...right, left: newLeft };
  }

  private unzip(
    node: ZipNode<K, V> | null,
    key: K
  ): [ZipNode<K, V> | null, ZipNode<K, V> | null] {
    if (node === null) return [null, null];
    const cmp = this.compare(key, node.key);
    if (cmp <= 0) {
      const [left, right] = this.unzip(node.left, key);
      return [left, { ...node, left: right }];
    }
    const [left, right] = this.unzip(node.right, key);
    return [{ ...node, right: left }, right];
  }

  private removeMin(node: ZipNode<K, V>): ZipNode<K, V> | null {
    if (node.left === null) return node.right;
    return { ...node, left: this.removeMin(node.left) };
  }

  private updateMinValue(
    node: ZipNode<K, V>,
    value: V
  ): ZipNode<K, V> {
    if (node.left === null) return { ...node, value };
    return { ...node, left: this.updateMinValue(node.left, value) };
  }

  insert(key: K, value: V): void {
    const [left, right] = this.unzip(this.root, key);
    let newRight: ZipNode<K, V> | null;

    if (right !== null && this.compare(key, this.findMin(right).key) === 0) {
      newRight = this.updateMinValue(right, value);
    } else {
      const newNode: ZipNode<K, V> = {
        key,
        value,
        rank: this.generateRank(),
        left: null,
        right: null,
      };
      newRight = this.zip(newNode, right);
      this._size++;
    }

    this.root = this.zip(left, newRight);
  }

  delete(key: K): boolean {
    const [left, right] = this.unzip(this.root, key);
    if (right === null) {
      this.root = left;
      return false;
    }

    if (this.compare(key, this.findMin(right).key) !== 0) {
      this.root = this.zip(left, right);
      return false;
    }

    this.root = this.zip(left, this.removeMin(right));
    this._size--;
    return true;
  }

  get(key: K): V | undefined {
    const node = this.findNode(this.root, key);
    return node?.value;
  }

  has(key: K): boolean {
    return this.findNode(this.root, key) !== null;
  }

  private findNode(node: ZipNode<K, V> | null, key: K): ZipNode<K, V> | null {
    let current = node;
    while (current !== null) {
      const cmp = this.compare(key, current.key);
      if (cmp === 0) return current;
      current = cmp < 0 ? current.left : current.right;
    }
    return null;
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): [K, V][] {
    const result: [K, V][] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(
    node: ZipNode<K, V> | null,
    result: [K, V][]
  ): void {
    if (node === null) return;
    this.inOrder(node.left, result);
    result.push([node.key, node.value]);
    this.inOrder(node.right, result);
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.inOrderForEach(this.root, callback);
  }

  private inOrderForEach(
    node: ZipNode<K, V> | null,
    callback: (value: V, key: K) => void
  ): void {
    if (node === null) return;
    this.inOrderForEach(node.left, callback);
    callback(node.value, node.key);
    this.inOrderForEach(node.right, callback);
  }

  min(): K | undefined {
    if (this.root === null) return undefined;
    return this.findMin(this.root)!.key;
  }

  private findMin(node: ZipNode<K, V>): ZipNode<K, V> {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  max(): K | undefined {
    if (this.root === null) return undefined;
    let current = this.root;
    while (current.right !== null) {
      current = current.right;
    }
    return current.key;
  }

  floor(key: K): K | undefined {
    let result: K | undefined = undefined;
    let current = this.root;
    while (current !== null) {
      const cmp = this.compare(key, current.key);
      if (cmp === 0) return current.key;
      if (cmp > 0) {
        result = current.key;
        current = current.right;
      } else {
        current = current.left;
      }
    }
    return result;
  }

  ceiling(key: K): K | undefined {
    let result: K | undefined = undefined;
    let current = this.root;
    while (current !== null) {
      const cmp = this.compare(key, current.key);
      if (cmp === 0) return current.key;
      if (cmp < 0) {
        result = current.key;
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return result;
  }

  *[Symbol.iterator](): Generator<[K, V]> {
    yield* this.inOrderGenerator(this.root);
  }

  private *inOrderGenerator(
    node: ZipNode<K, V> | null
  ): Generator<[K, V]> {
    if (node === null) return;
    yield* this.inOrderGenerator(node.left);
    yield [node.key, node.value];
    yield* this.inOrderGenerator(node.right);
  }

  *keys(): Generator<K> {
    for (const [key] of this) {
      yield key;
    }
  }

  *values(): Generator<V> {
    for (const [, value] of this) {
      yield value;
    }
  }

  *entries(): Generator<[K, V]> {
    yield* this[Symbol.iterator]();
  }

  *range(min?: K, max?: K): Generator<[K, V]> {
    if (this.root === null) return;
    yield* this.rangeInOrder(this.root, min, max);
  }

  private *rangeInOrder(
    node: ZipNode<K, V> | null,
    min: K | undefined,
    max: K | undefined
  ): Generator<[K, V]> {
    if (node === null) return;

    if (min === undefined || this.compare(node.key, min) >= 0) {
      yield* this.rangeInOrder(node.left, min, max);
    }

    if (
      (min === undefined || this.compare(node.key, min) >= 0) &&
      (max === undefined || this.compare(node.key, max) <= 0)
    ) {
      yield [node.key, node.value];
    }

    if (max === undefined || this.compare(node.key, max) <= 0) {
      yield* this.rangeInOrder(node.right, min, max);
    }
  }

  iterator(): Generator<[K, V]> {
    return this.entries();
  }
}
