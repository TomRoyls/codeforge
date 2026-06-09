import type { Entry, BTrieNode } from "./types.js";
import { BUCKET_THRESHOLD } from "./types.js";

function createNode<V>(): BTrieNode<V> {
  return { children: new Map(), bucket: new Map() };
}

export class BTrie<V = unknown> {
  private root: BTrieNode<V>;
  private _size: number = 0;
  private readonly threshold: number;

  constructor(threshold: number = BUCKET_THRESHOLD) {
    if (threshold < 1) {
      throw new RangeError("Bucket threshold must be at least 1");
    }
    this.threshold = threshold;
    this.root = createNode<V>();
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(key: string, value: V = undefined as V): void {
    const isNew = this.insertInternal(this.root, key, 0, value);
    if (isNew) {
      this._size++;
    }
  }

  private insertInternal(node: BTrieNode<V>, key: string, depth: number, value: V): boolean {
    if (node.bucket !== null) {
      if (node.bucket.has(key)) {
        node.bucket.set(key, value);
        return false;
      }
      node.bucket.set(key, value);
      if (node.bucket.size > this.threshold) {
        this.burst(node, depth);
      }
      return true;
    }

    if (depth >= key.length) {
      const terminal = this.getOrCreateChild(node, 0);
      if (terminal.bucket === null) {
        terminal.bucket = new Map();
      }
      const emptyKey = this.getEmptyKey(depth);
      if (terminal.bucket.has(emptyKey)) {
        terminal.bucket.set(emptyKey, value);
        return false;
      }
      terminal.bucket.set(emptyKey, value);
      if (terminal.bucket.size > this.threshold) {
        this.burst(terminal, depth);
      }
      return true;
    }

    const charCode = key.charCodeAt(depth);
    const child = this.getOrCreateChild(node, charCode);
    return this.insertInternal(child, key, depth + 1, value);
  }

  private getOrCreateChild(node: BTrieNode<V>, charCode: number): BTrieNode<V> {
    let child = node.children.get(charCode);
    if (!child) {
      child = createNode<V>();
      node.children.set(charCode, child);
    }
    return child;
  }

  private getEmptyKey(depth: number): string {
    return `\x00TERM_${depth}`;
  }

  private burst(node: BTrieNode<V>, depth: number): void {
    if (node.bucket === null) return;

    const entries = Array.from(node.bucket.entries());
    node.bucket = null;

    for (const [key, value] of entries) {
      if (key.startsWith("\x00TERM_")) {
        const terminal = this.getOrCreateChild(node, 0);
        if (terminal.bucket === null) {
          terminal.bucket = new Map();
        }
        terminal.bucket.set(key, value);
      } else if (depth < key.length) {
        const charCode = key.charCodeAt(depth);
        const child = this.getOrCreateChild(node, charCode);
        if (child.bucket === null) {
          child.bucket = new Map();
        }
        child.bucket.set(key, value);
      } else {
        const terminal = this.getOrCreateChild(node, 0);
        if (terminal.bucket === null) {
          terminal.bucket = new Map();
        }
        const emptyKey = this.getEmptyKey(depth);
        terminal.bucket.set(emptyKey, value);
      }
    }

    const childEntries = Array.from(node.children.entries());
    for (const [, child] of childEntries) {
      if (child.bucket !== null && child.bucket.size > this.threshold) {
        this.burst(child, depth + 1);
      }
    }
  }

  delete(key: string): boolean {
    return this.deleteInternal(this.root, key, 0);
  }

  private deleteInternal(node: BTrieNode<V>, key: string, depth: number): boolean {
    if (node.bucket !== null) {
      if (node.bucket.has(key)) {
        node.bucket.delete(key);
        this._size--;
        return true;
      }
      return false;
    }

    if (depth >= key.length) {
      const terminal = node.children.get(0);
      if (!terminal || terminal.bucket === null) return false;
      const emptyKey = this.getEmptyKey(depth);
      if (terminal.bucket.has(emptyKey)) {
        terminal.bucket.delete(emptyKey);
        this._size--;
        return true;
      }
      return false;
    }

    const charCode = key.charCodeAt(depth);
    const child = node.children.get(charCode);
    if (!child) return false;
    return this.deleteInternal(child, key, depth + 1);
  }

  has(key: string): boolean {
    return this.hasInternal(this.root, key, 0);
  }

  private hasInternal(node: BTrieNode<V>, key: string, depth: number): boolean {
    if (node.bucket !== null) {
      return node.bucket.has(key);
    }

    if (depth >= key.length) {
      const terminal = node.children.get(0);
      if (!terminal || terminal.bucket === null) return false;
      return terminal.bucket.has(this.getEmptyKey(depth));
    }

    const charCode = key.charCodeAt(depth);
    const child = node.children.get(charCode);
    if (!child) return false;
    return this.hasInternal(child, key, depth + 1);
  }

  get(key: string): V | undefined {
    return this.getInternal(this.root, key, 0);
  }

  private getInternal(node: BTrieNode<V>, key: string, depth: number): V | undefined {
    if (node.bucket !== null) {
      return node.bucket.get(key);
    }

    if (depth >= key.length) {
      const terminal = node.children.get(0);
      if (!terminal || terminal.bucket === null) return undefined;
      return terminal.bucket.get(this.getEmptyKey(depth));
    }

    const charCode = key.charCodeAt(depth);
    const child = node.children.get(charCode);
    if (!child) return undefined;
    return this.getInternal(child, key, depth + 1);
  }

  clear(): void {
    this.root = createNode<V>();
    this._size = 0;
  }

  keysWithPrefix(prefix: string): string[] {
    const results: string[] = [];
    this.collectPrefix(this.root, prefix, 0, results);
    return results;
  }

  private collectPrefix(node: BTrieNode<V>, prefix: string, depth: number, results: string[]): void {
    if (node.bucket !== null) {
      const keys = Array.from(node.bucket.keys());
      for (const key of keys) {
        if (key.startsWith("\x00TERM_")) continue;
        if (key.startsWith(prefix)) {
          results.push(key);
        }
      }
      return;
    }

    if (depth < prefix.length) {
      const charCode = prefix.charCodeAt(depth);
      const child = node.children.get(charCode);
      if (child) {
        this.collectPrefix(child, prefix, depth + 1, results);
      }
      return;
    }

    this.collectAllKeys(node, results, prefix);
  }

  private collectAllKeys(node: BTrieNode<V>, results: string[], prefix: string): void {
    if (node.bucket !== null) {
      const keys = Array.from(node.bucket.keys());
      for (const key of keys) {
        if (key.startsWith("\x00TERM_")) {
          results.push(prefix);
        } else {
          results.push(key);
        }
      }
      return;
    }

    const entries = Array.from(node.children.entries());
    for (const [charCode, child] of entries) {
      if (charCode === 0) {
        this.collectAllKeys(child, results, prefix);
      } else {
        this.collectAllKeys(child, results, prefix + String.fromCharCode(charCode));
      }
    }
  }

  startsWith(prefix: string): boolean {
    return this.startsWithInternal(this.root, prefix, 0);
  }

  private startsWithInternal(node: BTrieNode<V>, prefix: string, depth: number): boolean {
    if (node.bucket !== null) {
      const keys = Array.from(node.bucket.keys());
      for (const key of keys) {
        if (key.startsWith("\x00TERM_")) continue;
        if (key.startsWith(prefix)) return true;
      }
      return false;
    }

    if (depth < prefix.length) {
      const charCode = prefix.charCodeAt(depth);
      const child = node.children.get(charCode);
      if (!child) return false;
      return this.startsWithInternal(child, prefix, depth + 1);
    }

    return this.hasAnyKey(node);
  }

  private hasAnyKey(node: BTrieNode<V>): boolean {
    if (node.bucket !== null) {
      const keys = Array.from(node.bucket.keys());
      for (const key of keys) {
        if (!key.startsWith("\x00TERM_")) return true;
      }
      return node.bucket.size > 0;
    }

    const entries = Array.from(node.children.entries());
    for (const [charCode, child] of entries) {
      if (charCode === 0) {
        if (child.bucket !== null && child.bucket.size > 0) return true;
        if (child.bucket === null && this.hasAnyKey(child)) return true;
      } else {
        if (this.hasAnyKey(child)) return true;
      }
    }
    return false;
  }

  search(key: string): V | undefined {
    return this.get(key);
  }

  toArray(): Entry<V>[] {
    const results: Entry<V>[] = [];
    this.collectAllEntries(this.root, "", results);
    return results;
  }

  private collectAllEntries(node: BTrieNode<V>, prefix: string, results: Entry<V>[]): void {
    if (node.bucket !== null) {
      const entries = Array.from(node.bucket.entries());
      for (const [key, value] of entries) {
        if (key.startsWith("\x00TERM_")) {
          results.push({ key: prefix, value });
        } else {
          results.push({ key, value });
        }
      }
      return;
    }

    const childEntries = Array.from(node.children.entries());
    for (const [charCode, child] of childEntries) {
      if (charCode === 0) {
        this.collectAllEntries(child, prefix, results);
      } else {
        this.collectAllEntries(child, prefix + String.fromCharCode(charCode), results);
      }
    }
  }

  forEach(callback: (value: V, key: string, trie: BTrie<V>) => void): void {
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

  longestPrefixOf(key: string): string {
    const result = { longest: "" };
    this.findLongestPrefix(this.root, key, 0, "", result);
    return result.longest;
  }

  private findLongestPrefix(node: BTrieNode<V>, key: string, depth: number, current: string, result: { longest: string }): void {
    if (node.bucket !== null) {
      const keys = Array.from(node.bucket.keys());
      for (const k of keys) {
        if (k.startsWith("\x00TERM_")) {
          if (current.length > result.longest.length) {
            result.longest = current;
          }
        } else if (key.startsWith(k) && k.length > result.longest.length) {
          result.longest = k;
        }
      }
      return;
    }

    if (depth >= key.length) {
      const terminal = node.children.get(0);
      if (terminal && terminal.bucket !== null) {
        const keys = Array.from(terminal.bucket.keys());
        for (const k of keys) {
          if (k.startsWith("\x00TERM_")) {
            if (current.length > result.longest.length) {
              result.longest = current;
            }
          }
        }
      }
      return;
    }

    const terminal = node.children.get(0);
    if (terminal) {
      if (terminal.bucket !== null) {
        const keys = Array.from(terminal.bucket.keys());
        for (const k of keys) {
          if (k.startsWith("\x00TERM_") && current.length > result.longest.length) {
            result.longest = current;
          }
        }
      } else {
        this.findLongestPrefix(terminal, key, depth + 1, current, result);
      }
    }

    const charCode = key.charCodeAt(depth);
    const child = node.children.get(charCode);
    if (child) {
      this.findLongestPrefix(child, key, depth + 1, current + key[depth]!, result);
    }
  }

  countForPrefix(prefix: string): number {
    return this.keysWithPrefix(prefix).length;
  }

  toString(): string {
    return `${BTrie}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }



  toJSON() {
    return { type: 'BTrie', size: this.size, items: this.toArray() }
  }


}
