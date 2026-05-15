import type { GallopingHeapOptions } from "./types.js";

type GallopingHeapNode<T> = {
  value: T;
  children: GallopingHeapNode<T>[];
};

export class GallopingHeap<T> {
  private _root: GallopingHeapNode<T> | null = null;
  private _size = 0;
  private readonly _capacity: number | undefined;

  constructor(options: GallopingHeapOptions = {}) {
    this._capacity = options.capacity;
  }

  insert(value: T): GallopingHeapNode<T> {
    if (this._capacity !== undefined && this._size >= this._capacity) {
      throw new Error("Heap is at capacity");
    }

    const node: GallopingHeapNode<T> = { value, children: [] };
    this._root = this._mergeNodes(this._root, node);
    this._size++;
    return node;
  }

  extractMin(): T | undefined {
    if (this._root === null) {
      return undefined;
    }

    const minValue = this._root.value;
    this._root = this._mergePairs(this._root.children);
    this._size--;
    return minValue;
  }

  peek(): T | undefined {
    return this._root?.value;
  }

  merge(other: GallopingHeap<T>): void {
    if (other._size === 0) {
      return;
    }

    if (other === this) {
      return;
    }

    this._root = this._mergeNodes(this._root, other._root);
    this._size += other._size;

    if (this._capacity !== undefined) {
      this._size = Math.min(this._size, this._capacity);
    }

    other._root = null;
    other._size = 0;
  }

  decreaseKey(node: GallopingHeapNode<T>, newValue: T): void {
    if (this._root === null) {
      throw new Error("Heap is empty");
    }

    node.value = newValue;
    if (node === this._root) {
      return;
    }

    this._removeFromParent(node);
    this._root = this._mergeNodes(this._root, node);
  }

  delete(node: GallopingHeapNode<T>): void {
    if (this._root === null) {
      return;
    }

    if (node === this._root) {
      this._root = this._mergePairs(node.children);
    } else {
      this._removeFromParent(node);
      this._root = this._mergeNodes(this._root, this._mergePairs(node.children));
    }

    this._size--;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    if (this._root === null) {
      return result;
    }

    const stack: GallopingHeapNode<T>[] = [this._root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      result.push(node.value);
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]!);
      }
    }

    return result;
  }

  forEach(callback: (value: T) => void): void {
    if (this._root === null) {
      return;
    }

    const stack: GallopingHeapNode<T>[] = [this._root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      callback(node.value);
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]!);
      }
    }
  }

  private _mergeNodes(
    a: GallopingHeapNode<T> | null,
    b: GallopingHeapNode<T> | null
  ): GallopingHeapNode<T> | null {
    if (a === null) return b;
    if (b === null) return a;

    if (a.value <= b.value) {
      a.children.push(b);
      return a;
    } else {
      b.children.push(a);
      return b;
    }
  }

  private _mergePairs(nodes: GallopingHeapNode<T>[]): GallopingHeapNode<T> | null {
    if (nodes.length === 0) {
      return null;
    }

    if (nodes.length === 1) {
      return nodes[0]!;
    }

    if (nodes.length === 2) {
      return this._mergeNodes(nodes[0]!, nodes[1]!);
    }

    const mid = this._gallopingSearch(nodes);
    const left = this._mergePairs(nodes.slice(0, mid));
    const right = this._mergePairs(nodes.slice(mid));
    return this._mergeNodes(left, right);
  }

  private _gallopingSearch(nodes: GallopingHeapNode<T>[]): number {
    if (nodes.length <= 2) {
      return Math.floor(nodes.length / 2);
    }

    let step = 1;
    let prev = 0;
    while (step < nodes.length) {
      const current = Math.min(step, nodes.length);
      const pairCost = this._computePairCost(nodes, prev, current);
      const mergeCost = this._computeMergeCost(nodes, 0, nodes.length);

      if (pairCost * 2 > mergeCost) {
        return Math.floor((prev + current) / 2);
      }

      prev = current;
      step *= 2;
    }

    return Math.floor(nodes.length / 2);
  }

  private _computePairCost(
    nodes: GallopingHeapNode<T>[],
    start: number,
    end: number
  ): number {
    let cost = 0;
    for (let i = start; i < end; i += 2) {
      if (i + 1 < end) {
        cost += nodes[i]!.children.length + nodes[i + 1]!.children.length;
      }
    }
    return cost;
  }

  private _computeMergeCost(
    nodes: GallopingHeapNode<T>[],
    _start: number,
    end: number
  ): number {
    let cost = 0;
    for (let i = 0; i < end; i++) {
      cost += nodes[i]!.children.length;
    }
    return cost;
  }

  private _removeFromParent(node: GallopingHeapNode<T>): void {
    if (this._root === null) {
      return;
    }

    const parentStack: { node: GallopingHeapNode<T>; index: number }[] = [];
    this._findParent(this._root, node, parentStack);

    while (parentStack.length > 0) {
      const { node: parent, index } = parentStack.pop()!;
      if (parent.children[index] === node) {
        parent.children.splice(index, 1);
        return;
      }
    }
  }

  private _findParent(
    current: GallopingHeapNode<T>,
    target: GallopingHeapNode<T>,
    stack: { node: GallopingHeapNode<T>; index: number }[]
  ): boolean {
    for (let i = 0; i < current.children.length; i++) {
      const child = current.children[i]!;
      if (child === target) {
        stack.push({ node: current, index: i });
        return true;
      }

      if (this._findParent(child, target, stack)) {
        return true;
      }
    }
    return false;
  }
}

export type { GallopingHeapNode };
