type RopeNode<T> = LeafNode<T> | InternalNode<T> | null;

interface LeafNode<T> {
  type: 'leaf';
  items: T[];
  left: null;
  right: null;
}

interface InternalNode<T> {
  type: 'internal';
  left: RopeNode<T>;
  right: RopeNode<T>;
}

const LEAF_SIZE = 32;

function createLeaf<T>(items: T[] = []): LeafNode<T> {
  return { type: 'leaf', items: [...items], left: null, right: null };
}

function createInternal<T>(left: RopeNode<T>, right: RopeNode<T>): InternalNode<T> {
  return { type: 'internal', left, right };
}

function merge<T>(left: RopeNode<T>, right: RopeNode<T>): RopeNode<T> {
  if (!left) return right;
  if (!right) return left;
  if (left.type === 'leaf' && right.type === 'leaf') {
    if (left.items!.length + right.items!.length <= LEAF_SIZE) {
      return createLeaf([...left.items!, ...right.items!]);
    }
    return createInternal(left, right);
  }
  if (left.type === 'internal' && right.type === 'internal') {
    return createInternal(left, right);
  }
  if (left.type === 'leaf' && right.type === 'internal') {
    return createInternal(left, right);
  }
  return createInternal(left, right);
}

export class RopeQueue2<T> {
  private root: RopeNode<T> = null;
  private leftIndex = 0;
  private _size = 0;

  enqueue(item: T): void {
    if (!this.root) {
      this.root = createLeaf([item]);
    } else if (this.root.type === 'leaf') {
      if (this.root.items!.length < LEAF_SIZE) {
        this.root.items!.push(item);
      } else {
        this.root = createInternal(this.root, createLeaf([item]));
      }
    } else {
      let node: RopeNode<T> = this.root;
      const stack: InternalNode<T>[] = [];
      while (node && node.type === 'internal') {
        stack.push(node);
        node = node.right;
      }
      if (node && node.type === 'leaf' && node.items.length < LEAF_SIZE) {
        node.items.push(item);
      } else {
        const newLeaf = createLeaf([item]);
        const merged = merge(node!, newLeaf);
        let current: RopeNode<T> = merged;
        while (stack.length > 0) {
          const parent = stack.pop()!;
          parent.right = current;
          current = parent;
        }
        this.root = current;
      }
    }
    this._size++;
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined;
    this._size--;
    if (this.root!.type === 'leaf') {
      const item = this.root!.items![this.leftIndex];
      this.leftIndex++;
      if (this.leftIndex >= this.root!.items!.length) {
        this.root = null;
        this.leftIndex = 0;
      }
      return item;
    }
    let node: RopeNode<T> = this.root;
    const stack: InternalNode<T>[] = [];
    while (node!.type === 'internal') {
      stack.push(node!);
      node = node!.left!;
    }
    const item = node!.items![this.leftIndex];
    this.leftIndex++;
    if (this.leftIndex >= node!.items!.length) {
      let current: RopeNode<T> = null;
      this.leftIndex = 0;
      while (stack.length > 0) {
        const parent = stack.pop()!;
        parent.left = current;
        current = merge(parent.left, parent.right);
      }
      this.root = current;
    }
    return item;
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined;
    let node: RopeNode<T> = this.root;
    while (node!.type === 'internal') {
      node = node!.left!;
    }
    return node!.items![this.leftIndex];
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = null;
    this.leftIndex = 0;
    this._size = 0;
  }

  enqueueFront(items: T[]): void {
    if (items.length === 0) return;
    let newRoot: RopeNode<T> = null;
    for (let i = items.length - 1; i >= 0; i--) {
      const leaf = createLeaf([items[i]!]);
      newRoot = merge(leaf, newRoot);
    }
    this.root = merge(newRoot, this.root);
    this._size += items.length;
  }

  toString(): string {
    return `RopeQueue2({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'RopeQueue2'
  }
}
