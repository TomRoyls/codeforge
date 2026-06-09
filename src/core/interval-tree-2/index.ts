type Interval<T = unknown> = {
  lo: number;
  hi: number;
  value?: T;
};

class Node<T = unknown> {
  interval: Interval<T>;
  left: Node<T> | null = null;
  right: Node<T> | null = null;
  max: number;
  height: number = 1;

  constructor(interval: Interval<T>) {
    this.interval = interval;
    this.max = interval.hi;
  }
}

export class IntervalTree2<T = unknown> {
  private root: Node<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  insert(lo: number, hi: number, value?: T): void {
    if (lo > hi) {
      throw new RangeError('Invalid interval: lo cannot be greater than hi');
    }
    const interval: Interval<T> = { lo, hi, value };
    this.root = this._insert(this.root, interval);
    this._size++;
  }

  private _height(node: Node<T> | null): number {
    return node === null ? 0 : node.height;
  }

  private _balanceFactor(node: Node<T>): number {
    return this._height(node.left) - this._height(node.right);
  }

  private _insert(node: Node<T> | null, interval: Interval<T>): Node<T> {
    if (node === null) {
      return new Node(interval);
    }

    if (interval.lo < node.interval.lo) {
      node.left = this._insert(node.left, interval);
    } else {
      node.right = this._insert(node.right, interval);
    }

    this._updateMax(node);
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));

    return this._balance(node);
  }

  private _balance(node: Node<T>): Node<T> {
    const bf = this._balanceFactor(node);

    if (bf > 1) {
      if (this._balanceFactor(node.left!) < 0) {
        node.left = this._rotateLeft(node.left!);
      }
      return this._rotateRight(node);
    }

    if (bf < -1) {
      if (this._balanceFactor(node.right!) > 0) {
        node.right = this._rotateRight(node.right!);
      }
      return this._rotateLeft(node);
    }

    return node;
  }

  private _rotateLeft(z: Node<T>): Node<T> {
    const y = z.right!;
    const t2 = y.left;

    y.left = z;
    z.right = t2;

    this._updateMax(z);
    this._updateMax(y);

    z.height = 1 + Math.max(this._height(z.left), this._height(z.right));
    y.height = 1 + Math.max(this._height(y.left), this._height(y.right));

    return y;
  }

  private _rotateRight(z: Node<T>): Node<T> {
    const y = z.left!;
    const t3 = y.right;

    y.right = z;
    z.left = t3;

    this._updateMax(z);
    this._updateMax(y);

    z.height = 1 + Math.max(this._height(z.left), this._height(z.right));
    y.height = 1 + Math.max(this._height(y.left), this._height(y.right));

    return y;
  }

  private _updateMax(node: Node<T>): void {
    node.max = node.interval.hi;
    if (node.left !== null) {
      node.max = Math.max(node.max, node.left.max);
    }
    if (node.right !== null) {
      node.max = Math.max(node.max, node.right.max);
    }
  }

  query(point: number): Interval<T>[] {
    const result: Interval<T>[] = [];
    this._search(this.root, point, result);
    return result;
  }

  private _search(node: Node<T> | null, point: number, result: Interval<T>[]): void {
    if (node === null) {
      return;
    }

    if (node.left !== null && node.left.max >= point) {
      this._search(node.left, point, result);
    }

    if (point >= node.interval.lo && point <= node.interval.hi) {
      result.push(node.interval);
    }

    if (node.right !== null && node.right.max >= point) {
      this._search(node.right, point, result);
    }
  }

  queryRange(lo: number, hi: number): Interval<T>[] {
    const result: Interval<T>[] = [];
    this._searchRange(this.root, lo, hi, result);
    return result;
  }

  private _searchRange(node: Node<T> | null, lo: number, hi: number, result: Interval<T>[]): void {
    if (node === null) {
      return;
    }

    const interval = node.interval;

    if (node.left !== null && node.left.max >= lo) {
      this._searchRange(node.left, lo, hi, result);
    }

    if (interval.lo <= hi && interval.hi >= lo) {
      result.push(interval);
    }

    if (node.right !== null && interval.lo <= hi) {
      this._searchRange(node.right, lo, hi, result);
    }
  }

  overlaps(lo: number, hi: number): boolean {
    return this._overlaps(this.root, lo, hi);
  }

  private _overlaps(node: Node<T> | null, lo: number, hi: number): boolean {
    if (node === null) {
      return false;
    }

    if (node.interval.lo <= hi && node.interval.hi >= lo) {
      return true;
    }

    if (node.left !== null && node.left.max >= lo) {
      if (this._overlaps(node.left, lo, hi)) {
        return true;
      }
    }

    if (node.right !== null && node.interval.lo <= hi) {
      if (this._overlaps(node.right, lo, hi)) {
        return true;
      }
    }

    return false;
  }

  remove(lo: number, hi: number): boolean {
    const found = this._find(this.root, lo, hi);
    if (!found) {
      return false;
    }
    this.root = this._remove(this.root, lo, hi);
    this._size--;
    return true;
  }

  private _find(node: Node<T> | null, lo: number, hi: number): boolean {
    if (node === null) {
      return false;
    }

    if (node.interval.lo === lo && node.interval.hi === hi) {
      return true;
    }

    if (lo < node.interval.lo) {
      return this._find(node.left, lo, hi);
    } else {
      return this._find(node.right, lo, hi);
    }
  }

  private _remove(node: Node<T> | null, lo: number, hi: number): Node<T> | null {
    if (node === null) {
      return null;
    }

    if (lo < node.interval.lo) {
      node.left = this._remove(node.left, lo, hi);
    } else if (lo > node.interval.lo) {
      node.right = this._remove(node.right, lo, hi);
    } else if (hi !== node.interval.hi) {
      node.right = this._remove(node.right, lo, hi);
    } else {
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      }

      const minNode = this._findMin(node.right);
      node.interval = minNode.interval;
      node.right = this._remove(node.right, minNode.interval.lo, minNode.interval.hi);
    }

    if (node !== null) {
      this._updateMax(node);
      node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
      return this._balance(node);
    }

    return node;
  }

  private _findMin(node: Node<T>): Node<T> {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  toArray(): Interval<T>[] {
    const result: Interval<T>[] = [];
    this._inorder(this.root, result);
    return result;
  }

  private _inorder(node: Node<T> | null, result: Interval<T>[]): void {
    if (node === null) {
      return;
    }
    this._inorder(node.left, result);
    result.push(node.interval);
    this._inorder(node.right, result);
  }

  forEach(callback: (interval: Interval<T>, index: number) => void): void {
    const indexHolder = { value: 0 };
    this._forEach(this.root, callback, indexHolder);
  }

  private _forEach(node: Node<T> | null, callback: (interval: Interval<T>, index: number) => void, indexHolder: { value: number }): void {
    if (node === null) {
      return;
    }
    this._forEach(node.left, callback, indexHolder);
    callback(node.interval, indexHolder.value++);
    this._forEach(node.right, callback, indexHolder);
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }
}

export class IntervalTree<T = unknown> extends IntervalTree2<T> {}
