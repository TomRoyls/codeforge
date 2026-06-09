enum Color {
  Red,
  Black
}

class RBNode<T> {
  value: T;
  color: Color;
  left: RBNode<T> | null;
  right: RBNode<T> | null;
  parent: RBNode<T> | null;

  constructor(value: T, color: Color = Color.Red) {
    this.value = value;
    this.color = color;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class RedBlackTree3<T> {
  private root: RBNode<T> | null;
  private compare: (a: T, b: T) => number;
  private _size: number;

  constructor(compare?: (a: T, b: T) => number) {
    this.root = null;
    this.compare = compare || ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this._size = 0;
  }

  private _compare(a: T, b: T): number {
    return this.compare(a, b);
  }

  insert(value: T): void {
    const newNode = new RBNode<T>(value, Color.Red);
    let parent: RBNode<T> | null = null;
    let current = this.root;

    while (current !== null) {
      parent = current;
      const cmp = this._compare(value, current.value);
      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        current = current.right;
      } else {
        return;
      }
    }

    newNode.parent = parent;
    if (parent === null) {
      this.root = newNode;
    } else if (this._compare(value, parent.value) < 0) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    this._size++;
    this._insertFixup(newNode);
  }

  private _insertFixup(node: RBNode<T>): void {
    while (node !== this.root && node.parent !== null && node.parent.color === Color.Red) {
      const parent = node.parent;
      const grandparent = parent.parent;

      if (grandparent === null) break;

      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        if (uncle !== null && uncle.color === Color.Red) {
          parent.color = Color.Black;
          uncle.color = Color.Black;
          grandparent.color = Color.Red;
          node = grandparent;
        } else {
          if (node === parent.right) {
            node = parent;
            this._leftRotate(node);
          }
          if (node.parent !== null && grandparent !== null) {
            node.parent.color = Color.Black;
            grandparent.color = Color.Red;
            this._rightRotate(grandparent);
          }
        }
      } else {
        const uncle = grandparent.left;
        if (uncle !== null && uncle.color === Color.Red) {
          parent.color = Color.Black;
          uncle.color = Color.Black;
          grandparent.color = Color.Red;
          node = grandparent;
        } else {
          if (node === parent.left) {
            node = parent;
            this._rightRotate(node);
          }
          if (node.parent !== null && grandparent !== null) {
            node.parent.color = Color.Black;
            grandparent.color = Color.Red;
            this._leftRotate(grandparent);
          }
        }
      }
    }

    if (this.root !== null) {
      this.root.color = Color.Black;
    }
  }

  private _leftRotate(x: RBNode<T>): void {
    const y = x.right;
    if (y === null) return;

    x.right = y.left;
    if (y.left !== null) {
      y.left.parent = x;
    }

    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
  }

  private _rightRotate(y: RBNode<T>): void {
    const x = y.left;
    if (x === null) return;

    y.left = x.right;
    if (x.right !== null) {
      x.right.parent = y;
    }

    x.parent = y.parent;
    if (y.parent === null) {
      this.root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }

    x.right = y;
    y.parent = x;
  }

  remove(value: T): boolean {
    const node = this._searchNode(value);
    if (node === null) return false;

    let originalColor = node.color;
    let x: RBNode<T> | null;
    let xParent: RBNode<T> | null = node.parent;

    if (node.left === null) {
      x = node.right;
      this._transplant(node, node.right);
    } else if (node.right === null) {
      x = node.left;
      this._transplant(node, node.left);
    } else {
      const successor = this._minimumNode(node.right)!;
      originalColor = successor.color;
      x = successor.right;
      xParent = successor;

      if (successor.parent !== node) {
        xParent = successor.parent;
        this._transplant(successor, successor.right!);
        successor.right = node.right;
        if (successor.right !== null) {
          successor.right.parent = successor;
        }
      }

      this._transplant(node, successor);
      successor.left = node.left;
      if (successor.left !== null) {
        successor.left.parent = successor;
      }
      successor.color = node.color;
    }

    this._size--;

    if (originalColor === Color.Black) {
      if (x === null) {
        this._deleteFixup(x, xParent);
      } else {
        this._deleteFixup(x, x.parent);
      }
    }

    return true;
  }

  private _transplant(u: RBNode<T>, v: RBNode<T> | null): void {
    if (u.parent === null) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }

    if (v !== null) {
      v.parent = u.parent;
    }
  }

  private _deleteFixup(x: RBNode<T> | null, parent: RBNode<T> | null): void {
    while (x !== this.root && (x === null || x.color === Color.Black)) {
      if (parent === null) break;

      if (x === parent.left) {
        let sibling = parent.right;
        if (sibling !== null && sibling.color === Color.Red) {
          sibling.color = Color.Black;
          parent.color = Color.Red;
          this._leftRotate(parent);
          sibling = parent.right;
        }

        if (sibling !== null &&
            (sibling.left === null || sibling.left.color === Color.Black) &&
            (sibling.right === null || sibling.right.color === Color.Black)) {
          sibling.color = Color.Red;
          x = parent;
          parent = x.parent;
        } else if (sibling !== null) {
          if (sibling.right === null || sibling.right.color === Color.Black) {
            if (sibling.left !== null) {
              sibling.left.color = Color.Black;
            }
            sibling.color = Color.Red;
            this._rightRotate(sibling);
            sibling = parent.right;
          }

          if (sibling !== null && sibling.right !== null) {
            sibling.color = parent.color;
            parent.color = Color.Black;
            sibling.right.color = Color.Black;
            this._leftRotate(parent);
          }
          x = this.root;
        } else {
          x = parent;
          parent = x.parent;
        }
      } else {
        let sibling = parent.left;
        if (sibling !== null && sibling.color === Color.Red) {
          sibling.color = Color.Black;
          parent.color = Color.Red;
          this._rightRotate(parent);
          sibling = parent.left;
        }

        if (sibling !== null &&
            (sibling.left === null || sibling.left.color === Color.Black) &&
            (sibling.right === null || sibling.right.color === Color.Black)) {
          sibling.color = Color.Red;
          x = parent;
          parent = x.parent;
        } else if (sibling !== null) {
          if (sibling.left === null || sibling.left.color === Color.Black) {
            if (sibling.right !== null) {
              sibling.right.color = Color.Black;
            }
            sibling.color = Color.Red;
            this._leftRotate(sibling);
            sibling = parent.left;
          }

          if (sibling !== null && sibling.left !== null) {
            sibling.color = parent.color;
            parent.color = Color.Black;
            sibling.left.color = Color.Black;
            this._rightRotate(parent);
          }
          x = this.root;
        } else {
          x = parent;
          parent = x.parent;
        }
      }
    }

    if (x !== null) {
      x.color = Color.Black;
    }
  }

  search(value: T): boolean {
    return this._searchNode(value) !== null;
  }

  contains(value: T): boolean {
    return this.search(value);
  }

  private _searchNode(value: T): RBNode<T> | null {
    let current = this.root;
    while (current !== null) {
      const cmp = this._compare(value, current.value);
      if (cmp === 0) return current;
      else if (cmp < 0) current = current.left;
      else current = current.right;
    }
    return null;
  }

  min(): T | undefined {
    const node = this._minimumNode(this.root);
    return node ? node.value : undefined;
  }

  private _minimumNode(node: RBNode<T> | null): RBNode<T> | null {
    if (node === null) return null;
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  max(): T | undefined {
    const node = this._maximumNode(this.root);
    return node ? node.value : undefined;
  }

  private _maximumNode(node: RBNode<T> | null): RBNode<T> | null {
    if (node === null) return null;
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this._inorderTraversal(this.root, result);
    return result;
  }

  private _inorderTraversal(node: RBNode<T> | null, result: T[]): void {
    if (node === null) return;
    this._inorderTraversal(node.left, result);
    result.push(node.value);
    this._inorderTraversal(node.right, result);
  }

  forEach(callback: (value: T) => void): void {
    const arr = this.toArray();
    for (const value of arr) {
      callback(value);
    }
  }

  predecessor(value: T): T | undefined {
    const node = this._searchNode(value);
    if (node === null) return undefined;

    if (node.left !== null) {
      const pred = this._maximumNode(node.left);
      return pred ? pred.value : undefined;
    }

    let parent = node.parent;
    let current = node;
    while (parent !== null && current === parent.left) {
      current = parent;
      parent = parent.parent;
    }

    return parent ? parent.value : undefined;
  }

  successor(value: T): T | undefined {
    const node = this._searchNode(value);
    if (node === null) return undefined;

    if (node.right !== null) {
      const succ = this._minimumNode(node.right);
      return succ ? succ.value : undefined;
    }

    let parent = node.parent;
    let current = node;
    while (parent !== null && current === parent.right) {
      current = parent;
      parent = parent.parent;
    }

    return parent ? parent.value : undefined;
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = [];
    this._rangeSearchHelper(this.root, low, high, result);
    return result;
  }

  private _rangeSearchHelper(node: RBNode<T> | null, low: T, high: T, result: T[]): void {
    if (node === null) return;

    const cmpLow = this._compare(node.value, low);
    const cmpHigh = this._compare(node.value, high);

    if (cmpLow > 0) {
      this._rangeSearchHelper(node.left, low, high, result);
    }

    if (cmpLow >= 0 && cmpHigh <= 0) {
      result.push(node.value);
    }

    if (cmpHigh < 0) {
      this._rangeSearchHelper(node.right, low, high, result);
    }
  }

  height(): number {
    return this._calculateHeight(this.root);
  }

  private _calculateHeight(node: RBNode<T> | null): number {
    if (node === null) return 0;
    const leftHeight = this._calculateHeight(node.left);
    const rightHeight = this._calculateHeight(node.right);
    return Math.max(leftHeight, rightHeight) + 1;
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
