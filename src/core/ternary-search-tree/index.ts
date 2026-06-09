import type { Entry, TSTNode, TSTOptions } from "./types.js";

function createNode<V>(char: string): TSTNode<V> {
  return { char, lo: undefined, eq: undefined, hi: undefined, value: undefined, isEnd: false };
}

const defaultComparator = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;

export class TernarySearchTree<V = unknown> {
  private root: TSTNode<V> | undefined;
  private _size: number = 0;
  private readonly cmp: (a: string, b: string) => number;
  private emptyValue: V | undefined;
  private hasEmptyStr: boolean = false;

  constructor(options?: TSTOptions) {
    this.cmp = options?.comparator ?? defaultComparator;
    this.emptyValue = undefined;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  private buildPath(word: string, index: number, value: V): TSTNode<V> {
    const first = createNode<V>(word[index]!);
    let current = first;
    for (let i = index + 1; i < word.length; i++) {
      current.eq = createNode<V>(word[i]!);
      current = current.eq;
    }
    current.isEnd = true;
    current.value = value;
    return first;
  }

  insert(word: string, value: V = undefined as V): void {
    if (word.length === 0) {
      if (this.hasEmptyStr) {
        this.emptyValue = value;
        return;
      }
      this.hasEmptyStr = true;
      this.emptyValue = value;
      this._size++;
      return;
    }

    if (this.root === undefined) {
      this.root = this.buildPath(word, 0, value);
      this._size++;
      return;
    }

    const isNew = this.insertIter(word, value);
    if (isNew) this._size++;
  }

  private insertIter(word: string, value: V): boolean {
    let node: TSTNode<V> = this.root!;
    let i = 0;

    while (i < word.length) {
      const ch = word[i]!;
      const c = this.cmp(ch, node.char);
      if (c < 0) {
        if (node.lo === undefined) {
          node.lo = this.buildPath(word, i, value);
          return true;
        }
        node = node.lo;
      } else if (c > 0) {
        if (node.hi === undefined) {
          node.hi = this.buildPath(word, i, value);
          return true;
        }
        node = node.hi;
      } else {
        if (i === word.length - 1) {
          if (node.isEnd) {
            node.value = value;
            return false;
          }
          node.isEnd = true;
          node.value = value;
          return true;
        }
        if (node.eq === undefined) {
          node.eq = this.buildPath(word, i + 1, value);
          return true;
        }
        node = node.eq;
        i++;
      }
    }

    return false;
  }

  has(word: string): boolean {
    if (word.length === 0) return this.hasEmptyStr;
    const node = this.findNode(word);
    return node !== undefined && node.isEnd;
  }

  get(word: string): V | undefined {
    if (word.length === 0) {
      if (!this.hasEmptyStr) return undefined;
      return this.emptyValue;
    }
    const node = this.findNode(word);
    if (node === undefined || !node.isEnd) return undefined;
    return node.value;
  }

  private findNode(word: string): TSTNode<V> | undefined {
    let node = this.root;
    let i = 0;

    while (node !== undefined && i < word.length) {
      const ch = word[i]!;
      const c = this.cmp(ch, node.char);
      if (c < 0) {
        node = node.lo;
      } else if (c > 0) {
        node = node.hi;
      } else {
        if (i === word.length - 1) return node;
        node = node.eq;
        i++;
      }
    }

    return undefined;
  }

  delete(word: string): boolean {
    if (word.length === 0) {
      if (!this.hasEmptyStr) return false;
      this.hasEmptyStr = false;
      this.emptyValue = undefined;
      this._size--;
      return true;
    }

    if (this.root === undefined) return false;

    const path: Array<TSTNode<V>> = [];
    const dirs: Array<"lo" | "eq" | "hi"> = [];
    let node: TSTNode<V> | undefined = this.root;
    let i = 0;

    while (node !== undefined && i < word.length) {
      path.push(node);
      const ch = word[i]!;
      const c = this.cmp(ch, node.char);
      if (c < 0) {
        dirs.push("lo");
        node = node.lo;
      } else if (c > 0) {
        dirs.push("hi");
        node = node.hi;
      } else {
        if (i === word.length - 1) {
          if (!node.isEnd) return false;
          node.isEnd = false;
          node.value = undefined;
          this.cleanup(path, dirs);
          this._size--;
          return true;
        }
        dirs.push("eq");
        node = node.eq;
        i++;
      }
    }

    return false;
  }

  private cleanup(path: Array<TSTNode<V>>, dirs: Array<"lo" | "eq" | "hi">): void {
    for (let j = path.length - 1; j >= 0; j--) {
      const node = path[j]!;
      const dir = dirs[j]!;
      const child = node[dir];
      if (child !== undefined && !child.isEnd && child.lo === undefined && child.eq === undefined && child.hi === undefined) {
        node[dir] = undefined;
      } else {
        break;
      }
    }

    if (this.root !== undefined && !this.root.isEnd && this.root.lo === undefined && this.root.eq === undefined && this.root.hi === undefined) {
      this.root = undefined;
    }
  }

  search(prefix: string): string[] {
    return this.keysWithPrefix(prefix);
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) return this._size > 0;
    return this.findPrefixNode(prefix) !== undefined;
  }

  containsPrefix(prefix: string): boolean {
    return this.startsWith(prefix);
  }

  private findPrefixNode(prefix: string): TSTNode<V> | undefined {
    let node = this.root;
    let i = 0;

    while (node !== undefined && i < prefix.length) {
      const ch = prefix[i]!;
      const c = this.cmp(ch, node.char);
      if (c < 0) {
        node = node.lo;
      } else if (c > 0) {
        node = node.hi;
      } else {
        if (i === prefix.length - 1) return node;
        node = node.eq;
        i++;
      }
    }

    return undefined;
  }

  longestPrefixOf(query: string): string {
    if (query.length === 0) {
      if (this.hasEmptyStr) return "";
      return "";
    }

    let longest = this.hasEmptyStr ? "" : "";
    let node = this.root;
    let i = 0;

    while (node !== undefined && i < query.length) {
      const ch = query[i]!;
      const c = this.cmp(ch, node.char);
      if (c < 0) {
        node = node.lo;
      } else if (c > 0) {
        node = node.hi;
      } else {
        if (node.isEnd) longest = query.substring(0, i + 1);
        if (i === query.length - 1) break;
        node = node.eq;
        i++;
      }
    }

    return longest;
  }

  keysWithPrefix(prefix: string): string[] {
    const results: string[] = [];
    if (prefix.length === 0) {
      if (this.hasEmptyStr) results.push("");
      this.collectKeys(this.root, "", results);
      return results;
    }

    const startNode = this.findPrefixNode(prefix);
    if (startNode === undefined) return results;
    if (startNode.isEnd) results.push(prefix);
    this.collectKeys(startNode.eq, prefix, results);
    return results;
  }

  private collectKeys(node: TSTNode<V> | undefined, prefix: string, results: string[]): void {
    if (node === undefined) return;
    this.collectKeys(node.lo, prefix, results);
    if (node.isEnd) results.push(prefix + node.char);
    this.collectKeys(node.eq, prefix + node.char, results);
    this.collectKeys(node.hi, prefix, results);
  }

  valuesWithPrefix(prefix: string): V[] {
    const results: V[] = [];
    if (prefix.length === 0) {
      if (this.hasEmptyStr) results.push(this.emptyValue as V);
      this.collectValues(this.root, results);
      return results;
    }

    const startNode = this.findPrefixNode(prefix);
    if (startNode === undefined) return results;
    if (startNode.isEnd) results.push(startNode.value as V);
    this.collectValues(startNode.eq, results);
    return results;
  }

  private collectValues(node: TSTNode<V> | undefined, results: V[]): void {
    if (node === undefined) return;
    this.collectValues(node.lo, results);
    if (node.isEnd) results.push(node.value as V);
    this.collectValues(node.eq, results);
    this.collectValues(node.hi, results);
  }

  entriesWithPrefix(prefix: string): Entry<V>[] {
    const results: Entry<V>[] = [];
    if (prefix.length === 0) {
      if (this.hasEmptyStr) results.push({ key: "", value: this.emptyValue as V });
      this.collectEntries(this.root, "", results);
      return results;
    }

    const startNode = this.findPrefixNode(prefix);
    if (startNode === undefined) return results;
    if (startNode.isEnd) results.push({ key: prefix, value: startNode.value as V });
    this.collectEntries(startNode.eq, prefix, results);
    return results;
  }

  private collectEntries(node: TSTNode<V> | undefined, prefix: string, results: Entry<V>[]): void {
    if (node === undefined) return;
    this.collectEntries(node.lo, prefix, results);
    if (node.isEnd) results.push({ key: prefix + node.char, value: node.value as V });
    this.collectEntries(node.eq, prefix + node.char, results);
    this.collectEntries(node.hi, prefix, results);
  }

  keys(): string[] {
    const results: string[] = [];
    if (this.hasEmptyStr) results.push("");
    this.collectKeys(this.root, "", results);
    return results;
  }

  values(): V[] {
    const results: V[] = [];
    if (this.hasEmptyStr) results.push(this.emptyValue as V);
    this.collectValues(this.root, results);
    return results;
  }

  entries(): Entry<V>[] {
    return this.toArray();
  }

  clear(): void {
    this.root = undefined;
    this._size = 0;
    this.hasEmptyStr = false;
    this.emptyValue = undefined;
  }

  toArray(): Entry<V>[] {
    const results: Entry<V>[] = [];
    if (this.hasEmptyStr) results.push({ key: "", value: this.emptyValue as V });
    this.collectEntries(this.root, "", results);
    return results;
  }

  forEach(callback: (value: V, key: string, tree: TernarySearchTree<V>) => void): void {
    const entries = this.toArray();
    for (const entry of entries) {
      callback(entry.value, entry.key, this);
    }
  }

  *[Symbol.iterator](): Iterator<Entry<V>> {
    if (this.hasEmptyStr) yield { key: "", value: this.emptyValue as V };
    type Frame = { node: TSTNode<V>; prefix: string; phase: number };
    const stack: Frame[] = [];
    if (this.root !== undefined) {
      stack.push({ node: this.root, prefix: "", phase: 0 });
    }
    while (stack.length > 0) {
      const top = stack[stack.length - 1]!;
      if (top.phase === 0) {
        top.phase = 1;
        if (top.node.lo !== undefined) {
          stack.push({ node: top.node.lo, prefix: top.prefix, phase: 0 });
        }
      } else if (top.phase === 1) {
        top.phase = 2;
        if (top.node.isEnd) {
          yield { key: top.prefix + top.node.char, value: top.node.value as V };
        }
      } else if (top.phase === 2) {
        top.phase = 3;
        if (top.node.eq !== undefined) {
          stack.push({ node: top.node.eq, prefix: top.prefix + top.node.char, phase: 0 });
        }
      } else {
        stack.pop();
        if (top.node.hi !== undefined) {
          stack.push({ node: top.node.hi, prefix: top.prefix, phase: 0 });
        }
      }
    }
  }

  wildcardMatch(pattern: string, wildcard: string = "*"): string[] {
    const results: string[] = [];
    if (this.hasEmptyStr && this.patternMatchesEmpty(pattern, wildcard)) {
      results.push("");
    }
    this.wildcardSearch(this.root, "", pattern, 0, wildcard, results);
    return results;
  }

  private patternMatchesEmpty(pattern: string, wildcard: string): boolean {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== wildcard) return false;
    }
    return true;
  }

  private wildcardSearch(
    node: TSTNode<V> | undefined,
    prefix: string,
    pattern: string,
    pIdx: number,
    wildcard: string,
    results: string[]
  ): void {
    if (node === undefined) return;

    if (pIdx === pattern.length) {
      if (node.isEnd) results.push(prefix + node.char);
      return;
    }

    const pChar = pattern[pIdx]!;
    if (pChar === wildcard) {
      if (pIdx === pattern.length - 1) {
        this.collectKeys(node, prefix, results);
        return;
      }
      this.wildcardSearch(node, prefix, pattern, pIdx + 1, wildcard, results);
      this.consumeAll(node, prefix, pattern, pIdx, wildcard, results);
    } else {
      const c = this.cmp(pChar, node.char);
      if (c < 0) {
        this.wildcardSearch(node.lo, prefix, pattern, pIdx, wildcard, results);
      } else if (c > 0) {
        this.wildcardSearch(node.hi, prefix, pattern, pIdx, wildcard, results);
      } else {
        if (pIdx === pattern.length - 1) {
          if (node.isEnd) results.push(prefix + node.char);
        } else {
          this.wildcardSearch(node.eq, prefix + node.char, pattern, pIdx + 1, wildcard, results);
        }
      }
    }
  }

  private consumeAll(
    node: TSTNode<V> | undefined,
    prefix: string,
    pattern: string,
    pIdx: number,
    wildcard: string,
    results: string[]
  ): void {
    if (node === undefined) return;
    this.consumeAll(node.lo, prefix, pattern, pIdx, wildcard, results);
    this.wildcardSearch(node.eq, prefix + node.char, pattern, pIdx, wildcard, results);
    this.consumeAll(node.hi, prefix, pattern, pIdx, wildcard, results);
  }

  toString(): string {
    return `TernarySearchTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'TernarySearchTree', size: this.size, items: this.toArray() }
  }
}
