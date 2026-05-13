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

  constructor(interval: Interval<T>) {
    this.interval = interval;
    this.max = interval.hi;
  }
}

export class IntervalTree2<T = unknown> {
  private root: Node<T> | null = null;
  private _size = 0;

  insert(lo: number, hi: number, value?: T): void {
    if (lo > hi) {
      throw new Error('Invalid interval: lo cannot be greater than hi');
    }
    const interval: Interval<T> = { lo, hi, value };
    this.root = this._insert(this.root, interval);
    this._size++;
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
    return node;
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

  search(point: number): Interval<T>[] {
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

    if (node.right !== null && point >= node.interval.lo) {
      this._search(node.right, point, result);
    }
  }

  searchRange(lo: number, hi: number): Interval<T>[] {
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

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }
}
