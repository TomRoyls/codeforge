import type { Comparator, BPlusTreeOptions, Entry } from "./types.js";

class LeafNode<K, V> {
  keys: K[] = [];
  values: V[] = [];
  prev: LeafNode<K, V> | null = null;
  next: LeafNode<K, V> | null = null;
}

class InternalNode<K, V> {
  keys: K[] = [];
  children: (InternalNode<K, V> | LeafNode<K, V>)[] = [];
}

type Node<K, V> = InternalNode<K, V> | LeafNode<K, V>;

export class BPlusTree<K, V> {
  private root: Node<K, V>;
  private _size: number = 0;
  private readonly order: number;
  private readonly maxKeys: number;
  private readonly minKeys: number;
  private readonly compare: Comparator<K>;
  private headLeaf: LeafNode<K, V> | null = null;

  constructor(options?: number | BPlusTreeOptions<K>) {
    if (typeof options === "number") {
      this.order = options;
      this.compare = this.defaultCompare;
    } else {
      const opts = options ?? {};
      this.order = opts.order ?? 32;
      this.compare = opts.comparator ?? this.defaultCompare;
    }
    if (this.order < 3) {
      throw new RangeError("B+ Tree order must be at least 3");
    }
    this.maxKeys = this.order - 1;
    this.minKeys = Math.ceil(this.order / 2) - 1;
    const leaf = new LeafNode<K, V>();
    this.root = leaf;
    this.headLeaf = leaf;
  }

  private defaultCompare(a: K, b: K): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  private isLeaf(node: Node<K, V>): node is LeafNode<K, V> {
    return node instanceof LeafNode;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(key: K, value: V): void {
    const root = this.root;
    if (this.isLeaf(root) && root.keys.length < this.maxKeys) {
      this.insertIntoLeaf(root, key, value);
      return;
    }
    if (this.isLeaf(root)) {
      this.insertIntoLeafAndSplit(root, key, value);
      if (root.keys.length > this.maxKeys) {
        const newRoot = new InternalNode<K, V>();
        newRoot.children.push(root);
        this.splitLeafChild(newRoot, 0, root);
        this.root = newRoot;
      }
      return;
    }
    if ((root as InternalNode<K, V>).keys.length >= this.maxKeys) {
      const newRoot = new InternalNode<K, V>();
      newRoot.children.push(this.root);
      this.splitChild(newRoot, 0);
      this.root = newRoot;
    }
    this.insertInternal(this.root, key, value);
  }

  private insertIntoLeaf(leaf: LeafNode<K, V>, key: K, value: V): void {
    let i = 0;
    while (i < leaf.keys.length && this.compare(key, leaf.keys[i]!) > 0) {
      i++;
    }
    if (i < leaf.keys.length && this.compare(key, leaf.keys[i]!) === 0) {
      leaf.values[i] = value;
      return;
    }
    leaf.keys.splice(i, 0, key);
    leaf.values.splice(i, 0, value);
    this._size++;
  }

  private insertInternal(node: Node<K, V>, key: K, value: V): void {
    if (this.isLeaf(node)) {
      if (node.keys.length >= this.maxKeys) {
        this.insertIntoLeafAndSplit(node, key, value);
      } else {
        this.insertIntoLeaf(node, key, value);
      }
      return;
    }

    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) >= 0) {
      i++;
    }

    const child = node.children[i]!;

    if (this.isLeaf(child)) {
      if (child.keys.length >= this.maxKeys) {
        this.insertIntoLeafAndSplit(child, key, value);

        if (child.keys.length > this.maxKeys) {
          this.splitLeafChild(node, i, child);
        }
      } else {
        this.insertIntoLeaf(child, key, value);
      }
    } else {
      const internalChild = child as InternalNode<K, V>;
      if (internalChild.keys.length >= this.maxKeys) {
        this.splitChild(node, i);
        if (this.compare(key, node.keys[i]!) >= 0) {
          i++;
        }
      }
      this.insertInternal(node.children[i]!, key, value);
    }
  }

  private insertIntoLeafAndSplit(
    leaf: LeafNode<K, V>,
    key: K,
    value: V
  ): void {
    let i = 0;
    while (i < leaf.keys.length && this.compare(key, leaf.keys[i]!) > 0) {
      i++;
    }
    if (i < leaf.keys.length && this.compare(key, leaf.keys[i]!) === 0) {
      leaf.values[i] = value;
      return;
    }
    leaf.keys.splice(i, 0, key);
    leaf.values.splice(i, 0, value);
    this._size++;
  }

  private splitLeafChild(
    parent: InternalNode<K, V>,
    index: number,
    leaf: LeafNode<K, V>
  ): void {
    const mid = Math.ceil(leaf.keys.length / 2);
    const newLeaf = new LeafNode<K, V>();

    newLeaf.keys = leaf.keys.splice(mid);
    newLeaf.values = leaf.values.splice(mid);

    newLeaf.next = leaf.next;
    newLeaf.prev = leaf;
    if (leaf.next) {
      leaf.next.prev = newLeaf;
    }
    leaf.next = newLeaf;

    const promotedKey = newLeaf.keys[0]!;
    parent.keys.splice(index, 0, promotedKey);
    parent.children.splice(index + 1, 0, newLeaf);
  }

  private splitChild(parent: InternalNode<K, V>, index: number): void {
    const child = parent.children[index]! as InternalNode<K, V>;
    const mid = Math.floor(child.keys.length / 2);
    const promotedKey = child.keys[mid]!;

    const sibling = new InternalNode<K, V>();
    sibling.keys = child.keys.splice(mid + 1);
    sibling.children = child.children.splice(mid + 1);
    child.keys.splice(mid);

    parent.keys.splice(index, 0, promotedKey);
    parent.children.splice(index + 1, 0, sibling);
  }

  get(key: K): V | undefined {
    const leaf = this.findLeaf(key);
    if (!leaf) return undefined;
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(key, leaf.keys[i]!) === 0) {
        return leaf.values[i];
      }
    }
    return undefined;
  }

  has(key: K): boolean {
    const leaf = this.findLeaf(key);
    if (!leaf) return false;
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(key, leaf.keys[i]!) === 0) {
        return true;
      }
    }
    return false;
  }

  private findLeaf(key: K): LeafNode<K, V> | null {
    let node = this.root;
    while (!this.isLeaf(node)) {
      let i = 0;
      while (i < node.keys.length && this.compare(key, node.keys[i]!) >= 0) {
        i++;
      }
      node = node.children[i]!;
    }
    return node;
  }

  update(key: K, value: V): boolean {
    const leaf = this.findLeaf(key);
    if (!leaf) return false;
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(key, leaf.keys[i]!) === 0) {
        leaf.values[i] = value;
        return true;
      }
    }
    return false;
  }

  delete(key: K): boolean {
    if (this._size === 0) return false;
    const result = this.deleteFromTree(this.root, key);
    if (!this.isLeaf(this.root) && (this.root as InternalNode<K, V>).keys.length === 0) {
      this.root = (this.root as InternalNode<K, V>).children[0]!;
    }
    return result;
  }

  private deleteFromTree(node: Node<K, V>, key: K): boolean {
    if (this.isLeaf(node)) {
      return this.deleteFromLeaf(node, key);
    }

    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) >= 0) {
      i++;
    }

    const child = node.children[i]!;

    if (this.isLeaf(child)) {
      const deleted = this.deleteFromLeaf(child, key);
      if (deleted) {
        this.fixAfterDelete(node, i);
      }
      return deleted;
    }

    const deleted = this.deleteFromTree(child, key);
    if (deleted) {
      this.fixInternalAfterDelete(node, i);
    }
    return deleted;
  }

  private deleteFromLeaf(leaf: LeafNode<K, V>, key: K): boolean {
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(key, leaf.keys[i]!) === 0) {
        leaf.keys.splice(i, 1);
        leaf.values.splice(i, 1);
        this._size--;
        return true;
      }
    }
    return false;
  }

  private fixAfterDelete(parent: InternalNode<K, V>, childIndex: number): void {
    const child = parent.children[childIndex]! as LeafNode<K, V>;

    if (child.keys.length >= this.minKeys || parent.children.length <= 1) {
      return;
    }

    if (childIndex > 0) {
      const leftSibling = parent.children[childIndex - 1]! as LeafNode<K, V>;
      if (leftSibling.keys.length > this.minKeys) {
        this.borrowFromLeftLeaf(parent, childIndex);
        return;
      }
    }

    if (childIndex < parent.children.length - 1) {
      const rightSibling = parent.children[childIndex + 1]! as LeafNode<K, V>;
      if (rightSibling.keys.length > this.minKeys) {
        this.borrowFromRightLeaf(parent, childIndex);
        return;
      }
    }

    if (childIndex > 0) {
      this.mergeLeaves(parent, childIndex - 1);
    } else {
      this.mergeLeaves(parent, childIndex);
    }
  }

  private borrowFromLeftLeaf(parent: InternalNode<K, V>, childIndex: number): void {
    const child = parent.children[childIndex]! as LeafNode<K, V>;
    const leftSibling = parent.children[childIndex - 1]! as LeafNode<K, V>;

    const borrowedKey = leftSibling.keys.pop()!;
    const borrowedValue = leftSibling.values.pop()!;

    child.keys.unshift(borrowedKey);
    child.values.unshift(borrowedValue);

    parent.keys[childIndex - 1] = child.keys[0]!;
  }

  private borrowFromRightLeaf(parent: InternalNode<K, V>, childIndex: number): void {
    const child = parent.children[childIndex]! as LeafNode<K, V>;
    const rightSibling = parent.children[childIndex + 1]! as LeafNode<K, V>;

    const borrowedKey = rightSibling.keys.shift()!;
    const borrowedValue = rightSibling.values.shift()!;

    child.keys.push(borrowedKey);
    child.values.push(borrowedValue);

    parent.keys[childIndex] = rightSibling.keys[0]!;
  }

  private mergeLeaves(parent: InternalNode<K, V>, leftIndex: number): void {
    const left = parent.children[leftIndex]! as LeafNode<K, V>;
    const right = parent.children[leftIndex + 1]! as LeafNode<K, V>;

    left.keys.push(...right.keys);
    left.values.push(...right.values);

    left.next = right.next;
    if (right.next) {
      right.next.prev = left;
    }

    parent.keys.splice(leftIndex, 1);
    parent.children.splice(leftIndex + 1, 1);
  }

  private fixInternalAfterDelete(parent: InternalNode<K, V>, childIndex: number): void {
    const child = parent.children[childIndex]! as InternalNode<K, V>;

    if (child.keys.length >= this.minKeys || parent.children.length <= 1) {
      return;
    }

    if (childIndex > 0) {
      const leftSibling = parent.children[childIndex - 1]! as InternalNode<K, V>;
      if (leftSibling.keys.length > this.minKeys) {
        this.borrowFromLeftInternal(parent, childIndex);
        return;
      }
    }

    if (childIndex < parent.children.length - 1) {
      const rightSibling = parent.children[childIndex + 1]! as InternalNode<K, V>;
      if (rightSibling.keys.length > this.minKeys) {
        this.borrowFromRightInternal(parent, childIndex);
        return;
      }
    }

    if (childIndex > 0) {
      this.mergeInternal(parent, childIndex - 1);
    } else {
      this.mergeInternal(parent, childIndex);
    }
  }

  private borrowFromLeftInternal(parent: InternalNode<K, V>, childIndex: number): void {
    const child = parent.children[childIndex]! as InternalNode<K, V>;
    const leftSibling = parent.children[childIndex - 1]! as InternalNode<K, V>;

    const sepKey = parent.keys[childIndex - 1]!;
    parent.keys[childIndex - 1] = leftSibling.keys.pop()!;

    child.keys.unshift(sepKey);
    child.children.unshift(leftSibling.children.pop()!);
  }

  private borrowFromRightInternal(parent: InternalNode<K, V>, childIndex: number): void {
    const child = parent.children[childIndex]! as InternalNode<K, V>;
    const rightSibling = parent.children[childIndex + 1]! as InternalNode<K, V>;

    const sepKey = parent.keys[childIndex]!;
    parent.keys[childIndex] = rightSibling.keys.shift()!;

    child.keys.push(sepKey);
    child.children.push(rightSibling.children.shift()!);
  }

  private mergeInternal(parent: InternalNode<K, V>, leftIndex: number): void {
    const left = parent.children[leftIndex]! as InternalNode<K, V>;
    const right = parent.children[leftIndex + 1]! as InternalNode<K, V>;

    left.keys.push(parent.keys[leftIndex]!);
    left.keys.push(...right.keys);
    left.children.push(...right.children);

    parent.keys.splice(leftIndex, 1);
    parent.children.splice(leftIndex + 1, 1);
  }

  clear(): void {
    const leaf = new LeafNode<K, V>();
    this.root = leaf;
    this.headLeaf = leaf;
    this._size = 0;
  }

  min(): Entry<K, V> | undefined {
    if (this._size === 0) return undefined;
    const leaf = this.getLeftmostLeaf();
    if (!leaf || leaf.keys.length === 0) return undefined;
    return { key: leaf.keys[0]!, value: leaf.values[0]! };
  }

  max(): Entry<K, V> | undefined {
    if (this._size === 0) return undefined;
    const leaf = this.getRightmostLeaf();
    if (!leaf || leaf.keys.length === 0) return undefined;
    const last = leaf.keys.length - 1;
    return { key: leaf.keys[last]!, value: leaf.values[last]! };
  }

  private getLeftmostLeaf(): LeafNode<K, V> | null {
    let node = this.root;
    while (!this.isLeaf(node)) {
      node = node.children[0]!;
    }
    return node;
  }

  private getRightmostLeaf(): LeafNode<K, V> | null {
    let node = this.root;
    while (!this.isLeaf(node)) {
      node = node.children[node.children.length - 1]!;
    }
    return node;
  }

  range(lo: K, hi: K): Entry<K, V>[] {
    const result: Entry<K, V>[] = [];
    if (this._size === 0) return result;

    let leaf = this.findLeaf(lo);
    while (leaf) {
      for (let i = 0; i < leaf.keys.length; i++) {
        const cmpLo = this.compare(leaf.keys[i]!, lo);
        const cmpHi = this.compare(leaf.keys[i]!, hi);
        if (cmpLo >= 0 && cmpHi <= 0) {
          result.push({ key: leaf.keys[i]!, value: leaf.values[i]! });
        }
        if (cmpHi > 0) return result;
      }
      leaf = leaf.next;
    }
    return result;
  }

  keys(): K[] {
    const result: K[] = [];
    let leaf = this.headLeaf;
    while (leaf) {
      result.push(...leaf.keys);
      leaf = leaf.next;
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let leaf = this.headLeaf;
    while (leaf) {
      result.push(...leaf.values);
      leaf = leaf.next;
    }
    return result;
  }

  entries(): Entry<K, V>[] {
    const result: Entry<K, V>[] = [];
    let leaf = this.headLeaf;
    while (leaf) {
      for (let i = 0; i < leaf.keys.length; i++) {
        result.push({ key: leaf.keys[i]!, value: leaf.values[i]! });
      }
      leaf = leaf.next;
    }
    return result;
  }

  forEach(callback: (value: V, key: K, tree: BPlusTree<K, V>) => void): void {
    let leaf = this.headLeaf;
    while (leaf) {
      for (let i = 0; i < leaf.keys.length; i++) {
        callback(leaf.values[i]!, leaf.keys[i]!, this);
      }
      leaf = leaf.next;
    }
  }

  toArray(): Entry<K, V>[] {
    return this.entries();
  }

  findFirstKey(key: K): Entry<K, V> | undefined {
    const leaf = this.findLeaf(key);
    if (!leaf) return undefined;
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(leaf.keys[i]!, key) >= 0) {
        return { key: leaf.keys[i]!, value: leaf.values[i]! };
      }
    }
    if (leaf.next) {
      for (let i = 0; i < leaf.next.keys.length; i++) {
        if (this.compare(leaf.next.keys[i]!, key) >= 0) {
          return { key: leaf.next.keys[i]!, value: leaf.next.values[i]! };
        }
      }
    }
    return undefined;
  }

  findLastKey(key: K): Entry<K, V> | undefined {
    const leaf = this.findLeaf(key);
    if (!leaf) return undefined;
    for (let i = leaf.keys.length - 1; i >= 0; i--) {
      if (this.compare(leaf.keys[i]!, key) <= 0) {
        return { key: leaf.keys[i]!, value: leaf.values[i]! };
      }
    }
    if (leaf.prev) {
      for (let i = leaf.prev.keys.length - 1; i >= 0; i--) {
        if (this.compare(leaf.prev.keys[i]!, key) <= 0) {
          return { key: leaf.prev.keys[i]!, value: leaf.prev.values[i]! };
        }
      }
    }
    return undefined;
  }

  *[Symbol.iterator](): Iterator<Entry<K, V>> {
    let leaf = this.headLeaf;
    while (leaf) {
      for (let i = 0; i < leaf.keys.length; i++) {
        yield { key: leaf.keys[i]!, value: leaf.values[i]! };
      }
      leaf = leaf.next;
    }
  }

  toString(): string {
    return `${BPlusTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BPlusTree', size: this.size, items: this.toArray() }
  }
}
