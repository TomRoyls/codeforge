import type { Comparator, BTreeMapOptions, Entry } from "./types.js";

class BTreeNode<K, V> {
  keys: K[] = [];
  values: V[] = [];
  children: BTreeNode<K, V>[] = [];
  leaf: boolean = true;

  constructor(leaf: boolean) {
    this.leaf = leaf;
  }
}

export class BTreeMap<K, V> {
  private root: BTreeNode<K, V>;
  private _size: number = 0;
  private readonly order: number;
  private readonly minKeys: number;
  private readonly maxKeys: number;
  private readonly compare: Comparator<K>;

  constructor(options?: number | BTreeMapOptions<K>) {
    if (typeof options === "number") {
      this.order = options;
      this.compare = this.defaultCompare;
    } else {
      const opts = options ?? {};
      this.order = opts.order ?? 32;
      this.compare = opts.comparator ?? this.defaultCompare;
    }
    if (this.order < 2) {
      throw new RangeError("BTree order must be at least 2");
    }
    this.minKeys = Math.ceil(this.order / 2) - 1;
    this.maxKeys = this.order - 1;
    this.root = new BTreeNode<K, V>(true);
  }

  private defaultCompare(a: K, b: K): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  set(key: K, value: V): void {
    const r = this.root;
    if (r.keys.length === this.maxKeys) {
      const s = new BTreeNode<K, V>(false);
      s.children.push(this.root);
      this.splitChild(s, 0);
      this.root = s;
    }
    this.insertNonFull(this.root, key, value);
  }

  private insertNonFull(node: BTreeNode<K, V>, key: K, value: V): void {
    let i = node.keys.length - 1;

    if (node.leaf) {
      while (i >= 0 && this.compare(key, node.keys[i]!) < 0) {
        i--;
      }
      if (i >= 0 && this.compare(key, node.keys[i]!) === 0) {
        node.values[i] = value;
        return;
      }
      i++;
      node.keys.splice(i, 0, key);
      node.values.splice(i, 0, value);
      this._size++;
    } else {
      while (i >= 0 && this.compare(key, node.keys[i]!) < 0) {
        i--;
      }
      i++;
      if (node.children[i]!.keys.length === this.maxKeys) {
        this.splitChild(node, i);
        if (this.compare(key, node.keys[i]!) > 0) {
          i++;
        }
      }
      this.insertNonFull(node.children[i]!, key, value);
    }
  }

  private splitChild(parent: BTreeNode<K, V>, index: number): void {
    const child = parent.children[index]!;
    const mid = Math.floor(this.order / 2) - 1;
    const sibling = new BTreeNode<K, V>(child.leaf);

    const midKey = child.keys[mid]!;
    const midVal = child.values[mid]!;

    sibling.keys = child.keys.splice(mid + 1);
    sibling.values = child.values.splice(mid + 1);
    child.keys.splice(mid);
    child.values.splice(mid);

    if (!child.leaf) {
      sibling.children = child.children.splice(mid + 1);
    }

    parent.keys.splice(index, 0, midKey);
    parent.values.splice(index, 0, midVal);
    parent.children.splice(index + 1, 0, sibling);
  }

  get(key: K): V | undefined {
    return this.search(this.root, key);
  }

  private search(node: BTreeNode<K, V>, key: K): V | undefined {
    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) > 0) {
      i++;
    }
    if (i < node.keys.length && this.compare(key, node.keys[i]!) === 0) {
      return node.values[i];
    }
    if (node.leaf) {
      return undefined;
    }
    return this.search(node.children[i]!, key);
  }

  has(key: K): boolean {
    return this.hasKey(this.root, key);
  }

  private hasKey(node: BTreeNode<K, V>, key: K): boolean {
    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) > 0) {
      i++;
    }
    if (i < node.keys.length && this.compare(key, node.keys[i]!) === 0) {
      return true;
    }
    if (node.leaf) {
      return false;
    }
    return this.hasKey(node.children[i]!, key);
  }

  delete(key: K): boolean {
    if (this.root.keys.length === 0) {
      return false;
    }
    const result = this.deleteFromNode(this.root, key);
    if (!this.root.leaf && this.root.keys.length === 0) {
      this.root = this.root.children[0]!;
    }
    return result;
  }

  private deleteFromNode(node: BTreeNode<K, V>, key: K): boolean {
    const idx = this.findKeyIndex(node, key);

    if (idx < node.keys.length && this.compare(key, node.keys[idx]!) === 0) {
      if (node.leaf) {
        node.keys.splice(idx, 1);
        node.values.splice(idx, 1);
        this._size--;
        return true;
      } else {
        return this.deleteFromInternal(node, idx);
      }
    } else {
      if (node.leaf) {
        return false;
      }
      const isLast = idx === node.keys.length;
      if (node.children[idx]!.keys.length <= this.minKeys) {
        this.fill(node, idx);
      }
      const adjustedIdx = isLast && idx > node.keys.length ? idx - 1 : idx;
      if (adjustedIdx >= node.children.length) {
        return false;
      }
      return this.deleteFromNode(node.children[adjustedIdx]!, key);
    }
  }

  private findKeyIndex(node: BTreeNode<K, V>, key: K): number {
    let idx = 0;
    while (idx < node.keys.length && this.compare(key, node.keys[idx]!) > 0) {
      idx++;
    }
    return idx;
  }

  private deleteFromInternal(node: BTreeNode<K, V>, idx: number): boolean {
    const key = node.keys[idx]!;
    if (node.children[idx]!.keys.length > this.minKeys) {
      const pred = this.getPredecessor(node.children[idx]!);
      node.keys[idx] = pred.key;
      node.values[idx] = pred.value;
      return this.deleteFromNode(node.children[idx]!, pred.key);
    } else if (node.children[idx + 1]!.keys.length > this.minKeys) {
      const succ = this.getSuccessor(node.children[idx + 1]!);
      node.keys[idx] = succ.key;
      node.values[idx] = succ.value;
      return this.deleteFromNode(node.children[idx + 1]!, succ.key);
    } else {
      this.merge(node, idx);
      return this.deleteFromNode(node.children[idx]!, key);
    }
  }

  private getPredecessor(node: BTreeNode<K, V>): Entry<K, V> {
    while (!node.leaf) {
      node = node.children[node.keys.length]!;
    }
    const last = node.keys.length - 1;
    return { key: node.keys[last]!, value: node.values[last]! };
  }

  private getSuccessor(node: BTreeNode<K, V>): Entry<K, V> {
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return { key: node.keys[0]!, value: node.values[0]! };
  }

  private fill(node: BTreeNode<K, V>, idx: number): void {
    if (idx > 0 && node.children[idx - 1]!.keys.length > this.minKeys) {
      this.borrowFromPrev(node, idx);
    } else if (idx < node.keys.length && node.children[idx + 1]!.keys.length > this.minKeys) {
      this.borrowFromNext(node, idx);
    } else {
      if (idx < node.keys.length) {
        this.merge(node, idx);
      } else {
        this.merge(node, idx - 1);
      }
    }
  }

  private borrowFromPrev(node: BTreeNode<K, V>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx - 1]!;

    child.keys.unshift(node.keys[idx - 1]!);
    child.values.unshift(node.values[idx - 1]!);

    if (!child.leaf) {
      child.children.unshift(sibling.children.pop()!);
    }

    node.keys[idx - 1] = sibling.keys.pop()!;
    node.values[idx - 1] = sibling.values.pop()!;
  }

  private borrowFromNext(node: BTreeNode<K, V>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    child.values.push(node.values[idx]!);

    if (!child.leaf) {
      child.children.push(sibling.children.shift()!);
    }

    node.keys[idx] = sibling.keys.shift()!;
    node.values[idx] = sibling.values.shift()!;
  }

  private merge(node: BTreeNode<K, V>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    child.values.push(node.values[idx]!);

    child.keys.push(...sibling.keys);
    child.values.push(...sibling.values);

    if (!child.leaf) {
      child.children.push(...sibling.children);
    }

    node.keys.splice(idx, 1);
    node.values.splice(idx, 1);
    node.children.splice(idx + 1, 1);
  }

  clear(): void {
    this.root = new BTreeNode<K, V>(true);
    this._size = 0;
  }

  min(): Entry<K, V> | undefined {
    if (this._size === 0) return undefined;
    let node = this.root;
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return { key: node.keys[0]!, value: node.values[0]! };
  }

  max(): Entry<K, V> | undefined {
    if (this._size === 0) return undefined;
    let node = this.root;
    while (!node.leaf) {
      node = node.children[node.keys.length]!;
    }
    const last = node.keys.length - 1;
    return { key: node.keys[last]!, value: node.values[last]! };
  }

  floor(key: K): Entry<K, V> | undefined {
    let result: Entry<K, V> | undefined;
    this.floorSearch(this.root, key, (entry) => {
      result = entry;
    });
    return result;
  }

  private floorSearch(node: BTreeNode<K, V>, key: K, cb: (e: Entry<K, V>) => void): void {
    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) > 0) {
      i++;
    }
    if (i < node.keys.length && this.compare(key, node.keys[i]!) === 0) {
      cb({ key: node.keys[i]!, value: node.values[i]! });
      return;
    }
    if (node.leaf) {
      if (i > 0) {
        cb({ key: node.keys[i - 1]!, value: node.values[i - 1]! });
      }
      return;
    }
    this.floorSearch(node.children[i]!, key, cb);
  }

  ceiling(key: K): Entry<K, V> | undefined {
    let result: Entry<K, V> | undefined;
    this.ceilingSearch(this.root, key, (entry) => {
      result = entry;
    });
    return result;
  }

  private ceilingSearch(node: BTreeNode<K, V>, key: K, cb: (e: Entry<K, V>) => void): void {
    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) > 0) {
      i++;
    }
    if (i < node.keys.length && this.compare(key, node.keys[i]!) === 0) {
      cb({ key: node.keys[i]!, value: node.values[i]! });
      return;
    }
    if (node.leaf) {
      if (i < node.keys.length) {
        cb({ key: node.keys[i]!, value: node.values[i]! });
      }
      return;
    }
    this.ceilingSearch(node.children[i]!, key, cb);
  }

  lower(key: K): Entry<K, V> | undefined {
    let result: Entry<K, V> | undefined;
    this.lowerSearch(this.root, key, (entry) => {
      result = entry;
    });
    return result;
  }

  private lowerSearch(node: BTreeNode<K, V>, key: K, cb: (e: Entry<K, V>) => void): void {
    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) > 0) {
      i++;
    }
    if (!node.leaf && i < node.children.length) {
      this.lowerSearch(node.children[i]!, key, cb);
    }
    if (i > 0 && this.compare(node.keys[i - 1]!, key) < 0) {
      cb({ key: node.keys[i - 1]!, value: node.values[i - 1]! });
    } else if (node.leaf && i > 0 && this.compare(node.keys[i - 1]!, key) < 0) {
      cb({ key: node.keys[i - 1]!, value: node.values[i - 1]! });
    }
  }

  higher(key: K): Entry<K, V> | undefined {
    let result: Entry<K, V> | undefined;
    this.higherSearch(this.root, key, (entry) => {
      result = entry;
    });
    return result;
  }

  private higherSearch(node: BTreeNode<K, V>, key: K, cb: (e: Entry<K, V>) => void): void {
    let i = 0;
    while (i < node.keys.length && this.compare(node.keys[i]!, key) <= 0) {
      if (!node.leaf && i < node.children.length) {
        this.higherSearch(node.children[i]!, key, cb);
      }
      i++;
    }
    if (i < node.keys.length && this.compare(node.keys[i]!, key) > 0) {
      if (!node.leaf && i < node.children.length) {
        this.higherSearch(node.children[i]!, key, cb);
      }
      cb({ key: node.keys[i]!, value: node.values[i]! });
    }
  }

  range(lo: K, hi: K): Entry<K, V>[] {
    const result: Entry<K, V>[] = [];
    this.rangeSearch(this.root, lo, hi, result);
    return result;
  }

  private rangeSearch(node: BTreeNode<K, V>, lo: K, hi: K, result: Entry<K, V>[]): void {
    let i = 0;
    while (i < node.keys.length && this.compare(node.keys[i]!, lo) < 0) {
      i++;
    }
    if (!node.leaf && i < node.children.length) {
      this.rangeSearch(node.children[i]!, lo, hi, result);
    }
    while (i < node.keys.length) {
      const cmp = this.compare(node.keys[i]!, hi);
      if (cmp > 0) return;
      result.push({ key: node.keys[i]!, value: node.values[i]! });
      i++;
      if (!node.leaf && i < node.children.length) {
        this.rangeSearch(node.children[i]!, lo, hi, result);
      }
    }
  }

  indexOf(key: K): number {
    const result = this.indexOfSearch(this.root, key);
    return result;
  }

  private indexOfSearch(node: BTreeNode<K, V>, key: K): number {
    let count = 0;
    let i = 0;
    while (i < node.keys.length && this.compare(key, node.keys[i]!) > 0) {
      if (!node.leaf) {
        count += this.subtreeSize(node.children[i]!);
      }
      count++;
      i++;
    }
    if (i < node.keys.length && this.compare(key, node.keys[i]!) === 0) {
      if (!node.leaf) {
        count += this.subtreeSize(node.children[i]!);
      }
      return count;
    }
    if (node.leaf) {
      return -1;
    }
    const childResult = this.indexOfSearch(node.children[i]!, key);
    if (childResult === -1) return -1;
    return count + childResult;
  }

  private subtreeSize(node: BTreeNode<K, V>): number {
    let count = node.keys.length;
    if (!node.leaf) {
      for (const child of node.children) {
        count += this.subtreeSize(child);
      }
    }
    return count;
  }

  at(index: number): Entry<K, V> | undefined {
    if (index < 0 || index >= this._size) return undefined;
    return this.atSearch(this.root, index);
  }

  private atSearch(node: BTreeNode<K, V>, index: number): Entry<K, V> | undefined {
    let i = 0;
    while (i < node.keys.length) {
      if (!node.leaf) {
        const leftSize = this.subtreeSize(node.children[i]!);
        if (index < leftSize) {
          return this.atSearch(node.children[i]!, index);
        }
        index -= leftSize;
      }
      if (index === 0) {
        return { key: node.keys[i]!, value: node.values[i]! };
      }
      index--;
      i++;
    }
    if (!node.leaf && index >= 0) {
      return this.atSearch(node.children[node.keys.length]!, index);
    }
    return undefined;
  }

  keys(): K[] {
    const result: K[] = [];
    this.inorderKeys(this.root, result);
    return result;
  }

  private inorderKeys(node: BTreeNode<K, V>, result: K[]): void {
    if (node.leaf) {
      result.push(...node.keys);
      return;
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.inorderKeys(node.children[i]!, result);
      result.push(node.keys[i]!);
    }
    this.inorderKeys(node.children[node.keys.length]!, result);
  }

  values(): V[] {
    const result: V[] = [];
    this.inorderValues(this.root, result);
    return result;
  }

  private inorderValues(node: BTreeNode<K, V>, result: V[]): void {
    if (node.leaf) {
      result.push(...node.values);
      return;
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.inorderValues(node.children[i]!, result);
      result.push(node.values[i]!);
    }
    this.inorderValues(node.children[node.keys.length]!, result);
  }

  entries(): Entry<K, V>[] {
    const result: Entry<K, V>[] = [];
    this.inorderEntries(this.root, result);
    return result;
  }

  private inorderEntries(node: BTreeNode<K, V>, result: Entry<K, V>[]): void {
    if (node.leaf) {
      for (let i = 0; i < node.keys.length; i++) {
        result.push({ key: node.keys[i]!, value: node.values[i]! });
      }
      return;
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.inorderEntries(node.children[i]!, result);
      result.push({ key: node.keys[i]!, value: node.values[i]! });
    }
    this.inorderEntries(node.children[node.keys.length]!, result);
  }

  toArray(): Entry<K, V>[] {
    return this.entries();
  }

  forEach(callback: (value: V, key: K, map: BTreeMap<K, V>) => void): void {
    this.inorderForEach(this.root, callback);
  }

  private inorderForEach(node: BTreeNode<K, V>, callback: (value: V, key: K, map: BTreeMap<K, V>) => void): void {
    if (node.leaf) {
      for (let i = 0; i < node.keys.length; i++) {
        callback(node.values[i]!, node.keys[i]!, this);
      }
      return;
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.inorderForEach(node.children[i]!, callback);
      callback(node.values[i]!, node.keys[i]!, this);
    }
    this.inorderForEach(node.children[node.keys.length]!, callback);
  }

  *[Symbol.iterator](): Iterator<Entry<K, V>> {
    const stack: { node: BTreeNode<K, V>; index: number }[] = [];
    let current: BTreeNode<K, V> | undefined = this.root;

    while (current || stack.length > 0) {
      while (current) {
        stack.push({ node: current, index: 0 });
        if (current.leaf) {
          current = undefined;
        } else {
          current = current.children[0];
        }
      }

      const top = stack.pop();
      if (!top) break;
      const cur = top.node;
      const idx = top.index;

      if (idx < cur.keys.length) {
        yield { key: cur.keys[idx]!, value: cur.values[idx]! };
        stack.push({ node: cur, index: idx + 1 });
        if (!cur.leaf) {
          current = cur.children[idx + 1];
        } else {
          current = undefined;
        }
      } else {
        current = undefined;
      }
    }
  }

  iterator(): Iterator<Entry<K, V>> {
    return this[Symbol.iterator]();
  }

  toString(): string {
    return `${BTreeMap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
}
