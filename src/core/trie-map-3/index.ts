export class TrieMap3<T> {
  private root: TrieNode<T>;
  private _size: number;

  constructor() {
    this.root = new TrieNode<T>();
    this._size = 0;
  }

  set(key: string, value: T): void {
    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<T>());
      }
      node = node.children.get(char)!;
    }
    if (node.value === undefined) {
      this._size++;
    }
    node.value = value;
  }

  get(key: string): T | undefined {
    const node = this.findNode(key);
    return node?.value;
  }

  has(key: string): boolean {
    const node = this.findNode(key);
    return node?.value !== undefined;
  }

  delete(key: string): boolean {
    const path: [TrieNode<T>, string][] = [];
    let node = this.root;

    for (const char of key) {
      if (!node.children.has(char)) {
        return false;
      }
      path.push([node, char]);
      node = node.children.get(char)!;
    }

    if (node.value === undefined) {
      return false;
    }

    node.value = undefined;
    this._size--;

    if (node.children.size === 0) {
      for (let i = path.length - 1; i >= 0; i--) {
        const [parent, char] = path[i]!;
        const child = parent.children.get(char)!;
        if (child.children.size === 0 && child.value === undefined) {
          parent.children.delete(char);
        } else {
          break;
        }
      }
    }

    return true;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = new TrieNode<T>();
    this._size = 0;
  }

  keysWithPrefix(prefix: string): string[] {
    const node = this.findNode(prefix);
    if (!node) {
      return [];
    }
    const result: string[] = [];
    this.collectKeys(node, prefix, result);
    return result;
  }

  valuesWithPrefix(prefix: string): T[] {
    const node = this.findNode(prefix);
    if (!node) {
      return [];
    }
    const result: T[] = [];
    this.collectValues(node, result);
    return result;
  }

  entriesWithPrefix(prefix: string): [string, T][] {
    const node = this.findNode(prefix);
    if (!node) {
      return [];
    }
    const result: [string, T][] = [];
    this.collectEntries(node, prefix, result);
    return result;
  }

  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== undefined;
  }

  longestPrefixOf(query: string): string | undefined {
    let node = this.root;
    let longestPrefix: string | undefined = undefined;

    if (node.value !== undefined) {
      longestPrefix = '';
    }

    for (let i = 0; i < query.length; i++) {
      const char = query[i]!;
      if (!node.children.has(char)) {
        break;
      }
      node = node.children.get(char)!;
      if (node.value !== undefined) {
        longestPrefix = query.slice(0, i + 1);
      }
    }

    return longestPrefix;
  }

  private findNode(key: string): TrieNode<T> | undefined {
    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) {
        return undefined;
      }
      node = node.children.get(char)!;
    }
    return node;
  }

  private collectKeys(node: TrieNode<T>, prefix: string, result: string[]): void {
    if (node.value !== undefined) {
      result.push(prefix);
    }
    for (const [char, child] of node.children) {
      this.collectKeys(child, prefix + char, result);
    }
  }

  private collectValues(node: TrieNode<T>, result: T[]): void {
    if (node.value !== undefined) {
      result.push(node.value);
    }
    for (const child of node.children.values()) {
      this.collectValues(child, result);
    }
  }

  private collectEntries(node: TrieNode<T>, prefix: string, result: [string, T][]): void {
    if (node.value !== undefined) {
      result.push([prefix, node.value]);
    }
    for (const [char, child] of node.children) {
      this.collectEntries(child, prefix + char, result);
    }
  }

  toString(): string {
    return `TrieMap3({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'TrieMap3'
  }
}

class TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  value: T | undefined;

  constructor() {
    this.children = new Map<string, TrieNode<T>>();
    this.value = undefined;
  }
}
