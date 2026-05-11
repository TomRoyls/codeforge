import type { Interval, Node } from "./types.js";

export class IntervalTree<T = undefined> {
  private root: Node<T> | null = null;
  private count = 0;

  insert(lo: number, hi: number, value?: T): void {
    if (lo > hi) {
      throw new RangeError(`lo (${lo}) must be <= hi (${hi})`);
    }
    const interval: Interval<T> = { lo, hi, value: value as T };
    this.root = this.insertNode(this.root, interval);
    this.count++;
  }

  private insertNode(node: Node<T> | null, interval: Interval<T>): Node<T> {
    if (node === null) {
      return { interval, left: null, right: null, max: interval.hi, height: 1 };
    }

    const cmp = interval.lo - node.interval.lo;
    if (cmp < 0) {
      node.left = this.insertNode(node.left, interval);
    } else {
      node.right = this.insertNode(node.right, interval);
    }

    this.updateNode(node);
    return this.balance(node);
  }

  remove(lo: number, hi: number): boolean {
    const found = { value: false };
    this.root = this.removeNode(this.root, lo, hi, found);
    if (found.value) {
      this.count--;
    }
    return found.value;
  }

  private removeNode(
    node: Node<T> | null,
    lo: number,
    hi: number,
    found: { value: boolean },
  ): Node<T> | null {
    if (node === null) {
      return null;
    }

    if (lo < node.interval.lo) {
      node.left = this.removeNode(node.left, lo, hi, found);
    } else if (lo > node.interval.lo) {
      node.right = this.removeNode(node.right, lo, hi, found);
    } else {
      if (node.interval.hi === hi) {
        found.value = true;
        if (node.left === null) {
          return node.right;
        }
        if (node.right === null) {
          return node.left;
        }
        let successor = node.right;
        while (successor.left !== null) {
          successor = successor.left;
        }
        node.interval = successor.interval;
        node.right = this.removeNode(
          node.right,
          successor.interval.lo,
          successor.interval.hi,
          { value: false },
        );
      } else {
        node.right = this.removeNode(node.right, lo, hi, found);
      }
    }

    this.updateNode(node);
    return this.balance(node);
  }

  query(point: number): Interval<T>[] {
    const results: Interval<T>[] = [];
    this.queryPoint(this.root, point, results);
    return results;
  }

  private queryPoint(
    node: Node<T> | null,
    point: number,
    results: Interval<T>[],
  ): void {
    if (node === null) {
      return;
    }
    if (point > node.max) {
      return;
    }
    this.queryPoint(node.left, point, results);
    if (point >= node.interval.lo && point <= node.interval.hi) {
      results.push(node.interval);
    }
    if (point < node.interval.lo) {
      return;
    }
    this.queryPoint(node.right, point, results);
  }

  queryRange(lo: number, hi: number): Interval<T>[] {
    const results: Interval<T>[] = [];
    this.queryRangeNode(this.root, lo, hi, results);
    return results;
  }

  private queryRangeNode(
    node: Node<T> | null,
    lo: number,
    hi: number,
    results: Interval<T>[],
  ): void {
    if (node === null) {
      return;
    }
    if (lo > node.max) {
      return;
    }
    this.queryRangeNode(node.left, lo, hi, results);
    if (node.interval.lo <= hi && node.interval.hi >= lo) {
      results.push(node.interval);
    }
    if (hi < node.interval.lo) {
      return;
    }
    this.queryRangeNode(node.right, lo, hi, results);
  }

  overlaps(lo: number, hi: number): boolean {
    return this.overlapsNode(this.root, lo, hi);
  }

  private overlapsNode(
    node: Node<T> | null,
    lo: number,
    hi: number,
  ): boolean {
    if (node === null) {
      return false;
    }
    if (lo > node.max) {
      return false;
    }
    if (this.overlapsNode(node.left, lo, hi)) {
      return true;
    }
    if (node.interval.lo <= hi && node.interval.hi >= lo) {
      return true;
    }
    if (hi < node.interval.lo) {
      return false;
    }
    return this.overlapsNode(node.right, lo, hi);
  }

  get size(): number {
    return this.count;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.root = null;
    this.count = 0;
  }

  toArray(): Interval<T>[] {
    const results: Interval<T>[] = [];
    this.inOrder(this.root, results);
    return results;
  }

  private inOrder(node: Node<T> | null, results: Interval<T>[]): void {
    if (node === null) {
      return;
    }
    this.inOrder(node.left, results);
    results.push(node.interval);
    this.inOrder(node.right, results);
  }

  forEach(callback: (interval: Interval<T>, index: number) => void): void {
    let index = 0;
    const traverse = (node: Node<T> | null): void => {
      if (node === null) {
        return;
      }
      traverse(node.left);
      callback(node.interval, index++);
      traverse(node.right);
    };
    traverse(this.root);
  }

  private height(node: Node<T> | null): number {
    return node?.height ?? 0;
  }

  private updateNode(node: Node<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    node.max = node.interval.hi;
    if (node.left !== null && node.left.max > node.max) {
      node.max = node.left.max;
    }
    if (node.right !== null && node.right.max > node.max) {
      node.max = node.right.max;
    }
  }

  private balanceFactor(node: Node<T>): number {
    return this.height(node.left) - this.height(node.right);
  }

  private balance(node: Node<T>): Node<T> {
    const bf = this.balanceFactor(node);
    if (bf > 1) {
      if (this.balanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!);
      }
      return this.rotateRight(node);
    }
    if (bf < -1) {
      if (this.balanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!);
      }
      return this.rotateLeft(node);
    }
    return node;
  }

  private rotateLeft(z: Node<T>): Node<T> {
    const y = z.right!;
    const t2 = y.left;
    y.left = z;
    z.right = t2;
    this.updateNode(z);
    this.updateNode(y);
    return y;
  }

  private rotateRight(z: Node<T>): Node<T> {
    const y = z.left!;
    const t3 = y.right;
    y.right = z;
    z.left = t3;
    this.updateNode(z);
    this.updateNode(y);
    return y;
  }
}
