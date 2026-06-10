interface BTreeNode<T> {
  keys: T[];
  children: BTreeNode<T>[];
  leaf: boolean;
}

export class BTree2<T> {
  private root: BTreeNode<T> | null;
  private order: number;
  private comparator: (a: T, b: T) => number;
  private _size: number;

  constructor(order: number = 3, comparator?: (a: T, b: T) => number) {
    this.order = order;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.root = null;
    this._size = 0;
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = {
        keys: [value],
        children: [],
        leaf: true
      };
      this._size++;
      return;
    }

    const root = this.root;
    if (root.keys.length === 2 * this.order - 1) {
      const newRoot: BTreeNode<T> = {
        keys: [],
        children: [root],
        leaf: false
      };
      this.splitChild(newRoot, 0, root);
      this.root = newRoot;
      this.insertNonFull(newRoot, value);
    } else {
      this.insertNonFull(root, value);
    }
    this._size++;
  }

  private splitChild(parent: BTreeNode<T>, index: number, child: BTreeNode<T>): void {
    const order = this.order;
    const newNode: BTreeNode<T> = {
      keys: child.keys.slice(order),
      children: child.children.slice(order),
      leaf: child.leaf
    };
    const midKey = child.keys[order - 1];

    child.keys = child.keys.slice(0, order - 1);
    child.children = child.children.slice(0, order);

    parent.keys.splice(index, 0, midKey!);
    parent.children.splice(index + 1, 0, newNode);
  }

  private insertNonFull(node: BTreeNode<T>, value: T): void {
    if (node.leaf) {
      node.keys.push(value);
      let j = node.keys.length - 1;
      while (j > 0 && this.comparator(value, node.keys[j - 1]!) < 0) {
        node.keys[j] = node.keys[j - 1]!;
        j--;
      }
      node.keys[j] = value;
    } else {
      let i = 0;
      while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
        i++;
      }

      if (node.children[i]!.keys.length === 2 * this.order - 1) {
        this.splitChild(node, i, node.children[i]!);
        if (this.comparator(value, node.keys[i]!) > 0) {
          i++;
        }
      }
      this.insertNonFull(node.children[i]!, value);
    }
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value) !== null;
  }

  private searchNode(node: BTreeNode<T> | null, value: T): { node: BTreeNode<T>, index: number } | null {
    if (node === null) return null;

    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }

    if (i < node.keys.length && this.comparator(value, node.keys[i]!) === 0) {
      return { node, index: i };
    }

    if (node.leaf) {
      return null;
    }

    return this.searchNode(node.children[i]!, value);
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  delete(value: T): void {
    if (this.root === null) return;

    const result = this.deleteFromNode(this.root, value);
    if (result) {
      this._size--;
    }

    if (this.root !== null && this.root.keys.length === 0) {
      if (!this.root.leaf) {
        this.root = this.root.children[0] || null;
      } else {
        this.root = null;
      }
    }
  }

  private deleteFromNode(node: BTreeNode<T>, value: T): boolean {
    const idx = this.findKeyIndex(node, value);

    if (idx < node.keys.length && this.comparator(value, node.keys[idx]!) === 0) {
      if (node.leaf) {
        node.keys.splice(idx, 1);
        return true;
      } else {
        return this.deleteInternalNode(node, value, idx);
      }
    } else {
      if (node.leaf) {
        return false;
      }

      const shouldMerge = node.children[idx]!.keys.length < this.order;

      if (shouldMerge) {
        this.fill(node, idx);
      }

      if (idx > node.keys.length) {
        return this.deleteFromNode(node.children[idx - 1]!, value);
      } else {
        return this.deleteFromNode(node.children[idx]!, value);
      }
    }
  }

  private deleteInternalNode(node: BTreeNode<T>, value: T, idx: number): boolean {
    const k = this.order - 1;

    if (node.children[idx]!.keys.length >= k) {
      const pred = this.getPredecessor(node.children[idx]!);
      node.keys[idx] = pred;
      return this.deleteFromNode(node.children[idx]!, pred);
    } else if (node.children[idx + 1]!.keys.length >= k) {
      const succ = this.getSuccessor(node.children[idx + 1]!);
      node.keys[idx] = succ;
      return this.deleteFromNode(node.children[idx + 1]!, succ);
    } else {
      this.merge(node, idx);
      return this.deleteFromNode(node.children[idx]!, value);
    }
  }

  private getPredecessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      node = node.children[node.children.length - 1]!;
    }
    return node.keys[node.keys.length - 1]!;
  }

  private getSuccessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return node.keys[0]!;
  }

  private fill(node: BTreeNode<T>, idx: number): void {
    const k = this.order - 1;

    if (idx !== 0 && node.children[idx - 1]!.keys.length >= k) {
      this.borrowFromPrev(node, idx);
    } else if (idx !== node.keys.length && node.children[idx + 1]!.keys.length >= k) {
      this.borrowFromNext(node, idx);
    } else {
      if (idx !== node.keys.length) {
        this.merge(node, idx);
      } else {
        this.merge(node, idx - 1);
      }
    }
  }

  private borrowFromPrev(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx - 1]!;

    child.keys.unshift(node.keys[idx - 1]!);
    node.keys[idx - 1] = sibling.keys[sibling.keys.length - 1]!;
    sibling.keys.pop();

    if (!child.leaf) {
      child.children.unshift(sibling.children[sibling.children.length - 1]!);
      sibling.children.pop();
    }
  }

  private borrowFromNext(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    node.keys[idx] = sibling.keys[0]!;
    sibling.keys.shift();

    if (!child.leaf) {
      child.children.push(sibling.children[0]!);
      sibling.children.shift();
    }
  }

  private merge(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!;
    const sibling = node.children[idx + 1]!;

    child.keys.push(node.keys[idx]!);
    child.keys = [...child.keys, ...sibling.keys];

    if (!child.leaf) {
      child.children = [...child.children, ...sibling.children];
    }

    node.keys.splice(idx, 1);
    node.children.splice(idx + 1, 1);
  }

  private findKeyIndex(node: BTreeNode<T>, value: T): number {
    let i = 0;
    while (i < node.keys.length && this.comparator(value, node.keys[i]!) > 0) {
      i++;
    }
    return i;
  }

  min(): T | null {
    if (this.root === null) return null;

    let node = this.root;
    while (!node.leaf) {
      node = node.children[0]!;
    }
    return node.keys[0]!;
  }

  max(): T | null {
    if (this.root === null) return null;

    let node = this.root;
    while (!node.leaf) {
      node = node.children[node.children.length - 1]!;
    }
    return node.keys[node.keys.length - 1]!;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this.root === null;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inorderTraversal(this.root, result);
    return result;
  }

  private inorderTraversal(node: BTreeNode<T> | null, result: T[]): void {
    if (node === null) return;

    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) {
        this.inorderTraversal(node.children[i]!, result);
      }
      result.push(node.keys[i]!);
    }
    if (!node.leaf) {
      this.inorderTraversal(node.children[node.children.length - 1]!, result);
    }
  }

  forEach(callback: (value: T) => void): void {
    const arr = this.toArray();
    arr.forEach(callback);
  }


  *[Symbol.iterator](): IterableIterator<T> {
    type N = BTreeNode<T>;
    type Frame = { node: N; keyIdx: number; childVisited: boolean };
    if (this.root === null) return;
    const stack: Array<Frame> = [];
    const pushLeftmost = (node: N): void => {
      stack.push({ node, keyIdx: 0, childVisited: false });
    };
    pushLeftmost(this.root);
    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!;
      if (!frame.childVisited && !frame.node.leaf && frame.keyIdx < frame.node.children.length) {
        frame.childVisited = true;
        pushLeftmost(frame.node.children[frame.keyIdx]!);
        continue;
      }
      if (frame.keyIdx < frame.node.keys.length) {
        const key = frame.node.keys[frame.keyIdx]!;
        frame.keyIdx++;
        frame.childVisited = false;
        yield key;
        continue;
      }
      if (!frame.node.leaf && frame.keyIdx < frame.node.children.length) {
        frame.childVisited = false;
        pushLeftmost(frame.node.children[frame.keyIdx]!);
        continue;
      }
      stack.pop();
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${BTree2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }



  toJSON() {
    return { type: 'BTree2', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }



  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

}
