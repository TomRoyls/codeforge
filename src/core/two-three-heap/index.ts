type Node<T> = {
  value: T;
  children: Node<T>[];
};

export class TwoThreeHeap<T> {
  private heap: Node<T>[] = [];
  private compare: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): void {
    const newNode: Node<T> = { value, children: [] };
    this.heap.push(newNode);
    this.maintainHeap();
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const minNode = this.heap.shift()!;
    const value = minNode.value;
    for (const child of minNode.children) {
      this.heap.push(child);
    }
    this.maintainHeap();
    return value;
  }

  peek(): T | undefined {
    if (this.heap.length === 0) return undefined;
    return this.heap[0]!.value;
  }

  get size(): number {
    let count = 0;
    for (const node of this.heap) {
      count += this.countNodes(node);
    }
    return count;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  clear(): void {
    this.heap = [];
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const node of this.heap) {
      this.collectNodes(node, result);
    }
    return result.sort((a, b) => this.compare(a, b));
  }

  meld(other: TwoThreeHeap<T>): void {
    for (const node of other.heap) {
      this.heap.push(node);
    }
    other.clear();
    this.maintainHeap();
  }

  private maintainHeap(): void {
    if (this.heap.length <= 1) return;
    this.heap.sort((a, b) => this.compare(a.value, b.value));
  }

  private countNodes(node: Node<T>): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private collectNodes(node: Node<T>, result: T[]): void {
    result.push(node.value);
    for (const child of node.children) {
      this.collectNodes(child, result);
    }
  }
}
