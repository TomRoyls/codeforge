export class FibonacciHeapNode<T> {
  value: T;
  degree: number;
  parent: FibonacciHeapNode<T> | null;
  child: FibonacciHeapNode<T> | null;
  left: FibonacciHeapNode<T>;
  right: FibonacciHeapNode<T>;
  marked: boolean;

  constructor(value: T) {
    this.value = value;
    this.degree = 0;
    this.parent = null;
    this.child = null;
    this.left = this;
    this.right = this;
    this.marked = false;
  }
}

export class FibonacciHeap4<T> {
  private minNode: FibonacciHeapNode<T> | null;
  private _size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.minNode = null;
    this._size = 0;
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  insert(value: T): FibonacciHeapNode<T> {
    const node = new FibonacciHeapNode(value);
    if (this.minNode === null) {
      this.minNode = node;
      node.left = node;
      node.right = node;
    } else {
      this.addToRootList(node);
      if (this.comparator(node.value, this.minNode.value) < 0) {
        this.minNode = node;
      }
    }
    this._size++;
    return node;
  }

  peek(): T | null {
    return this.minNode ? this.minNode.value : null;
  }

  extractMin(): T | null {
    if (this.minNode === null) return null;
    const min = this.minNode;
    if (min.child !== null) {
      let child = min.child;
      const children: FibonacciHeapNode<T>[] = [];
      do {
        children.push(child);
        child = child.right;
      } while (child !== min.child);
      for (const c of children) {
        this.addToRootList(c);
        c.parent = null;
      }
    }
    this.removeFromRootList(min);
    if (min === min.right) {
      this.minNode = null;
    } else {
      this.minNode = min.right;
      this.consolidate();
    }
    this._size--;
    return min.value;
  }

  merge(other: FibonacciHeap4<T>): void {
    if (other.minNode === null) return;
    if (this.minNode === null) {
      this.minNode = other.minNode;
      this._size = other._size;
      return;
    }
    this.mergeRootLists(other);
    if (this.comparator(other.minNode.value, this.minNode.value) < 0) {
      this.minNode = other.minNode;
    }
    this._size += other._size;
    other.minNode = null;
    other._size = 0;
  }

  decreaseKey(node: FibonacciHeapNode<T>, newValue: T): void {
    if (this.comparator(newValue, node.value) > 0) {
      return;
    }
    node.value = newValue;
    const parent = node.parent;
    if (parent !== null && this.comparator(node.value, parent.value) < 0) {
      this.cut(node, parent);
      this.cascadingCut(parent);
    }
    if (this.comparator(node.value, this.minNode!.value) < 0) {
      this.minNode = node;
    }
  }

  delete(node: FibonacciHeapNode<T>): void {
    if (this.minNode === null) return;
    let parent = node.parent;
    if (parent !== null) {
      this.cut(node, parent);
      this.cascadingCut(parent);
    }
    this.minNode = node;
    this.extractMin();
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.minNode = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    if (this.minNode === null) return result;
    const visited = new Set<FibonacciHeapNode<T>>();
    const stack: FibonacciHeapNode<T>[] = [this.minNode];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);
      result.push(node.value);
      let sibling = node.right;
      while (sibling !== node) {
        if (!visited.has(sibling)) {
          stack.push(sibling);
        }
        sibling = sibling.right;
      }
      if (node.child !== null) {
        stack.push(node.child);
      }
    }
    return result;
  }

  private addToRootList(node: FibonacciHeapNode<T>): void {
    if (this.minNode === null) {
      this.minNode = node;
      node.left = node;
      node.right = node;
      return;
    }
    const minNode = this.minNode!;
    node.left = minNode.left;
    node.right = minNode;
    minNode.left.right = node;
    minNode.left = node;
  }

  private removeFromRootList(node: FibonacciHeapNode<T>): void {
    node.left.right = node.right;
    node.right.left = node.left;
  }

  private mergeRootLists(other: FibonacciHeap4<T>): void {
    if (other.minNode === null) return;
    const otherMin = other.minNode!;
    const thisMinLeft = this.minNode!.left!;
    const otherMinRight = otherMin.right!;
    thisMinLeft.right = otherMin;
    otherMin.left = thisMinLeft!;
    this.minNode!.left = otherMinRight;
    otherMinRight.right = this.minNode!;
  }

  private link(child: FibonacciHeapNode<T>, parent: FibonacciHeapNode<T>): void {
    this.removeFromRootList(child);
    child.parent = parent;
    if (parent.child === null) {
      parent.child = child;
      child.left = child;
      child.right = child;
    } else {
      const pChild = parent.child!;
      child.left = pChild.left;
      child.right = pChild;
      pChild.left.right = child;
      pChild.left = child;
    }
    parent.degree++;
    child.marked = false;
  }

  private consolidate(): void {
    const maxDegree = Math.floor(Math.log2(this._size)) + 1;
    const degreeTable: (FibonacciHeapNode<T> | null)[] = new Array(maxDegree + 1).fill(null);
    let current = this.minNode;
    const nodes: FibonacciHeapNode<T>[] = [];
    do {
      nodes.push(current!);
      current = current!.right;
    } while (current !== this.minNode);
    for (const node of nodes) {
      let x = node;
      let d = x.degree;
      while (degreeTable[d] !== null) {
        let y = degreeTable[d]!;
        if (this.comparator(x.value, y.value) > 0) {
          const temp = x;
          x = y;
          y = temp;
        }
        this.link(y, x);
        degreeTable[d] = null;
        d++;
      }
      degreeTable[d] = x;
    }
    this.minNode = null;
    for (let i = 0; i < degreeTable.length; i++) {
      if (degreeTable[i] !== null) {
        const node = degreeTable[i]!;
        if (this.minNode === null) {
          this.minNode = node;
          node.left = node;
          node.right = node;
        } else {
          this.addToRootList(node);
          if (this.comparator(node.value, this.minNode.value) < 0) {
            this.minNode = node;
          }
        }
      }
    }
  }

  private cut(node: FibonacciHeapNode<T>, parent: FibonacciHeapNode<T>): void {
    if (node.right === node) {
      parent.child = null;
    } else {
      if (parent.child === node) {
        parent.child = node.right;
      }
      node.left.right = node.right;
      node.right.left = node.left;
    }
    parent.degree--;
    this.addToRootList(node);
    node.parent = null;
    node.marked = false;
  }

  private cascadingCut(node: FibonacciHeapNode<T>): void {
    const parent = node.parent;
    if (parent !== null) {
      if (!node.marked) {
        node.marked = true;
      } else {
        this.cut(node, parent);
        this.cascadingCut(parent);
      }
    }
  }
}