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
}
