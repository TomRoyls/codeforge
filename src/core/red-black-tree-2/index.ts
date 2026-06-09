type Comparator<T> = (a: T, b: T) => number;

enum Color {
  RED,
  BLACK
}

class RBNode<T> {
  constructor(
    public data: T,
    public color: Color = Color.RED,
    public left: RBNode<T> | null = null,
    public right: RBNode<T> | null = null,
    public parent: RBNode<T> | null = null
  ) {}
}

export class RedBlackTree2<T> {
  private root: RBNode<T> | null = null;
  private _size: number = 0;

  constructor(private comparator: Comparator<T> = (a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }) {}

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(data: T): void {
    const newNode = new RBNode(data);
    
    if (this.root === null) {
      this.root = newNode;
      this.root.color = Color.BLACK;
      this._size++;
      return;
    }

    let current = this.root;
    let parent: RBNode<T> | null = null;

    while (current !== null) {
      parent = current;
      const cmp = this.comparator(data, current.data);
      
      if (cmp === 0) {
        return;
      } else if (cmp < 0) {
        current = current.left!;
      } else {
        current = current.right!;
      }
    }

    newNode.parent = parent;
    const cmp = this.comparator(data, parent!.data);
    
    if (cmp < 0) {
      parent!.left = newNode;
    } else {
      parent!.right = newNode;
    }

    this._size++;
    this.insertFixup(newNode);
  }

  private insertFixup(node: RBNode<T>): void {
    while (node.parent !== null && node.parent.color === Color.RED) {
      if (node.parent === node.parent.parent!.left) {
        const uncle = node.parent.parent!.right;

        if (uncle !== null && uncle.color === Color.RED) {
          node.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          node.parent.parent!.color = Color.RED;
          node = node.parent.parent!;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            this.rotateLeft(node);
          }

          node.parent!.color = Color.BLACK;
          node.parent!.parent!.color = Color.RED;
          this.rotateRight(node.parent!.parent!);
        }
      } else {
        const uncle = node.parent.parent!.left;

        if (uncle !== null && uncle.color === Color.RED) {
          node.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          node.parent.parent!.color = Color.RED;
          node = node.parent.parent!;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this.rotateRight(node);
          }

          node.parent!.color = Color.BLACK;
          node.parent!.parent!.color = Color.RED;
          this.rotateLeft(node.parent!.parent!);
        }
      }
    }

    this.root!.color = Color.BLACK;
  }

  private rotateLeft(node: RBNode<T>): void {
    const rightChild = node.right!;
    node.right = rightChild.left;

    if (rightChild.left !== null) {
      rightChild.left.parent = node;
    }

    rightChild.parent = node.parent;

    if (node.parent === null) {
      this.root = rightChild;
    } else if (node === node.parent.left) {
      node.parent.left = rightChild;
    } else {
      node.parent.right = rightChild;
    }

    rightChild.left = node;
    node.parent = rightChild;
  }

  private rotateRight(node: RBNode<T>): void {
    const leftChild = node.left!;
    node.left = leftChild.right;

    if (leftChild.right !== null) {
      leftChild.right.parent = node;
    }

    leftChild.parent = node.parent;

    if (node.parent === null) {
      this.root = leftChild;
    } else if (node === node.parent.right) {
      node.parent.right = leftChild;
    } else {
      node.parent.left = leftChild;
    }

    leftChild.right = node;
    node.parent = leftChild;
  }

  search(data: T): T | null {
    let current = this.root;

    while (current !== null) {
      const cmp = this.comparator(data, current.data);
      
      if (cmp === 0) {
        return current.data;
      } else if (cmp < 0) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return null;
  }

  contains(data: T): boolean {
    return this.search(data) !== null;
  }

  min(): T | null {
    let current = this.root;

    if (current === null) {
      return null;
    }

    while (current.left !== null) {
      current = current.left;
    }

    return current.data;
  }

  max(): T | null {
    let current = this.root;

    if (current === null) {
      return null;
    }

    while (current.right !== null) {
      current = current.right;
    }

    return current.data;
  }

  delete(data: T): boolean {
    const node = this.findNode(data);

    if (node === null) {
      return false;
    }

    let y = node;
    let yOriginalColor = y.color;
    let x: RBNode<T> | null;

    if (node.left === null) {
      x = node.right;
      this.transplant(node, node.right);
    } else if (node.right === null) {
      x = node.left;
      this.transplant(node, node.left);
    } else {
      y = this.minimumNode(node.right);
      yOriginalColor = y.color;
      x = y.right;
      
      if (y.parent === node) {
        if (x !== null) {
          x.parent = y;
        }
      } else {
        this.transplant(y, y.right);
        y.right = node.right;
        y.right.parent = y;
      }

      this.transplant(node, y);
      y.left = node.left;
      y.left.parent = y;
      y.color = node.color;
    }

    if (yOriginalColor === Color.BLACK) {
      if (x !== null) {
        this.deleteFixup(x);
      }
    }

    this._size--;
    return true;
  }

  private findNode(data: T): RBNode<T> | null {
    let current = this.root;

    while (current !== null) {
      const cmp = this.comparator(data, current.data);
      
      if (cmp === 0) {
        return current;
      } else if (cmp < 0) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return null;
  }

  private minimumNode(node: RBNode<T>): RBNode<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  private transplant(u: RBNode<T>, v: RBNode<T> | null): void {
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

  private deleteFixup(node: RBNode<T>): void {
    while (node !== this.root && node.color === Color.BLACK) {
      if (node === node.parent!.left) {
        let sibling = node.parent!.right;

        if (sibling !== null && sibling.color === Color.RED) {
          sibling.color = Color.BLACK;
          node.parent!.color = Color.RED;
          this.rotateLeft(node.parent!);
          sibling = node.parent!.right;
        }

        if (sibling !== null) {
          if ((sibling.left === null || sibling.left.color === Color.BLACK) &&
              (sibling.right === null || sibling.right.color === Color.BLACK)) {
            sibling.color = Color.RED;
            node = node.parent!;
          } else {
            if (sibling.right === null || sibling.right.color === Color.BLACK) {
              if (sibling.left !== null) {
                sibling.left.color = Color.BLACK;
              }
              sibling.color = Color.RED;
              this.rotateRight(sibling);
              sibling = node.parent!.right;
            }

            sibling!.color = node.parent!.color;
            node.parent!.color = Color.BLACK;
            if (sibling!.right !== null) {
              sibling!.right.color = Color.BLACK;
            }
            this.rotateLeft(node.parent!);
            node = this.root!;
          }
        } else {
          node = node.parent!;
        }
      } else {
        let sibling = node.parent!.left;

        if (sibling !== null && sibling.color === Color.RED) {
          sibling.color = Color.BLACK;
          node.parent!.color = Color.RED;
          this.rotateRight(node.parent!);
          sibling = node.parent!.left;
        }

        if (sibling !== null) {
          if ((sibling.right === null || sibling.right.color === Color.BLACK) &&
              (sibling.left === null || sibling.left.color === Color.BLACK)) {
            sibling.color = Color.RED;
            node = node.parent!;
          } else {
            if (sibling.left === null || sibling.left.color === Color.BLACK) {
              if (sibling.right !== null) {
                sibling.right.color = Color.BLACK;
              }
              sibling.color = Color.RED;
              this.rotateLeft(sibling!);
              sibling = node.parent!.left;
            }

            sibling!.color = node.parent!.color;
            node.parent!.color = Color.BLACK;
            if (sibling!.left !== null) {
              sibling!.left.color = Color.BLACK;
            }
            this.rotateRight(node.parent!);
            node = this.root!;
          }
        } else {
          node = node.parent!;
        }
      }
    }

    node.color = Color.BLACK;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    this.inOrderTraversal((data) => result.push(data));
    return result;
  }

  inOrderTraversal(callback: (data: T) => void): void {
    this.inOrder(this.root, callback);
  }

  private inOrder(node: RBNode<T> | null, callback: (data: T) => void): void {
    if (node === null) {
      return;
    }

    this.inOrder(node.left, callback);
    callback(node.data);
    this.inOrder(node.right, callback);
  }

  rangeQuery(min: T, max: T): T[] {
    const result: T[] = [];
    this.rangeQueryHelper(this.root, min, max, result);
    return result;
  }

  private rangeQueryHelper(node: RBNode<T> | null, min: T, max: T, result: T[]): void {
    if (node === null) {
      return;
    }

    const cmpMin = this.comparator(node.data, min);
    const cmpMax = this.comparator(node.data, max);

    if (cmpMin > 0) {
      this.rangeQueryHelper(node.left, min, max, result);
    }

    if (cmpMin >= 0 && cmpMax <= 0) {
      result.push(node.data);
    }

    if (cmpMax < 0) {
      this.rangeQueryHelper(node.right, min, max, result);
    }
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
