import type { HashFunction, HAMTOptions } from "./types.js";

const BITS_PER_LEVEL = 5;
const MASK = (1 << BITS_PER_LEVEL) - 1;
const MAX_SHIFT = 32;

function fnv1aHash(key: unknown): number {
  const str = String(key);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function popcount(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}

type Node<K, V> =
  | { tag: "empty" }
  | { tag: "leaf"; hash: number; key: K; value: V }
  | { tag: "collision"; hash: number; entries: Array<[K, V]> }
  | { tag: "internal"; bitmap: number; children: Array<Node<K, V>> };

function empty<K, V>(): Node<K, V> {
  return { tag: "empty" };
}

function leaf<K, V>(hash: number, key: K, value: V): Node<K, V> {
  return { tag: "leaf", hash, key, value };
}

function collision<K, V>(hash: number, entries: Array<[K, V]>): Node<K, V> {
  return { tag: "collision", hash, entries };
}

function internal<K, V>(bitmap: number, children: Array<Node<K, V>>): Node<K, V> {
  return { tag: "internal", bitmap, children };
}

function keyEqual<K>(a: K, b: K): boolean {
  return Object.is(a, b);
}

function lookup<K, V>(node: Node<K, V>, key: K, hash: number, shift: number): V | undefined {
  switch (node.tag) {
    case "empty":
      return undefined;
    case "leaf":
      return keyEqual(node.key, key) ? node.value : undefined;
    case "collision":
      for (const [k, v] of node.entries) {
        if (keyEqual(k, key)) return v;
      }
      return undefined;
    case "internal": {
      const bit = 1 << ((hash >>> shift) & MASK);
      if (!(node.bitmap & bit)) return undefined;
      const idx = popcount(node.bitmap & (bit - 1));
      return lookup(node.children[idx]!, key, hash, shift + BITS_PER_LEVEL);
    }
  }
}

function hasKey<K, V>(node: Node<K, V>, key: K, hash: number, shift: number): boolean {
  switch (node.tag) {
    case "empty":
      return false;
    case "leaf":
      return keyEqual(node.key, key);
    case "collision":
      for (const [k] of node.entries) {
        if (keyEqual(k, key)) return true;
      }
      return false;
    case "internal": {
      const bit = 1 << ((hash >>> shift) & MASK);
      if (!(node.bitmap & bit)) return false;
      const idx = popcount(node.bitmap & (bit - 1));
      return hasKey(node.children[idx]!, key, hash, shift + BITS_PER_LEVEL);
    }
  }
}

interface InsertResult<K, V> {
  node: Node<K, V>;
  added: boolean;
}

function mergeLeaves<K, V>(
  hash1: number, key1: K, value1: V,
  hash2: number, key2: K, value2: V,
  shift: number,
): Node<K, V> {
  if (shift >= MAX_SHIFT) {
    return collision(hash1, [[key1, value1], [key2, value2]]);
  }

  const idx1 = (hash1 >>> shift) & MASK;
  const idx2 = (hash2 >>> shift) & MASK;

  if (idx1 === idx2) {
    const child = mergeLeaves(hash1, key1, value1, hash2, key2, value2, shift + BITS_PER_LEVEL);
    return internal(1 << idx1, [child]);
  }

  const l1 = leaf(hash1, key1, value1);
  const l2 = leaf(hash2, key2, value2);
  if (idx1 < idx2) {
    return internal((1 << idx1) | (1 << idx2), [l1, l2]);
  }
  return internal((1 << idx1) | (1 << idx2), [l2, l1]);
}

function insert<K, V>(
  node: Node<K, V>, key: K, value: V, hash: number, shift: number,
): InsertResult<K, V> {
  switch (node.tag) {
    case "empty":
      return { node: leaf(hash, key, value), added: true };

    case "leaf": {
      if (keyEqual(node.key, key)) {
        if (Object.is(node.value, value)) return { node, added: false };
        return { node: leaf(hash, key, value), added: false };
      }
      if (node.hash === hash) {
        return {
          node: collision(hash, [[node.key, node.value], [key, value]]),
          added: true,
        };
      }
      return {
        node: mergeLeaves(node.hash, node.key, node.value, hash, key, value, shift),
        added: true,
      };
    }

    case "collision": {
      for (let i = 0; i < node.entries.length; i++) {
        if (keyEqual(node.entries[i]![0], key)) {
          if (Object.is(node.entries[i]![1], value)) return { node, added: false };
          const newEntries = node.entries.map((e, j) =>
            j === i ? [key, value] as [K, V] : e,
          );
          return { node: collision(node.hash, newEntries), added: false };
        }
      }
      const newEntries = [...node.entries, [key, value] as [K, V]];
      return { node: collision(node.hash, newEntries), added: true };
    }

    case "internal": {
      const bit = 1 << ((hash >>> shift) & MASK);
      const idx = popcount(node.bitmap & (bit - 1));

      if (!(node.bitmap & bit)) {
        const newChildren = [...node.children];
        newChildren.splice(idx, 0, leaf(hash, key, value));
        return { node: internal(node.bitmap | bit, newChildren), added: true };
      }

      const child = node.children[idx]!;
      const result = insert(child, key, value, hash, shift + BITS_PER_LEVEL);
      if (result.node === child) return { node, added: result.added };
      const newChildren = [...node.children];
      newChildren[idx] = result.node;
      return { node: internal(node.bitmap, newChildren), added: result.added };
    }
  }
}

interface DeleteResult<K, V> {
  node: Node<K, V>;
  removed: boolean;
}

function deleteKey<K, V>(
  node: Node<K, V>, key: K, hash: number, shift: number,
): DeleteResult<K, V> {
  switch (node.tag) {
    case "empty":
      return { node, removed: false };

    case "leaf":
      if (keyEqual(node.key, key)) return { node: empty<K, V>(), removed: true };
      return { node, removed: false };

    case "collision": {
      const entryIdx = node.entries.findIndex(([k]) => keyEqual(k, key));
      if (entryIdx === -1) return { node, removed: false };
      if (node.entries.length === 2) {
        const remaining = node.entries[entryIdx === 0 ? 1 : 0]!;
        return { node: leaf(node.hash, remaining[0], remaining[1]), removed: true };
      }
      const newEntries = node.entries.filter((_, i) => i !== entryIdx);
      return { node: collision(node.hash, newEntries), removed: true };
    }

    case "internal": {
      const bit = 1 << ((hash >>> shift) & MASK);
      if (!(node.bitmap & bit)) return { node, removed: false };

      const idx = popcount(node.bitmap & (bit - 1));
      const child = node.children[idx]!;
      const result = deleteKey(child, key, hash, shift + BITS_PER_LEVEL);

      if (!result.removed) return { node, removed: false };

      if (result.node.tag === "empty") {
        const newBitmap = node.bitmap ^ bit;
        if (newBitmap === 0) return { node: empty<K, V>(), removed: true };

        const newChildren = [...node.children];
        newChildren.splice(idx, 1);

        if (newChildren.length === 1 && newChildren[0]!.tag !== "internal") {
          return { node: newChildren[0]!, removed: true };
        }

        return { node: internal(newBitmap, newChildren), removed: true };
      }

      const newChildren = [...node.children];
      newChildren[idx] = result.node;
      return { node: internal(node.bitmap, newChildren), removed: true };
    }
  }
}

function iterate<K, V>(node: Node<K, V>, callback: (key: K, value: V) => void): void {
  switch (node.tag) {
    case "empty":
      return;
    case "leaf":
      callback(node.key, node.value);
      return;
    case "collision":
      for (const [k, v] of node.entries) callback(k, v);
      return;
    case "internal":
      for (const child of node.children) iterate(child, callback);
      return;
  }
}

function* iterEntries<K, V>(node: Node<K, V>): Generator<[K, V]> {
  switch (node.tag) {
    case "empty":
      return;
    case "leaf":
      yield [node.key, node.value];
      return;
    case "collision":
      for (const entry of node.entries) yield entry;
      return;
    case "internal":
      for (const child of node.children) yield* iterEntries(child);
      return;
  }
}

export class HashArrayMappedTrie<K, V> {
  private _root: Node<K, V>;
  private _size: number;
  private _hash: HashFunction;

  constructor(entries?: Iterable<[K, V]>, options?: HAMTOptions) {
    this._hash = options?.hash ?? fnv1aHash;
    this._root = empty<K, V>();
    this._size = 0;
    if (entries) {
      let root: Node<K, V> = empty<K, V>();
      let size = 0;
      for (const [key, value] of entries) {
        const result = insert(root, key, value, this._hash(key), 0);
        if (result.added) size++;
        root = result.node;
      }
      this._root = root;
      this._size = size;
    }
  }

  private static _build<K, V>(
    root: Node<K, V>, size: number, hash: HashFunction,
  ): HashArrayMappedTrie<K, V> {
    const t = new HashArrayMappedTrie<K, V>();
    t._root = root;
    t._size = size;
    t._hash = hash;
    return t;
  }

  static empty<K, V>(options?: HAMTOptions): HashArrayMappedTrie<K, V> {
    return new HashArrayMappedTrie<K, V>(undefined, options);
  }

  static from<K, V>(entries: Iterable<[K, V]>, options?: HAMTOptions): HashArrayMappedTrie<K, V> {
    return new HashArrayMappedTrie<K, V>(entries, options);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._root = empty<K, V>()
    this._size = 0
  }

  get(key: K): V | undefined {
    return lookup(this._root, key, this._hash(key), 0);
  }

  has(key: K): boolean {
    return hasKey(this._root, key, this._hash(key), 0);
  }

  set(key: K, value: V): HashArrayMappedTrie<K, V> {
    const hash = this._hash(key);
    const result = insert(this._root, key, value, hash, 0);
    if (result.node === this._root) return this;
    return HashArrayMappedTrie._build(
      result.node,
      result.added ? this._size + 1 : this._size,
      this._hash,
    );
  }

  delete(key: K): HashArrayMappedTrie<K, V> {
    const hash = this._hash(key);
    const result = deleteKey(this._root, key, hash, 0);
    if (!result.removed) return this;
    return HashArrayMappedTrie._build(
      result.node.tag === "empty" ? empty<K, V>() : result.node,
      this._size - 1,
      this._hash,
    );
  }

  keys(): K[] {
    const result: K[] = [];
    iterate(this._root, (key) => { result.push(key); });
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    iterate(this._root, (_key, value) => { result.push(value); });
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    iterate(this._root, (key, value) => { result.push([key, value]); });
    return result;
  }

  toArray(): Array<[K, V]> {
    return this.entries();
  }

  forEach(callback: (value: V, key: K, trie: HashArrayMappedTrie<K, V>) => void): void {
    iterate(this._root, (key, value) => { callback(value, key, this); });
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    yield* iterEntries(this._root);
  }

  map<U>(fn: (value: V, key: K) => U): HashArrayMappedTrie<K, U> {
    let result = HashArrayMappedTrie.empty<K, U>({ hash: this._hash as HashFunction });
    iterate(this._root, (key, value) => {
      result = result.set(key, fn(value, key));
    });
    return result;
  }

  filter(fn: (value: V, key: K) => boolean): HashArrayMappedTrie<K, V> {
    let result = HashArrayMappedTrie.empty<K, V>({ hash: this._hash });
    iterate(this._root, (key, value) => {
      if (fn(value, key)) {
        result = result.set(key, value);
      }
    });
    return result;
  }

  merge(other: HashArrayMappedTrie<K, V>): HashArrayMappedTrie<K, V> {
    let result: HashArrayMappedTrie<K, V> = this;
    const otherEntries = other.entries();
    for (const [key, value] of otherEntries) {
      result = result.set(key, value);
    }
    return result;
  }

  clone(): HashArrayMappedTrie<K, V> {
    return HashArrayMappedTrie._build(this._root, this._size, this._hash);
  }
}
