import type { Comparator, RangeTreeOptions, TreeNode } from "./types.js";

function defaultCompare<T>(a: T, b: T): number {
  if (typeof a === "number" && typeof b === "number") {
    return (a as number) - (b as number);
  }
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

export class RangeTree<T> {
  private root: TreeNode<T> | null = null;
  private compare: Comparator<T>;
  private _size = 0;

  constructor(points?: Iterable<T>, options?: RangeTreeOptions<T>) {
    this.compare = options?.comparator ?? defaultCompare;
    if (points) {
      for (const p of points) {
        this.root = this.insertNode(this.root, p);
        this._size++;
      }
    }
  }

  private height(node: TreeNode<T> | null): number {
    return node?.height ?? 0;
  }

  private updateHeight(node: TreeNode<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  private balanceFactor(node: TreeNode<T>): number {
    return this.height(node.left) - this.height(node.right);
  }

  private rotateRight(y: TreeNode<T>): TreeNode<T> {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  private rotateLeft(x: TreeNode<T>): TreeNode<T> {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  private balance(node: TreeNode<T>): TreeNode<T> {
    this.updateHeight(node);
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

  private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return { value, left: null, right: null, height: 1 };
    }
    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else {
      node.right = this.insertNode(node.right, value);
    }
    return this.balance(node);
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
    this._size++;
  }

  queryRange(lo: T, hi: T): T[] {
    const result: T[] = [];
    this.queryRangeHelper(this.root, lo, hi, result);
    return result;
  }

  private queryRangeHelper(node: TreeNode<T> | null, lo: T, hi: T, result: T[]): void {
    if (node === null) return;
    const cmpLo = this.compare(node.value, lo);
    const cmpHi = this.compare(node.value, hi);
    if (cmpLo >= 0) {
      this.queryRangeHelper(node.left, lo, hi, result);
    }
    if (cmpLo >= 0 && cmpHi <= 0) {
      result.push(node.value);
    }
    if (cmpHi <= 0) {
      this.queryRangeHelper(node.right, lo, hi, result);
    }
  }

  queryPoint(point: T): boolean {
    let node = this.root;
    while (node !== null) {
      const cmp = this.compare(point, node.value);
      if (cmp === 0) return true;
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(node: TreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.inOrder(node.left, result);
    result.push(node.value);
    this.inOrder(node.right, result);
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0;
    const walk = (node: TreeNode<T> | null) => {
      if (node === null) return;
      walk(node.left);
      callback(node.value, idx++);
      walk(node.right);
    };
    walk(this.root);
  }

  get minX(): T | undefined {
    if (this.root === null) return undefined;
    let node = this.root;
    while (node.left !== null) node = node.left;
    return node.value;
  }

  get maxX(): T | undefined {
    if (this.root === null) return undefined;
    let node = this.root;
    while (node.right !== null) node = node.right;
    return node.value;
  }

  count(lo: T, hi: T): number {
    return this.queryRange(lo, hi).length;
  }

  nearest(point: T): T | undefined {
    if (this.root === null) return undefined;
    let best = this.root.value;
    let bestDist = Math.abs(this.compare(point, best));
    const stack: TreeNode<T>[] = [this.root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      const cmp = this.compare(point, node.value);
      const dist = cmp < 0 ? -cmp : cmp;
      if (dist < bestDist || (dist === bestDist && this.compare(node.value, best) < 0)) {
        bestDist = dist;
        best = node.value;
      }
      if (cmp < 0) {
        if (node.left !== null) stack.push(node.left);
        if (node.right !== null && dist <= bestDist) stack.push(node.right);
      } else if (cmp > 0) {
        if (node.right !== null) stack.push(node.right);
        if (node.left !== null && dist <= bestDist) stack.push(node.left);
      }
    }
    return best;
  }

  kNearest(point: T, k: number): T[] {
    if (this.root === null || k <= 0) return [];
    const candidates: { value: T; distance: number }[] = [];
    this.kNearestHelper(this.root, point, k, candidates);
    candidates.sort((a, b) => a.distance - b.distance || this.compare(a.value, b.value));
    return candidates.slice(0, k).map((c) => c.value);
  }

  private kNearestHelper(
    node: TreeNode<T> | null,
    point: T,
    k: number,
    candidates: { value: T; distance: number }[]
  ): void {
    if (node === null) return;
    const cmp = this.compare(point, node.value);
    const dist = cmp < 0 ? -cmp : cmp;
    candidates.push({ value: node.value, distance: dist });
    candidates.sort((a, b) => a.distance - b.distance || this.compare(a.value, b.value));
    if (candidates.length > k) candidates.length = k;

    const primary = cmp < 0 ? node.left : node.right;
    const secondary = cmp < 0 ? node.right : node.left;

    this.kNearestHelper(primary, point, k, candidates);

    if (secondary !== null) {
      const threshold =
        candidates.length < k ? Infinity : candidates[candidates.length - 1]!.distance;
      if (dist <= threshold) {
        this.kNearestHelper(secondary, point, k, candidates);
      }
    }
  }

  remove(value: T): boolean {
    const found = { value: false };
    this.root = this.removeNode(this.root, value, found);
    if (found.value) {
      this._size--;
      return true;
    }
    return false;
  }

  private removeNode(
    node: TreeNode<T> | null,
    value: T,
    found: { value: boolean }
  ): TreeNode<T> | null {
    if (node === null) return null;
    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this.removeNode(node.left, value, found);
    } else if (cmp > 0) {
      node.right = this.removeNode(node.right, value, found);
    } else {
      found.value = true;
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;
      let successor = node.right;
      while (successor.left !== null) successor = successor.left;
      node.value = successor.value;
      node.right = this.removeNode(node.right, successor.value, { value: false });
    }
    return this.balance(node);
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  contains(value: T): boolean {
    return this.queryPoint(value);
  }
}
