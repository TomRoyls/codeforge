type Node<T> =
  | { type: 'leaf'; key: string; value: T; hash: number }
  | { type: 'collision'; hash: number; entries: [string, T][] }
  | { type: 'internal'; bitmap: number; children: Node<T>[] };

const HASH_BITS = 5;
const HASH_MASK = (1 << HASH_BITS) - 1;

function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function getIndex(hash: number, level: number): number {
  return (hash >>> (level * HASH_BITS)) & HASH_MASK;
}

function createBitmapNode<T>(bitmap: number, children: Node<T>[]): Node<T> {
  return { type: 'internal', bitmap, children };
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  x = x + (x >>> 8);
  x = x + (x >>> 16);
  return x & 0x7f;
}

function getChildIndex(bitmap: number, index: number): number {
  const mask = 1 << index;
  if ((bitmap & mask) === 0) return -1;
  return popcount(bitmap & (mask - 1));
}

function setChild<T>(node: Node<T>, index: number, child: Node<T>): Node<T> {
  if (node.type !== 'internal') return node;
  const mask = 1 << index;
  const pos = getChildIndex(node.bitmap, index);

  if (pos >= 0) {
    const newChildren = [...node.children];
    newChildren[pos] = child;
    return createBitmapNode(node.bitmap, newChildren);
  }

  const pos2 = popcount(node.bitmap & (mask - 1));
  const newChildren2 = [
    ...node.children.slice(0, pos2),
    child,
    ...node.children.slice(pos2),
  ];
  return createBitmapNode(node.bitmap | mask, newChildren2);
}

function removeChild<T>(node: Node<T>, index: number): Node<T> | null {
  if (node.type !== 'internal') return node;
  const mask = 1 << index;
  const pos = getChildIndex(node.bitmap, index);
  if (pos < 0) return node;

  if (node.children.length === 1) return null;

  const newChildren = [...node.children];
  newChildren.splice(pos, 1);
  return createBitmapNode(node.bitmap ^ mask, newChildren);
}

export class Hamt3<T> {
  private root: Node<T> | null;
  private _size: number;

  private constructor(root: Node<T> | null, size: number) {
    if (size < 1) throw new RangeError('size must be >= 1')

    this.root = root;
    this._size = size;
  }

  static createEmpty<T>(): Hamt3<T> {
    return new Hamt3<T>(null, 0);
  }

  static create<T>(root: Node<T> | null, size: number): Hamt3<T> {
    return new Hamt3<T>(root, size);
  }

  set(key: string, value: T): Hamt3<T> {
    const hash = hashString(key);
    const { newRoot, isNewKey } = this.insert(this.root, hash, key, value, 0);
    const newSize = isNewKey ? this._size + 1 : this._size;
    return Hamt3.create(newRoot, newSize);
  }

  private insert(
    node: Node<T> | null,
    hash: number,
    key: string,
    value: T,
    level: number,
  ): { newRoot: Node<T>; isNewKey: boolean } {
    if (node === null) {
      return { newRoot: { type: 'leaf', key, value, hash }, isNewKey: true };
    }

    if (node.type === 'leaf') {
      if (node.key === key) {
        return { newRoot: { type: 'leaf', key, value, hash }, isNewKey: false };
      }

      const otherHash = node.hash;
      if (otherHash === hash) {
        return {
          newRoot: {
            type: 'collision',
            hash,
            entries: [
              [node.key, node.value],
              [key, value],
            ],
          },
          isNewKey: true,
        };
      }

      const index1 = getIndex(hash, level);
      const index2 = getIndex(otherHash, level);

      if (index1 === index2) {
        const { newRoot: child, isNewKey } = this.insert(node, hash, key, value, level + 1);
        return { newRoot: createBitmapNode(1 << index1, [child]), isNewKey };
      }

      return {
        newRoot: createBitmapNode((1 << index1) | (1 << index2), [
          index1 < index2
            ? { type: 'leaf', key, value, hash }
            : node,
          index1 < index2
            ? node
            : { type: 'leaf', key, value, hash },
        ]),
        isNewKey: true,
      };
    }

    if (node.type === 'collision') {
      if (node.hash !== hash) {
        const index = getIndex(hash, level);
        const child = { type: 'leaf', key, value, hash } as Node<T>;
        return { newRoot: createBitmapNode(1 << index, [child, node]), isNewKey: true };
      }

      const entries = [...node.entries];
      const idx = entries.findIndex((e) => e[0] === key);
      if (idx >= 0) {
        entries[idx] = [key, value];
        return { newRoot: { type: 'collision', hash, entries }, isNewKey: false };
      } else {
        entries.push([key, value]);
        return { newRoot: { type: 'collision', hash, entries }, isNewKey: true };
      }
    }

    const index = getIndex(hash, level);
    const pos = getChildIndex(node.bitmap, index);

    if (pos < 0) {
      const child = { type: 'leaf', key, value, hash } as Node<T>;
      return { newRoot: setChild(node, index, child), isNewKey: true };
    }

    const child = node.children[pos]!;
    const { newRoot: newChild, isNewKey } = this.insert(child, hash, key, value, level + 1);
    return { newRoot: setChild(node, index, newChild), isNewKey };
  }

  get(key: string): T | undefined {
    const hash = hashString(key);
    return this.lookup(this.root, hash, key, 0);
  }

  private lookup(
    node: Node<T> | null,
    hash: number,
    key: string,
    level: number,
  ): T | undefined {
    if (node === null) return undefined;

    if (node.type === 'leaf') {
      return node.key === key ? node.value : undefined;
    }

    if (node.type === 'collision') {
      const entry = node.entries.find((e) => e[0] === key);
      return entry ? entry[1] : undefined;
    }

    const index = getIndex(hash, level);
    const pos = getChildIndex(node.bitmap, index);
    if (pos < 0) return undefined;

    return this.lookup(node.children[pos]!, hash, key, level + 1);
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): Hamt3<T> {
    const hash = hashString(key);
    const { newRoot, deleted } = this.remove(this.root, hash, key, 0);
    if (!deleted) return this;
    const newSize = this._size - 1;
    return Hamt3.create(newRoot, newSize);
  }

  private remove(
    node: Node<T> | null,
    hash: number,
    key: string,
    level: number,
  ): { newRoot: Node<T> | null; deleted: boolean } {
    if (node === null) return { newRoot: null, deleted: false };

    if (node.type === 'leaf') {
      return node.key === key
        ? { newRoot: null, deleted: true }
        : { newRoot: node, deleted: false };
    }

    if (node.type === 'collision') {
      const idx = node.entries.findIndex((e) => e[0] === key);
      if (idx < 0) return { newRoot: node, deleted: false };

      if (node.entries.length === 2) {
        const otherIdx = idx === 0 ? 1 : 0;
        return {
          newRoot: {
            type: 'leaf',
            key: node.entries[otherIdx]![0]!,
            value: node.entries[otherIdx]![1]!,
            hash: node.hash,
          },
          deleted: true,
        };
      }

      const newEntries = [...node.entries];
      newEntries.splice(idx, 1);
      return {
        newRoot: { type: 'collision', hash: node.hash, entries: newEntries },
        deleted: true,
      };
    }

    const index = getIndex(hash, level);
    const pos = getChildIndex(node.bitmap, index);
    if (pos < 0) return { newRoot: node, deleted: false };

    const { newRoot: newChild, deleted } = this.remove(
      node.children[pos]!,
      hash,
      key,
      level + 1,
    );

    if (!deleted) return { newRoot: node, deleted: false };

    if (newChild === null) {
      const newNode = removeChild(node, index);
      if (newNode === null) return { newRoot: null, deleted: true };

      if (newNode.type === 'internal' && newNode.children.length === 1) {
        const onlyChild = newNode.children[0]!;
        if (onlyChild.type !== 'internal') {
          return { newRoot: onlyChild, deleted: true };
        }
      }

      return { newRoot: newNode, deleted: true };
    }

    const newChildren = [...node.children];
    newChildren[pos] = newChild;
    return {
      newRoot: createBitmapNode(node.bitmap, newChildren),
      deleted: true,
    };
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  keys(): string[] {
    const result: string[] = [];
    this.collectKeys(this.root, result);
    return result;
  }

  private collectKeys(node: Node<T> | null, result: string[]): void {
    if (node === null) return;

    if (node.type === 'leaf') {
      result.push(node.key);
      return;
    }

    if (node.type === 'collision') {
      for (const entry of node.entries) {
        result.push(entry[0]!);
      }
      return;
    }

    for (const child of node.children) {
      this.collectKeys(child, result);
    }
  }

  values(): T[] {
    const result: T[] = [];
    this.collectValues(this.root, result);
    return result;
  }

  private collectValues(node: Node<T> | null, result: T[]): void {
    if (node === null) return;

    if (node.type === 'leaf') {
      result.push(node.value);
      return;
    }

    if (node.type === 'collision') {
      for (const entry of node.entries) {
        result.push(entry[1]!);
      }
      return;
    }

    for (const child of node.children) {
      this.collectValues(child, result);
    }
  }

  entries(): [string, T][] {
    const result: [string, T][] = [];
    this.collectEntries(this.root, result);
    return result;
  }

  private collectEntries(node: Node<T> | null, result: [string, T][]): void {
    if (node === null) return;

    if (node.type === 'leaf') {
      result.push([node.key, node.value]);
      return;
    }

    if (node.type === 'collision') {
      for (const entry of node.entries) {
        result.push(entry);
      }
      return;
    }

    for (const child of node.children) {
      this.collectEntries(child, result);
    }
  }

  forEach(callback: (value: T, key: string) => void): void {
    this.forEachNode(this.root, callback);
  }

  private forEachNode(
    node: Node<T> | null,
    callback: (value: T, key: string) => void,
  ): void {
    if (node === null) return;

    if (node.type === 'leaf') {
      callback(node.value, node.key);
      return;
    }

    if (node.type === 'collision') {
      for (const entry of node.entries) {
        callback(entry[1]!, entry[0]!);
      }
      return;
    }

    for (const child of node.children) {
      this.forEachNode(child, callback);
    }
  }

  clear(): Hamt3<T> {
    return Hamt3.createEmpty();
  }
  *[Symbol.iterator]() {
    yield* this.entries()
  }

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `${Hamt3}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'Hamt3', size: this.size, items: this.toArray() }
  }



  get [Symbol.toStringTag](): string {
    return 'Hamt3'
  }
}
