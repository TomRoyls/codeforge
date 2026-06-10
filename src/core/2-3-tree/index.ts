type NodeType = '2' | '3';

type Node<T> = {
  type: NodeType;
  keys: T[];
  children: (Node<T> | null)[];
};

export class TwoThreeTree<T> {
  private root: Node<T> | null;
  private _size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.root = null;
    this._size = 0;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = { type: '2', keys: [value], children: [null, null] };
      this._size++;
      return;
    }

    const result = this.insertNode(this.root, value);
    
    if (!result.inserted) return;
    
    this._size++;

    if (result.promoted !== null) {
      this.root = {
        type: '2',
        keys: [result.promoted!],
        children: [result.leftChild, result.rightChild]
      };
    } else if (result.node !== null) {
      this.root = result.node;
    }
  }

  private insertNode(node: Node<T>, value: T): { node: Node<T> | null; promoted: T | null; leftChild: Node<T> | null; rightChild: Node<T> | null; inserted: boolean } {
    const cmp1 = this.comparator(value, node.keys[0]!);

    if (node.type === '2') {
      if (cmp1 === 0) {
        return { node, promoted: null, leftChild: null, rightChild: null, inserted: false };
      }

      if (cmp1 < 0) {
        if (node.children[0] === null) {
          node.keys = [value, node.keys[0]!];
          node.type = '3';
          node.children = [null, null, null];
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        const result = this.insertNode(node.children[0]!, value);
        if (!result.inserted) return result;
        
        if (result.promoted === null) {
          node.children[0] = result.node;
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        
        return this.handleSplitIn2Node(node, result.promoted, result.leftChild, result.rightChild, true);
      } else {
        if (node.children[1] === null) {
          node.keys = [node.keys[0]!, value];
          node.type = '3';
          node.children = [null, null, null];
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        const result = this.insertNode(node.children[1]!, value);
        if (!result.inserted) return result;
        
        if (result.promoted === null) {
          node.children[1] = result.node;
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        
        return this.handleSplitIn2Node(node, result.promoted, result.leftChild, result.rightChild, false);
      }
    } else {
      const cmp2 = this.comparator(value, node.keys[1]!);

      if (cmp1 === 0 || cmp2 === 0) {
        return { node, promoted: null, leftChild: null, rightChild: null, inserted: false };
      }

      if (cmp1 < 0) {
        if (node.children[0] === null) {
          return this.split3Node([value, node.keys[0]!, node.keys[1]!], [null, null, null]);
        }
        const result = this.insertNode(node.children[0]!, value);
        if (!result.inserted) return result;
        
        if (result.promoted === null) {
          node.children[0] = result.node;
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        
        return this.handleSplitIn3Node(node, result.promoted, result.leftChild, result.rightChild, 0);
      } else if (cmp2 < 0) {
        if (node.children[1] === null) {
          return this.split3Node([node.keys[0]!, value, node.keys[1]!], [null, null, null]);
        }
        const result = this.insertNode(node.children[1]!, value);
        if (!result.inserted) return result;
        
        if (result.promoted === null) {
          node.children[1] = result.node;
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        
        return this.handleSplitIn3Node(node, result.promoted, result.leftChild, result.rightChild, 1);
      } else {
        if (node.children[2] === null) {
          return this.split3Node([node.keys[0]!, node.keys[1]!, value], [null, null, null]);
        }
        const result = this.insertNode(node.children[2]!, value);
        if (!result.inserted) return result;
        
        if (result.promoted === null) {
          node.children[2] = result.node;
          return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
        }
        
        return this.handleSplitIn3Node(node, result.promoted, result.leftChild, result.rightChild, 2);
      }
    }
  }

  private split3Node(keys: [T, T, T], children: (Node<T> | null)[]) {
    const leftNode: Node<T> = {
      type: '2',
      keys: [keys[0]!],
      children: [children[0]!, children[1]!]
    };

    const rightNode: Node<T> = {
      type: '2',
      keys: [keys[2]!],
      children: [children[1]!, children[2]!]
    };

    return {
      node: null,
      promoted: keys[1]!,
      leftChild: leftNode,
      rightChild: rightNode,
      inserted: true
    };
  }

  private handleSplitIn2Node(
    node: Node<T>,
    promoted: T,
    leftSplit: Node<T> | null,
    rightSplit: Node<T> | null,
    fromLeft: boolean
  ) {
    const existingKey = node.keys[0]!;
    const newKeys = [existingKey, promoted].sort((a: T, b: T) => this.comparator(a, b));
    
    if (fromLeft) {
      node.keys = newKeys as [T, T];
      node.type = '3';
      node.children = [leftSplit, rightSplit, node.children[1] ?? null];
      return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
    } else {
      node.keys = newKeys as [T, T];
      node.type = '3';
      node.children = [node.children[0] ?? null, leftSplit, rightSplit];
      return { node, promoted: null, leftChild: null, rightChild: null, inserted: true };
    }
  }

  private handleSplitIn3Node(
    node: Node<T>,
    promoted: T,
    leftSplit: Node<T> | null,
    rightSplit: Node<T> | null,
    position: 0 | 1 | 2
  ) {
    const k1 = node.keys[0]!;
    const k2 = node.keys[1]!;
    const k3 = promoted;
    
    const allKeys = [k1, k2, k3].sort((a: T, b: T) => this.comparator(a, b));
    const midKey = allKeys[1]!;
    
    let leftNode: Node<T>;
    let rightNode: Node<T>;
    
    if (position === 0) {
      leftNode = {
        type: '2',
        keys: [allKeys[0]!],
        children: [leftSplit, rightSplit]
      };
      rightNode = {
        type: '2',
        keys: [allKeys[2]!],
        children: [node.children[1] ?? null, node.children[2] ?? null]
      };
    } else if (position === 1) {
      leftNode = {
        type: '2',
        keys: [allKeys[0]!],
        children: [node.children[0] ?? null, leftSplit]
      };
      rightNode = {
        type: '2',
        keys: [allKeys[2]!],
        children: [rightSplit, node.children[2] ?? null]
      };
    } else {
      leftNode = {
        type: '2',
        keys: [allKeys[0]!],
        children: [node.children[0] ?? null, node.children[1] ?? null]
      };
      rightNode = {
        type: '2',
        keys: [allKeys[2]!],
        children: [leftSplit, rightSplit]
      };
    }
    
    return {
      node: null,
      promoted: midKey,
      leftChild: leftNode,
      rightChild: rightNode,
      inserted: true
    };
  }

  delete(value: T): boolean {
    if (this.root === null) return false;

    const [newRoot, deleted] = this.deleteNode(this.root, value);
    
    if (!deleted) return false;

    this._size--;

    if (newRoot !== null) {
      this.root = newRoot;
    } else {
      this.root = null;
    }

    return true;
  }

  private deleteNode(node: Node<T>, value: T): [Node<T> | null, boolean] {
    const cmp1 = this.comparator(value, node.keys[0]!);

    if (node.type === '2') {
      if (cmp1 === 0) {
        if (node.children[0] === null && node.children[1] === null) {
          return [null, true];
        }
        if (node.children[0] === null) {
          const successor = this.getMin(node.children[1]!);
          node.keys = [successor];
          const [newRight, deleted] = this.deleteNode(node.children[1]!, successor);
          node.children[1] = newRight;
          return [node, deleted];
        }
        if (node.children[1] === null) {
          const predecessor = this.getMax(node.children[0]!);
          node.keys = [predecessor];
          const [newLeft, deleted] = this.deleteNode(node.children[0]!, predecessor);
          node.children[0] = newLeft;
          return [node, deleted];
        }
        const successor = this.getMin(node.children[1]!);
        node.keys = [successor];
        const [newRight, deleted] = this.deleteNode(node.children[1]!, successor);
        node.children[1] = newRight;
        return [node, deleted];
      }

      if (cmp1 < 0) {
        if (node.children[0] === null) return [node, false];
        const [newLeft, deleted] = this.deleteNode(node.children[0]!, value);
        if (!deleted) return [node, false];
        node.children[0] = newLeft;
        return [node, true];
      } else {
        if (node.children[1] === null) return [node, false];
        const [newRight, deleted] = this.deleteNode(node.children[1]!, value);
        if (!deleted) return [node, false];
        node.children[1] = newRight;
        return [node, true];
      }
    } else {
      const cmp2 = this.comparator(value, node.keys[1]!);

      if (cmp1 === 0) {
        if (node.children[0] === null) {
          node.keys = [node.keys[1]!];
          node.type = '2';
          node.children = [null, null];
          return [node, true];
        }
        const predecessor = this.getMax(node.children[0]!);
        node.keys = [predecessor];
        const [newLeft, deleted] = this.deleteNode(node.children[0]!, predecessor);
        node.children[0] = newLeft;
        if (!deleted) return [node, false];
        return [node, true];
      } else if (cmp2 === 0) {
        if (node.children[2] === null) {
          node.keys = [node.keys[0]!];
          node.type = '2';
          node.children = [null, null];
          return [node, true];
        }
        const successor = this.getMin(node.children[2]!);
        node.keys = [node.keys[0]!, successor];
        const [newRight, deleted] = this.deleteNode(node.children[2]!, successor);
        node.children[2] = newRight;
        if (!deleted) return [node, false];
        return [node, true];
      } else if (cmp1 < 0) {
        if (node.children[0] === null) return [node, false];
        const [newLeft, deleted] = this.deleteNode(node.children[0]!, value);
        if (!deleted) return [node, false];
        node.children[0] = newLeft;
        return [node, true];
      } else if (cmp2 < 0) {
        if (node.children[1] === null) return [node, false];
        const [newMiddle, deleted] = this.deleteNode(node.children[1]!, value);
        if (!deleted) return [node, false];
        node.children[1] = newMiddle;
        return [node, true];
      } else {
        if (node.children[2] === null) return [node, false];
        const [newRight, deleted] = this.deleteNode(node.children[2]!, value);
        if (!deleted) return [node, false];
        node.children[2] = newRight;
        return [node, true];
      }
    }
  }

  private getMin(node: Node<T>): T {
    while (node.children[0] !== null) {
      node = node.children[0]!;
    }
    return node.keys[0]!;
  }

  private getMax(node: Node<T>): T {
    while (node.type === '3' ? node.children[2] !== null : node.children[1] !== null) {
      node = node.type === '3' ? node.children[2]! : node.children[1]!;
    }
    return node.type === '3' ? node.keys[1]! : node.keys[0]!;
  }

  search(value: T): boolean {
    return this.contains(value);
  }

  contains(value: T): boolean {
    let current = this.root;
    while (current !== null) {
      const cmp1 = this.comparator(value, current.keys[0]!);
      
      if (current.type === '2') {
        if (cmp1 === 0) return true;
        if (cmp1 < 0) {
          current = current.children[0] ?? null;
        } else {
          current = current.children[1] ?? null;
        }
      } else {
        const cmp2 = this.comparator(value, current.keys[1]!);
        
        if (cmp1 === 0 || cmp2 === 0) return true;
        if (cmp1 < 0) {
          current = current.children[0] ?? null;
        } else if (cmp2 < 0) {
          current = current.children[1] ?? null;
        } else {
          current = current.children[2] ?? null;
        }
      }
    }
    return false;
  }

  min(): T | undefined {
    if (this.root === null) return undefined;
    let current = this.root;
    while (current.children[0] !== null) {
      current = current.children[0]!;
    }
    return current.keys[0];
  }

  max(): T | undefined {
    if (this.root === null) return undefined;
    let current = this.root;
    while (current.type === '3' ? current.children[2] !== null : current.children[1] !== null) {
      current = current.type === '3' ? current.children[2]! : current.children[1]!;
    }
    return current.type === '3' ? current.keys[1] : current.keys[0];
  }

  inOrderTraversal(): T[] {
    const result: T[] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(node: Node<T> | null, result: T[]): void {
    if (node === null) return;
    
    this.inOrder(node.children[0] ?? null, result);
    result.push(node.keys[0]!);
    
    if (node.type === '3') {
      this.inOrder(node.children[1] ?? null, result);
      result.push(node.keys[1]!);
    }
    
    this.inOrder(node.type === '3' ? (node.children[2] ?? null) : (node.children[1] ?? null), result);
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    return this.inOrderTraversal();
  }

  getHeight(): number {
    return this.computeHeight(this.root);
  }

  private computeHeight(node: Node<T> | null): number {
    if (node === null) return 0;
    const leftHeight = this.computeHeight(node.children[0] ?? null);
    const rightHeight = this.computeHeight(node.children[1] ?? null);
    const middleHeight = node.type === '3' ? this.computeHeight(node.children[2] ?? null) : 0;
    return 1 + Math.max(leftHeight, rightHeight, middleHeight);
  }

  getTimeComplexity(): string {
    const h = this.getHeight();
    const n = this._size;
    if (n === 0) return 'O(1)';
    
    const expectedHeight = Math.ceil(Math.log2(n + 1));
    if (h <= expectedHeight + 1) {
      return `O(log n) - height: ${h}, size: ${n}`;
    }
    return `O(h) - height: ${h}, size: ${n} (unbalanced)`;
  }


  *[Symbol.iterator](): IterableIterator<T> {
    for (const val of this.inOrderTraversal()) {
      yield val;
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${TwoThreeTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'TwoThreeTree', items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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


  tap(fn: (collection: TwoThreeTree<T>) => void): TwoThreeTree<T> {
    fn(this)
    return this
  }

  equals(other: TwoThreeTree<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  head(): T | undefined {
    return this.first()
  }

  tail(): T[] {
    return this.skip(1)
  }

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  static from<T>(items: T[]): TwoThreeTree<T> {
    const instance = new TwoThreeTree<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): TwoThreeTree<T> {
    return TwoThreeTree.from(items)
  }


  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }


  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  reduceWhile<U>(
    predicate: (acc: U) => boolean,
    reducer: (acc: U, item: T) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (const item of this.toArray()) {
      if (!predicate(acc)) break
      acc = reducer(acc, item)
    }
    return acc
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  shuffle(): T[] {
    const arr = [...this.toArray()]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    return arr
  }

  sample(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
  }

  sampleN(n: number): T[] {
    return this.shuffle().slice(0, n)
  }

  minBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let minItem = arr[0]!
    let minKey = keyFn(minItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key < minKey) {
        minKey = key
        minItem = item
      }
    }
    return minItem
  }

  maxBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let maxItem = arr[0]!
    let maxKey = keyFn(maxItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key > maxKey) {
        maxKey = key
        maxItem = item
      }
    }
    return maxItem
  }

  flatten(depth: number = 1): T[] {
    const flat = (arr: T[], d: number): T[] => {
      const result: T[] = []
      for (const item of arr) {
        if (Array.isArray(item) && d > 0) {
          result.push(...flat(item as unknown as T[], d - 1))
        } else {
          result.push(item)
        }
      }
      return result
    }
    return flat(this.toArray(), depth)
  }

  groupByMap<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      const group = groups.get(key)
      if (group) {
        group.push(item)
      } else {
        groups.set(key, [item])
      }
    }
    return groups
  }

  toSet(): Set<T> {
    return new Set(this.toArray())
  }

  frequency(item: T): number {
    let count = 0
    for (const element of this.toArray()) {
      if (element === item) count++
    }
    return count
  }

  interleave(other: T[]): T[] {
    const a = this.toArray()
    const result: T[] = []
    const maxLen = Math.max(a.length, other.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < a.length) result.push(a[i]!)
      if (i < other.length) result.push(other[i]!)
    }
    return result
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this.toArray()) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  span(predicate: (item: T) => boolean): [T[], T[]] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!)) {
      i++
    }
    return [arr.slice(0, i), arr.slice(i)]
  }

  breakWhen(predicate: (item: T) => boolean): [T[], T[]] {
    return this.span(item => !predicate(item))
  }

  scan<U>(reducer: (acc: U, item: T) => U, initialValue: U): U[] {
    const result: U[] = []
    let acc = initialValue
    for (const item of this.toArray()) {
      acc = reducer(acc, item)
      result.push(acc)
    }
    return result
  }












  get [Symbol.toStringTag](): string {
    return 'TwoThreeTree'
  }

  indexOf(item: T, fromIndex: number = 0): number {
    return this.toArray().indexOf(item, fromIndex)
  }











}
