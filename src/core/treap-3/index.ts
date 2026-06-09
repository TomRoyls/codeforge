import type { TreapNode } from './types.js'

export class Treap3<K, V> {
  private _size: number = 0
  private root: null | TreapNode<K, V> = null

  get isEmpty(): boolean {
    return this._size === 0
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  contains(key: K): boolean {
    return this._search(this.root, key) !== null
  }

  delete(key: K): void {
    const node = this._search(this.root, key)
    if (node !== null) {
      this.root = this._delete(this.root, key)
      this._size--
    }
  }

  inOrderTraversal(): Array<[K, V]> {
    return this.toArray()
  }

  insert(key: K, value: V): void {
    this.root = this._insert(this.root, key, value)
  }

  max(): K | undefined {
    let node = this.root
    if (node === null) return undefined
    while (node.right !== null) node = node.right
    return node.key
  }

  merge(other: Treap3<K, V>): void {
    this.root = this._merge(this.root, other.root)
    this._size = this._countNodes(this.root)
  }

  min(): K | undefined {
    let node = this.root
    if (node === null) return undefined
    while (node.left !== null) node = node.left
    return node.key
  }

  search(key: K): undefined | V {
    const node = this._search(this.root, key)
    return node?.value
  }

  split(key: K): [Treap3<K, V>, Treap3<K, V>] {
    const [left, right] = this._split(this.root, key)
    const leftTreap = new Treap3<K, V>()
    leftTreap.root = left
    leftTreap._size = this._countNodes(left)

    const rightTreap = new Treap3<K, V>()
    rightTreap.root = right
    rightTreap._size = this._countNodes(right)

    return [leftTreap, rightTreap]
  }

  toArray(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    this._inOrder(this.root, result)
    return result
  }

  private _compare(a: K, b: K): number {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  private _countNodes(node: null | TreapNode<K, V>): number {
    if (node === null) return 0
    return 1 + this._countNodes(node.left) + this._countNodes(node.right)
  }

  private _delete(node: null | TreapNode<K, V>, key: K): null | TreapNode<K, V> {
    if (node === null) return null

    const cmp = this._compare(key, node.key)
    if (cmp < 0) {
      node.left = this._delete(node.left, key)
    } else if (cmp > 0) {
      node.right = this._delete(node.right, key)
    } else {
      return this._merge(node.left, node.right)
    }

    return node
  }

  private _inOrder(node: null | TreapNode<K, V>, result: Array<[K, V]>): void {
    if (node === null) return
    this._inOrder(node.left, result)
    result.push([node.key, node.value])
    this._inOrder(node.right, result)
  }

  private _insert(node: null | TreapNode<K, V>, key: K, value: V): TreapNode<K, V> {
    if (node === null) {
      this._size++
      return { key, left: null, priority: Math.random(), right: null, value }
    }

    const cmp = this._compare(key, node.key)
    if (cmp < 0) {
      node.left = this._insert(node.left, key, value)
      if (node.left.priority > node.priority) {
        node = this._rotateRight(node)
      }
    } else if (cmp > 0) {
      node.right = this._insert(node.right, key, value)
      if (node.right.priority > node.priority) {
        node = this._rotateLeft(node)
      }
    } else {
      node.value = value
    }

    return node
  }

  private _merge(left: null | TreapNode<K, V>, right: null | TreapNode<K, V>): null | TreapNode<K, V> {
    if (left === null) return right
    if (right === null) return left

    if (left.priority > right.priority) {
      left.right = this._merge(left.right, right)
      return left
    }
 
      right.left = this._merge(left, right.left)
      return right
    
  }

  private _rotateLeft(node: TreapNode<K, V>): TreapNode<K, V> {
    const right = node.right!
    node.right = right.left
    right.left = node
    return right
  }

  private _rotateRight(node: TreapNode<K, V>): TreapNode<K, V> {
    const left = node.left!
    node.left = left.right
    left.right = node
    return left
  }

  private _search(node: null | TreapNode<K, V>, key: K): null | TreapNode<K, V> {
    while (node !== null) {
      const cmp = this._compare(key, node.key)
      if (cmp === 0) return node
      node = cmp < 0 ? node.left : node.right
    }

    return null
  }

  private _split(node: null | TreapNode<K, V>, key: K): [null | TreapNode<K, V>, null | TreapNode<K, V>] {
    if (node === null) return [null, null]

    const cmp = this._compare(key, node.key)
    if (cmp <= 0) {
      const [left, right] = this._split(node.left, key)
      node.left = right
      return [left, node]
    }
 
      const [left, right] = this._split(node.right, key)
      node.right = left
      return [node, right]
    
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const stack: Array<TreapNode<K, V>> = [];
    let current: TreapNode<K, V> | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value: [K, V] = [current.key, current.value];
          current = current.right;
          return { value: value as ReturnType<this['toArray']>[number], done: false };
        }
        return { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true };
      }
    };
  }
}
