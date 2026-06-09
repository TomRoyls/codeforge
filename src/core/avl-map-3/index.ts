type Node<K, V> = {
  key: K;
  value: V;
  left: Node<K, V> | null;
  right: Node<K, V> | null;
  height: number;
};

function height<K, V>(node: Node<K, V> | null): number {
  return node ? node.height : 0;
}

function updateHeight<K, V>(node: Node<K, V>): void {
  node.height = Math.max(height(node.left), height(node.right)) + 1;
}

function balanceFactor<K, V>(node: Node<K, V>): number {
  return height(node.left) - height(node.right);
}

function rotateRight<K, V>(y: Node<K, V>): Node<K, V> {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHeight(y);
  updateHeight(x);

  return x;
}

function rotateLeft<K, V>(x: Node<K, V>): Node<K, V> {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHeight(x);
  updateHeight(y);

  return y;
}

function balance<K, V>(node: Node<K, V>): Node<K, V> {
  updateHeight(node);
  const bf = balanceFactor(node);

  if (bf > 1) {
    if (balanceFactor(node.left!) < 0) {
      node.left = rotateLeft(node.left!);
    }
    return rotateRight(node);
  }

  if (bf < -1) {
    if (balanceFactor(node.right!) > 0) {
      node.right = rotateRight(node.right!);
    }
    return rotateLeft(node);
  }

  return node;
}

function findMin<K, V>(node: Node<K, V>): Node<K, V> {
  while (node.left) {
    node = node.left;
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
    return { key, value, left: null, right: null, height: 1 };
  }

  const cmp = compare(key, node.key);
  if (cmp < 0) {
    node.left = insertNode(node.left, key, value, compare);
  } else if (cmp > 0) {
    node.right = insertNode(node.right, key, value, compare);
  } else {
    node.value = value;
    return node;
  }

  return balance(node);
}

function deleteNode<K, V>(
  node: Node<K, V> | null,
  key: K,
  compare: (a: K, b: K) => number
): Node<K, V> | null {
  if (!node) {
    return null;
  }

  const cmp = compare(key, node.key);
  if (cmp < 0) {
    node.left = deleteNode(node.left, key, compare);
  } else if (cmp > 0) {
    node.right = deleteNode(node.right, key, compare);
  } else {
    if (!node.left || !node.right) {
      return node.left || node.right;
    }

    const minNode = findMin(node.right);
    node.key = minNode.key;
    node.value = minNode.value;
    node.right = deleteNode(node.right, minNode.key, compare);
  }

  return balance(node);
}

function findNode<K, V>(
  node: Node<K, V> | null,
  key: K,
  compare: (a: K, b: K) => number
): Node<K, V> | null {
  while (node) {
    const cmp = compare(key, node.key);
    if (cmp < 0) {
      node = node.left;
    } else if (cmp > 0) {
      node = node.right;
    } else {
      return node;
    }
  }
  return null;
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

function inOrderForEach<K, V>(
  node: Node<K, V> | null,
  callback: (key: K, value: V) => void
): void {
  if (!node) return;
  inOrderForEach(node.left, callback);
  callback(node.key, node.value);
  inOrderForEach(node.right, callback);
}

function findMinNode<K, V>(node: Node<K, V> | null): K | undefined {
  if (!node) return undefined;
  while (node.left) {
    node = node.left;
  }
  return node.key;
}

function findMaxNode<K, V>(node: Node<K, V> | null): K | undefined {
  if (!node) return undefined;
  while (node.right) {
    node = node.right;
  }
  return node.key;
}

export class AVLMap3<K, V> {
  private _root: Node<K, V> | null = null;
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
    const node = findNode(this._root, key, this.compare);
    if (node) {
      node.value = value;
    } else {
      this._root = insertNode(this._root, key, value, this.compare);
      this._size++;
    }
  }

  get(key: K): V | undefined {
    const node = findNode(this._root, key, this.compare);
    return node ? node.value : undefined;
  }

  has(key: K): boolean {
    return findNode(this._root, key, this.compare) !== null;
  }

  delete(key: K): boolean {
    const node = findNode(this._root, key, this.compare);
    if (!node) return false;
    this._root = deleteNode(this._root, key, this.compare);
    this._size--;
    return true;
  }

  min(): K | undefined {
    return findMinNode(this._root);
  }

  max(): K | undefined {
    return findMaxNode(this._root);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._root = null;
    this._size = 0;
  }

  keys(): K[] {
    const result: K[] = [];
    inOrderKeys(this._root, result);
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    inOrderValues(this._root, result);
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    inOrderEntries(this._root, result);
    return result;
  }

  forEach(callback: (key: K, value: V) => void): void {
    inOrderForEach(this._root, callback);
  }


  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const val of this.entries()) {
      yield val;
    }
  }
}
