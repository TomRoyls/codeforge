class TrieNode {
  left: TrieNode | null = null;
  right: TrieNode | null = null;
  count: number = 0;

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }
}

export class BinaryTrie2 {
  private root: TrieNode;
  private readonly bitLength: number;
  private _size: number;

  constructor(bitLength: number = 32) {
    this.root = new TrieNode();
    this.bitLength = bitLength;
    this._size = 0;
  }

  insert(value: number): void {
    let node = this.root;
    node.increment();

    for (let i = this.bitLength - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      if (bit === 0) {
        if (!node.left) {
          node.left = new TrieNode();
        }
        node = node.left!;
      } else {
        if (!node.right) {
          node.right = new TrieNode();
        }
        node = node.right!;
      }
      node.increment();
    }

    this._size++;
  }

  has(value: number): boolean {
    let node = this.root;

    for (let i = this.bitLength - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      if (bit === 0) {
        if (!node.left) {
          return false;
        }
        node = node.left;
      } else {
        if (!node.right) {
          return false;
        }
        node = node.right;
      }
    }

    return true;
  }

  delete(value: number): boolean {
    if (!this.has(value)) {
      return false;
    }

    let node = this.root;
    const path: TrieNode[] = [node];

    for (let i = this.bitLength - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      node = bit === 0 ? node.left! : node.right!;
      path.push(node);
    }

    for (let j = path.length - 1; j >= 0; j--) {
      path[j]!.decrement();
    }

    let parent = this.root;
    for (let i = this.bitLength - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      const child = bit === 0 ? parent.left! : parent.right!;

      if (child.isEmpty() && i > 0) {
        if (bit === 0) {
          parent.left = null;
        } else {
          parent.right = null;
        }
        break;
      }

      parent = child;
    }

    this._size--;
    return true;
  }

  xorMin(value: number): number {
    let node = this.root;
    let result = 0;

    for (let i = this.bitLength - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      if (bit === 0) {
        if (node.left && node.left.count > 0) {
          node = node.left;
        } else {
          node = node.right!;
          result |= 1 << i;
        }
      } else {
        if (node.right && node.right.count > 0) {
          node = node.right;
          result |= 1 << i;
        } else {
          node = node.left!;
        }
      }
    }

    return result;
  }

  xorMax(value: number): number {
    let node = this.root;
    let result = 0;

    for (let i = this.bitLength - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      if (bit === 0) {
        if (node.right && node.right.count > 0) {
          node = node.right!;
          result |= 1 << i;
        } else {
          node = node.left!;
        }
      } else {
        if (node.left && node.left.count > 0) {
          node = node.left;
        } else {
          node = node.right!;
          result |= 1 << i;
        }
      }
    }

    return result;
  }

  min(): number | undefined {
    if (this._size === 0) {
      return undefined;
    }

    let node = this.root;
    let result = 0;

    for (let i = this.bitLength - 1; i >= 0; i--) {
      if (node.left && node.left.count > 0) {
        node = node.left;
      } else {
        node = node.right!;
        result |= 1 << i;
      }
    }

    return result;
  }

  max(): number | undefined {
    if (this._size === 0) {
      return undefined;
    }

    let node = this.root;
    let result = 0;

    for (let i = this.bitLength - 1; i >= 0; i--) {
      if (node.right && node.right.count > 0) {
        node = node.right!;
        result |= 1 << i;
      } else {
        node = node.left!;
      }
    }

    return result;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = new TrieNode();
    this._size = 0;
  }

  toString(): string {
    return `${BinaryTrie2}({ size: ${this.size} })`
  }


  get [Symbol.toStringTag](): string {
    return 'BinaryTrie2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
