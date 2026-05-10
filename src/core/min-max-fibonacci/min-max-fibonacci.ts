import type {
  FibNode,
  MinMaxFibonacciOptions,
  MinMaxFibonacciStatistics,
} from "./types.js";
import { DEFAULT_MIN_MAX_FIBONACCI_OPTIONS } from "./types.js";

export class MinMaxFibonacciHeap<T> {
  private minRoot: FibNode<T> | null = null;
  private maxRoot: FibNode<T> | null = null;
  private _size = 0;
  private comparator: (a: T, b: T) => number;
  private stats: MinMaxFibonacciStatistics = {
    inserts: 0,
    deleteMins: 0,
    deleteMaxs: 0,
    consolidateCount: 0,
  };

  constructor(options: MinMaxFibonacciOptions = DEFAULT_MIN_MAX_FIBONACCI_OPTIONS) {
    if (options.comparator) {
      const cmp = options.comparator;
      this.comparator = (a: T, b: T) => {
        return cmp((a as unknown) as number, (b as unknown) as number);
      };
    } else {
      this.comparator = (a: T, b: T) => {
        const na = (a as unknown) as number;
        const nb = (b as unknown) as number;
        if (na < nb) return -1;
        if (na > nb) return 1;
        return 0;
      };
    }
  }

  private createNode(value: T): FibNode<T> {
    const node: FibNode<T> = {
      value,
      degree: 0,
      marked: false,
      parent: null,
      child: null,
      left: null!,
      right: null!,
    };
    node.left = node;
    node.right = node;
    return node;
  }

  private removeFromList(node: FibNode<T>): void {
    node.left.right = node.right;
    node.right.left = node.left;
    node.left = node;
    node.right = node;
  }

  private concatLists(a: FibNode<T> | null, b: FibNode<T> | null): FibNode<T> | null {
    if (!a) return b;
    if (!b) return a;
    const aLeft = a.left;
    const bLeft = b.left;
    a.left = bLeft;
    bLeft.right = a;
    b.left = aLeft;
    aLeft.right = b;
    return a;
  }

  private addChild(parent: FibNode<T>, child: FibNode<T>): void {
    child.parent = parent;
    child.marked = false;
    if (!parent.child) {
      parent.child = child;
      child.left = child;
      child.right = child;
    } else {
      const sibling = parent.child;
      child.left = sibling.left;
      child.right = sibling;
      sibling.left.right = child;
      sibling.left = child;
    }
    parent.degree++;
  }

  private cut(node: FibNode<T>): void {
    const parent = node.parent;
    if (!parent) return;
    if (parent.child === node) {
      if (node.left === node) {
        parent.child = null;
      } else {
        parent.child = node.left;
      }
    }
    this.removeFromList(node);
    parent.degree--;
    node.parent = null;
    node.marked = false;
    this.concatLists(this.minRoot, node);
    if (!this.minRoot) {
      this.minRoot = node;
    }
    if (parent.marked && parent.parent) {
      this.cut(parent);
    } else {
      parent.marked = true;
    }
  }

  private consolidate(): void {
    if (!this.minRoot) return;
    this.stats.consolidateCount++;
    const maxDegree = Math.floor(Math.log2(this._size)) + 2;
    const buckets: (FibNode<T> | null)[] = new Array(maxDegree + 1).fill(null);
    const roots: FibNode<T>[] = [];
    let current = this.minRoot;
    do {
      roots.push(current);
      current = current.right;
    } while (current !== this.minRoot);

    for (const root of roots) {
      let x: FibNode<T> = root;
      let degree = x.degree;
      while (degree < buckets.length && buckets[degree] !== null) {
        let y: FibNode<T> = buckets[degree]!;
        if (this.comparator(x.value, y.value) > 0) {
          const tmp = x;
          x = y;
          y = tmp;
        }
        this.removeFromList(y);
        this.addChild(x, y);
        buckets[degree] = null;
        degree++;
      }
      while (buckets.length <= degree) {
        buckets.push(null);
      }
      buckets[degree] = x;
    }

    this.minRoot = null;
    this.maxRoot = null;
    for (const bucket of buckets) {
      if (bucket) {
        bucket.left = bucket;
        bucket.right = bucket;
        if (!this.minRoot) {
          this.minRoot = bucket;
          this.maxRoot = bucket;
        } else {
          this.concatLists(this.minRoot, bucket);
          if (this.comparator(bucket.value, this.minRoot.value) < 0) {
            this.minRoot = bucket;
          }
          if (this.comparator(bucket.value, this.maxRoot!.value) > 0) {
            this.maxRoot = bucket;
          }
        }
      }
    }
  }

  private scanForMax(): void {
    if (!this.minRoot) {
      this.maxRoot = null;
      return;
    }
    let best = this.minRoot;
    const stack: FibNode<T>[] = [this.minRoot];
    const visited = new Set<FibNode<T>>();
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);
      if (this.comparator(node.value, best.value) > 0) {
        best = node;
      }
      if (node.child) {
        stack.push(node.child);
      }
      let sib = node.right;
      while (sib !== node) {
        if (!visited.has(sib)) {
          stack.push(sib);
        }
        sib = sib.right;
      }
    }
    this.maxRoot = best;
  }

  private scanForMin(): void {
    if (!this.minRoot) {
      return;
    }
    let best = this.minRoot;
    const stack: FibNode<T>[] = [this.minRoot];
    const visited = new Set<FibNode<T>>();
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);
      if (this.comparator(node.value, best.value) < 0) {
        best = node;
      }
      if (node.child) {
        stack.push(node.child);
      }
      let sib = node.right;
      while (sib !== node) {
        if (!visited.has(sib)) {
          stack.push(sib);
        }
        sib = sib.right;
      }
    }
    this.minRoot = best;
  }

  insert(value: T): FibNode<T> {
    const node = this.createNode(value);
    this.stats.inserts++;
    if (!this.minRoot) {
      this.minRoot = node;
      this.maxRoot = node;
    } else {
      this.concatLists(this.minRoot, node);
      if (this.comparator(node.value, this.minRoot.value) < 0) {
        this.minRoot = node;
      }
      if (this.comparator(node.value, this.maxRoot!.value) > 0) {
        this.maxRoot = node;
      }
    }
    this._size++;
    return node;
  }

  extractMin(): T | undefined {
    if (!this.minRoot) return undefined;
    const minNode = this.minRoot;
    const value = minNode.value;
    this.stats.deleteMins++;
    if (minNode.child) {
      let child = minNode.child;
      const start = child;
      do {
        child.parent = null;
        child = child.right;
      } while (child !== start);
      this.concatLists(this.minRoot, minNode.child);
    }
    if (minNode.left === minNode && minNode.right === minNode) {
      this.minRoot = null;
      this.maxRoot = null;
    } else {
      const next = minNode.right;
      this.removeFromList(minNode);
      this.minRoot = next;
      this.consolidate();
    }
    this._size--;
    if (this.minRoot) {
      this.scanForMax();
    }
    return value;
  }

  extractMax(): T | undefined {
    if (!this.maxRoot) return undefined;
    const maxNode = this.maxRoot;
    const value = maxNode.value;
    this.stats.deleteMaxs++;
    if (maxNode.parent) {
      this.cut(maxNode);
    }
    if (maxNode.child) {
      let child = maxNode.child;
      const start = child;
      do {
        child.parent = null;
        child = child.right;
      } while (child !== start);
      this.concatLists(this.minRoot, maxNode.child);
    }
    if (maxNode.left === maxNode && maxNode.right === maxNode) {
      this.minRoot = null;
      this.maxRoot = null;
    } else {
      const next = maxNode.right;
      this.removeFromList(maxNode);
      if (this.minRoot === maxNode) {
        this.minRoot = next;
      }
      this.consolidate();
    }
    this._size--;
    if (this.minRoot) {
      this.scanForMax();
    }
    return value;
  }

  peekMin(): T | undefined {
    return this.minRoot?.value;
  }

  peekMax(): T | undefined {
    return this.maxRoot?.value;
  }

  delete(node: FibNode<T>): void {
    if (node.parent) {
      this.cut(node);
    }
    this.minRoot = node;
    this.extractMin();
  }

  decreaseKey(node: FibNode<T>, newValue: T): void {
    if (this.comparator(newValue, node.value) >= 0) {
      return;
    }
    node.value = newValue;
    if (node.parent && this.comparator(node.value, node.parent.value) < 0) {
      this.cut(node);
    }
    if (this.comparator(node.value, this.minRoot!.value) < 0) {
      this.minRoot = node;
    }
    this.scanForMax();
  }

  increaseKey(node: FibNode<T>, newValue: T): void {
    if (this.comparator(newValue, node.value) <= 0) {
      return;
    }
    node.value = newValue;
    if (node.child) {
      const children: FibNode<T>[] = [];
      let child = node.child;
      do {
        children.push(child);
        child = child.right;
      } while (child !== node.child);
      for (const c of children) {
        if (this.comparator(c.value, node.value) < 0) {
          if (c.parent) {
            this.cut(c);
          }
        }
      }
    }
    if (this.comparator(node.value, this.maxRoot!.value) > 0) {
      this.maxRoot = node;
    }
    this.scanForMin();
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.minRoot = null;
    this.maxRoot = null;
    this._size = 0;
    this.stats = { inserts: 0, deleteMins: 0, deleteMaxs: 0, consolidateCount: 0 };
  }

  merge(other: MinMaxFibonacciHeap<T>): void {
    if (other.isEmpty) return;
    if (!this.minRoot) {
      this.minRoot = other.minRoot;
      this.maxRoot = other.maxRoot;
    } else {
      this.concatLists(this.minRoot, other.minRoot!);
      if (this.comparator(other.minRoot!.value, this.minRoot.value) < 0) {
        this.minRoot = other.minRoot;
      }
      if (this.comparator(other.maxRoot!.value, this.maxRoot!.value) > 0) {
        this.maxRoot = other.maxRoot;
      }
    }
    this._size += other._size;
    this.stats.inserts += other.stats.inserts;
    other.clear();
  }

  toArray(): T[] {
    const result: T[] = [];
    this.forEach((v) => result.push(v));
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    if (!this.minRoot) return;
    let idx = 0;
    const stack: FibNode<T>[] = [this.minRoot];
    const visited = new Set<FibNode<T>>();
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);
      callback(node.value, idx++);
      if (node.child) {
        stack.push(node.child);
      }
      const siblings: FibNode<T>[] = [];
      let sib = node.right;
      while (sib !== node) {
        if (!visited.has(sib)) {
          siblings.push(sib);
        }
        sib = sib.right;
      }
      for (let i = siblings.length - 1; i >= 0; i--) {
        stack.push(siblings[i]!);
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    if (!this.minRoot) return;
    const stack: FibNode<T>[] = [this.minRoot];
    const visited = new Set<FibNode<T>>();
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);
      yield node.value;
      if (node.child) {
        stack.push(node.child);
      }
      const siblings: FibNode<T>[] = [];
      let sib = node.right;
      while (sib !== node) {
        if (!visited.has(sib)) {
          siblings.push(sib);
        }
        sib = sib.right;
      }
      for (let i = siblings.length - 1; i >= 0; i--) {
        stack.push(siblings[i]!);
      }
    }
  }

  getStatistics(): MinMaxFibonacciStatistics {
    return { ...this.stats };
  }
}
