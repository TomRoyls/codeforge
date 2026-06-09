interface TrieNode<V> {
  children: Map<string, TrieNode<V>>;
  value: V | undefined;
}

export class TrieMap2<V> {
  private root: TrieNode<V>;
  private _size: number;

  constructor() {
    this.root = { children: new Map(), value: undefined };
    this._size = 0;
  }

  set(key: string, value: V): void {
    let node = this.root;
    for (const char of key) {
      let child = node.children.get(char);
      if (!child) {
        child = { children: new Map(), value: undefined };
        node.children.set(char, child);
      }
      node = child;
    }
    if (node.value === undefined) {
      this._size++;
    }
    node.value = value;
  }

  get(key: string): V | undefined {
    const node = this._getNode(key);
    return node ? node.value : undefined;
  }

  has(key: string): boolean {
    const node = this._getNode(key);
    return node !== null && node.value !== undefined;
  }

  delete(key: string): boolean {
    const path: Array<TrieNode<V>> = [];
    let node = this.root;
    for (const char of key) {
      const child = node.children.get(char);
      if (!child) {
        return false;
      }
      path.push(node);
      node = child;
    }

    if (node.value === undefined) {
      return false;
    }

    node.value = undefined;
    this._size--;

    for (let i = key.length - 1; i >= 0; i--) {
      const char = key[i]!;
      const parent = path[i]!;
      const current = parent.children.get(char)!;
      if (current.children.size === 0 && current.value === undefined) {
        parent.children.delete(char);
      } else {
        break;
      }
    }

    return true;
  }

  hasPrefix(prefix: string): boolean {
    return this._getNode(prefix) !== null;
  }

  keysWithPrefix(prefix: string): string[] {
    const node = this._getNode(prefix);
    if (!node) {
      return [];
    }
    const result: string[] = [];
    this._collectKeys(node, prefix, result);
    return result;
  }

  startsWith(prefix: string): string[] {
    return this.keysWithPrefix(prefix);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = { children: new Map(), value: undefined };
    this._size = 0;
  }

  private _getNode(key: string): TrieNode<V> | null {
    let node = this.root;
    for (const char of key) {
      const child = node.children.get(char);
      if (!child) {
        return null;
      }
      node = child;
    }
    return node;
  }

  private _collectKeys(node: TrieNode<V>, prefix: string, result: string[]): void {
    if (node.value !== undefined) {
      result.push(prefix);
    }
    const entries = Array.from(node.children.entries());
    for (const [char, child] of entries) {
      this._collectKeys(child, prefix + char, result);
    }
  }

  *[Symbol.iterator]() {
    yield* this.keysWithPrefix("")
  }

  toArray() {
    return this.keysWithPrefix("")
  }

  toJSON() {
    return { type: 'TrieMap2', size: this.size, items: this.toArray() }
  }
}
