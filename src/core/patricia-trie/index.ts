import type { Entry, PatriciaTrieNode, PatriciaTrieOptions } from "./types.js";

function createNode<V>(edge: string, isTerminal: boolean, value: V | undefined): PatriciaTrieNode<V> {
  return { edge, children: new Map(), value, isTerminal };
}

export class PatriciaTrie<V = unknown> {
  private root: PatriciaTrieNode<V>;
  private _size: number = 0;
  private readonly alphabetSet: Set<string> | undefined;
  private readonly alphabetStr: string | undefined;

  constructor(options?: PatriciaTrieOptions) {
    this.root = createNode<V>("", false, undefined);
    this.alphabetStr = options?.alphabet;
    this.alphabetSet = options?.alphabet ? new Set(options.alphabet) : undefined;
  }

  get size(): number {
    return this._size;
  }

  get radix(): number {
    return this.alphabetStr?.length ?? 256;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(key: string, value: V = undefined as V): void {
    if (this.alphabetSet !== undefined) {
      for (let i = 0; i < key.length; i++) {
        if (!this.alphabetSet.has(key[i]!)) {
          throw new RangeError(`Character '${key[i]}' not in alphabet`);
        }
      }
    }
    const isNew = this.insertInternal(this.root, key, value);
    if (isNew) this._size++;
  }

  private insertInternal(node: PatriciaTrieNode<V>, key: string, value: V): boolean {
    if (key.length === 0) {
      if (node.isTerminal) {
        node.value = value;
        return false;
      }
      node.isTerminal = true;
      node.value = value;
      return true;
    }

    const firstChar = key[0]!;
    const child = node.children.get(firstChar);

    if (child === undefined) {
      node.children.set(firstChar, createNode<V>(key, true, value));
      return true;
    }

    const commonLen = this.commonPrefixLength(key, child.edge);

    if (commonLen === child.edge.length) {
      return this.insertInternal(child, key.substring(commonLen), value);
    }

    if (commonLen === key.length) {
      const splitNode = createNode<V>(key, true, value);
      child.edge = child.edge.substring(commonLen);
      splitNode.children.set(child.edge[0]!, child);
      node.children.set(firstChar, splitNode);
      return true;
    }

    const splitNode = createNode<V>(key.substring(0, commonLen), false, undefined);
    child.edge = child.edge.substring(commonLen);
    splitNode.children.set(child.edge[0]!, child);
    const newChild = createNode<V>(key.substring(commonLen), true, value);
    splitNode.children.set(newChild.edge[0]!, newChild);
    node.children.set(firstChar, splitNode);
    return true;
  }

  private commonPrefixLength(a: string, b: string): number {
    const minLen = Math.min(a.length, b.length);
    let i = 0;
    while (i < minLen && a[i] === b[i]) i++;
    return i;
  }

  delete(key: string): boolean {
    const result = this.deleteInternal(this.root, key);
    if (result) this._size--;
    return result;
  }

  private deleteInternal(node: PatriciaTrieNode<V>, key: string): boolean {
    if (key.length === 0) {
      if (!node.isTerminal) return false;
      node.isTerminal = false;
      node.value = undefined;
      return true;
    }

    const firstChar = key[0]!;
    const child = node.children.get(firstChar);
    if (child === undefined) return false;

    if (!key.startsWith(child.edge)) return false;

    const remaining = key.substring(child.edge.length);
    const deleted = this.deleteInternal(child, remaining);
    if (!deleted) return false;

    this.cleanupChild(node, firstChar);
    return true;
  }

  private cleanupChild(parent: PatriciaTrieNode<V>, childKey: string): void {
    let current = parent.children.get(childKey);
    while (current !== undefined && !current.isTerminal) {
      if (current.children.size === 0) {
        parent.children.delete(childKey);
        return;
      }
      if (current.children.size === 1) {
        const [, grandchild] = current.children.entries().next().value!;
        grandchild.edge = current.edge + grandchild.edge;
        parent.children.set(childKey, grandchild);
        current = grandchild;
      } else {
        return;
      }
    }
  }

  has(key: string): boolean {
    const node = this.findNode(key);
    return node !== undefined && node.isTerminal;
  }

  contains(key: string): boolean {
    return this.has(key);
  }

  get(key: string): V | undefined {
    const node = this.findNode(key);
    if (node === undefined || !node.isTerminal) return undefined;
    return node.value;
  }

  private findNode(key: string): PatriciaTrieNode<V> | undefined {
    let node: PatriciaTrieNode<V> = this.root;
    let remaining = key;

    while (remaining.length > 0) {
      const firstChar = remaining[0]!;
      const child = node.children.get(firstChar);
      if (child === undefined) return undefined;
      if (!remaining.startsWith(child.edge)) return undefined;
      remaining = remaining.substring(child.edge.length);
      node = child;
    }

    return node;
  }

  clear(): void {
    this.root = createNode<V>("", false, undefined);
    this._size = 0;
  }

  keysWithPrefix(prefix: string): string[] {
    const results: string[] = [];
    let node = this.root;
    let accumulated = "";
    let remaining = prefix;

    while (remaining.length > 0) {
      const firstChar = remaining[0]!;
      const child = node.children.get(firstChar);
      if (child === undefined) return results;

      const edgeLen = child.edge.length;

      if (remaining.length >= edgeLen) {
        if (!remaining.startsWith(child.edge)) return results;
        accumulated += child.edge;
        remaining = remaining.substring(edgeLen);
        node = child;
      } else {
        if (child.edge.startsWith(remaining)) {
          this.collectKeys(child, accumulated + child.edge, results);
        }
        return results;
      }
    }

    this.collectKeys(node, accumulated, results);
    return results;
  }

  private collectKeys(node: PatriciaTrieNode<V>, prefix: string, results: string[]): void {
    if (node.isTerminal) results.push(prefix);
    for (const [, child] of node.children) {
      this.collectKeys(child, prefix + child.edge, results);
    }
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    let remaining = prefix;

    while (remaining.length > 0) {
      const firstChar = remaining[0]!;
      const child = node.children.get(firstChar);
      if (child === undefined) return false;

      const edgeLen = child.edge.length;

      if (remaining.length >= edgeLen) {
        if (!remaining.startsWith(child.edge)) return false;
        remaining = remaining.substring(edgeLen);
        node = child;
      } else {
        if (!child.edge.startsWith(remaining)) return false;
        return this.hasAnyTerminal(child);
      }
    }

    return this.hasAnyTerminal(node);
  }

  private hasAnyTerminal(node: PatriciaTrieNode<V>): boolean {
    if (node.isTerminal) return true;
    for (const [, child] of node.children) {
      if (this.hasAnyTerminal(child)) return true;
    }
    return false;
  }

  longestPrefixOf(key: string): string {
    let longest = "";
    if (this.root.isTerminal) longest = "";

    let node = this.root;
    let accumulated = "";
    let remaining = key;

    while (remaining.length > 0) {
      const firstChar = remaining[0]!;
      const child = node.children.get(firstChar);
      if (child === undefined) break;

      if (remaining.startsWith(child.edge)) {
        accumulated += child.edge;
        remaining = remaining.substring(child.edge.length);
        node = child;
        if (node.isTerminal) longest = accumulated;
      } else {
        break;
      }
    }

    return longest;
  }

  keys(): string[] {
    const results: string[] = [];
    this.collectKeys(this.root, "", results);
    return results;
  }

  values(): V[] {
    const results: V[] = [];
    this.collectValues(this.root, results);
    return results;
  }

  private collectValues(node: PatriciaTrieNode<V>, results: V[]): void {
    if (node.isTerminal) results.push(node.value as V);
    for (const [, child] of node.children) {
      this.collectValues(child, results);
    }
  }

  entries(): Entry<V>[] {
    return this.toArray();
  }

  toArray(): Entry<V>[] {
    const results: Entry<V>[] = [];
    this.collectEntries(this.root, "", results);
    return results;
  }

  private collectEntries(node: PatriciaTrieNode<V>, prefix: string, results: Entry<V>[]): void {
    if (node.isTerminal) {
      results.push({ key: prefix, value: node.value as V });
    }
    for (const [, child] of node.children) {
      this.collectEntries(child, prefix + child.edge, results);
    }
  }

  forEach(callback: (value: V, key: string, trie: PatriciaTrie<V>) => void): void {
    const entries = this.toArray();
    for (const entry of entries) {
      callback(entry.value, entry.key, this);
    }
  }

  *[Symbol.iterator](): Iterator<Entry<V>> {
    const entries = this.toArray();
    for (const entry of entries) {
      yield entry;
    }
  }

  toString(): string {
    return `PatriciaTrie({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PatriciaTrie', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'PatriciaTrie'
  }

  includes(key: string): boolean {
    return this.contains(key)
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
