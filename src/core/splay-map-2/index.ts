type Node<K, V> = {
  key: K;
  value: V;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
};

function rotateRight<K, V>(x: Node<K, V>): Node<K, V> {
  const y = x.left!;
  x.left = y.right;
  y.right = x;
  return y;
}

function rotateLeft<K, V>(x: Node<K, V>): Node<K, V> {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  return y;
}

function splay<K, V>(
  root: Node<K, V> | null,
  key: K,
  compare: (a: K, b: K) => number
): Node<K, V> | null {
  if (!root) return null;

  const cmp = compare(key, root.key);

  if (cmp < 0) {
    if (!root.left) return root;
    const cmpLeft = compare(key, root.left.key);
    if (cmpLeft < 0) {
      root.left = splay(root.left, key, compare);
      root = rotateRight(root);
    } else if (cmpLeft > 0) {
      root.left = splay(root.left, key, compare);
      if (root.left && root.left.right) {
        root.left = rotateLeft(root.left);
      }
      if (root.left) {
        root = rotateRight(root);
      }
    } else {
      root = rotateRight(root);
    }
  } else if (cmp > 0) {
    if (!root.right) return root;
    const cmpRight = compare(key, root.right.key);
    if (cmpRight < 0) {
      root.right = splay(root.right, key, compare);
      if (root.right && root.right.left) {
        root.right = rotateRight(root.right);
      }
      if (root.right) {
        root = rotateLeft(root);
      }
    } else if (cmpRight > 0) {
      root.right = splay(root.right, key, compare);
      root = rotateLeft(root);
    } else {
      root = rotateLeft(root);
    }
  }
  return root;
}

function findNode<K, V>(
  node: Node<K, V> | null,
  key: K,
  compare: (a: K, b: K) => number
): Node<K, V> | null {
  if (!node) return null;
  const cmp = compare(key, node.key);
  if (cmp < 0) {
    return findNode(node.left, key, compare);
  } else if (cmp > 0) {
    return findNode(node.right, key, compare);
  }
  return node;
}

function findMinNode<K, V>(node: Node<K, V>): Node<K, V> {
  while (node.left) {
    node = node.left;
  }
  return node;
}

function findMaxNode<K, V>(node: Node<K, V>): Node<K, V> {
  while (node.right) {
    node = node.right;
  }
  return node;
}

function insertNode<K, V>(
  node: Node<K, V> | null,
  key: K,
  value: V,
  compare: (a: K, b: K) => number
): Node<K, V> {
  if (!node) {
    return { key, value, left: null, right: null };
  }
  const cmp = compare(key, node.key);
  if (cmp < 0) {
    node.left = insertNode(node.left, key, value, compare);
  } else if (cmp > 0) {
    node.right = insertNode(node.right, key, value, compare);
  } else {
    node.value = value;
  }
  return node;
}

function deleteNode<K, V>(
  node: Node<K, V> | null,
  key: K,
  compare: (a: K, b: K) => number
): Node<K, V> | null {
  if (!node) return null;
  const cmp = compare(key, node.key);
  if (cmp < 0) {
    node.left = deleteNode(node.left, key, compare);
  } else if (cmp > 0) {
    node.right = deleteNode(node.right, key, compare);
  } else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    const minNode = findMinNode(node.right);
    node.key = minNode.key;
    node.value = minNode.value;
    node.right = deleteNode(node.right, minNode.key, compare);
  }
  return node;
}

function inOrderKeys<K, V>(node: Node<K, V> | null, result: K[]): void {
  if (!node) return;
  inOrderKeys(node.left, result);
  result.push(node.key);
  inOrderKeys(node.right, result);
}

function inOrderValues<K, V>(node: Node<K, V> | null, result: V[]): void {
  if (!node) return;
  inOrderValues(node.left, result);
  result.push(node.value);
  inOrderValues(node.right, result);
}

function inOrderEntries<K, V>(
  node: Node<K, V> | null,
  result: Array<[K, V]>
): void {
  if (!node) return;
  inOrderEntries(node.left, result);
  result.push([node.key, node.value]);
  inOrderEntries(node.right, result);
}

export class SplayMap2<K, V> {
  private root: Node<K, V> | null = null;
  private _size: number = 0;
  private readonly compare: (a: K, b: K) => number;

  constructor(compare?: (a: K, b: K) => number) {
    this.compare =
      compare ||
      ((a: K, b: K) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
  }

  set(key: K, value: V): void {
    this.root = splay(this.root, key, this.compare);
    if (this.root && this.compare(key, this.root.key) === 0) {
      this.root.value = value;
    } else {
      this.root = insertNode(this.root, key, value, this.compare);
      this._size++;
    }
  }

  get(key: K): V | undefined {
    this.root = splay(this.root, key, this.compare);
    if (this.root && this.compare(key, this.root.key) === 0) {
      return this.root.value;
    }
    return undefined;
  }

  has(key: K): boolean {
    this.root = splay(this.root, key, this.compare);
    return this.root !== null && this.compare(key, this.root.key) === 0;
  }

  delete(key: K): boolean {
    const node = findNode(this.root, key, this.compare);
    if (!node) return false;
    this.root = deleteNode(this.root, key, this.compare);
    this._size--;
    return true;
  }

  min(): K | undefined {
    if (!this.root) return undefined;
    const node = findMinNode(this.root);
    return node.key;
  }

  max(): K | undefined {
    if (!this.root) return undefined;
    const node = findMaxNode(this.root);
    return node.key;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  keys(): K[] {
    const result: K[] = [];
    inOrderKeys(this.root, result);
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    inOrderValues(this.root, result);
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    inOrderEntries(this.root, result);
    return result;
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  forEach(callback: (entry: [K,  V], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toArray(): any[] {
    return [...this]
  }

  toString(): string {
    return `SplayMap2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SplayMap2', size: this.size, items: this.toArray() }
  }
}
