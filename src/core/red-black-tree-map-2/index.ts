export class RedBlackTreeMap2<K, V> {
  private _size: number = 0
  private root: Node<K, V> | null = null

  constructor(private comparator: (a: K, b: K) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {}

  get size(): number {
    return this._size
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  delete(key: K): boolean {
    const z = this.search(this.root, key)
    if (z === null) return false

    let y = z
    let yOriginalColor = y.color
    let x: Node<K, V> | null

    if (z.left === null) {
      x = z.right
      this.transplant(z, z.right)
    } else if (z.right === null) {
      x = z.left
      this.transplant(z, z.left)
    } else {
      y = this.minimumNode(z.right)!
      yOriginalColor = y.color
      x = y.right
      if (y.parent === z) {
        if (x) x.parent = y
      } else {
        this.transplant(y, y.right)
        y.right = z.right
        if (y.right) y.right.parent = y
      }

      this.transplant(z, y)
      y.left = z.left
      y.left.parent = y
      y.color = z.color
    }

    if (!yOriginalColor && x) this.deleteFixup(x)

    this._size--
    return true
  }

  forEach(callback: (key: K, value: V) => void): void {
    this.inorderWalk(this.root, callback)
  }

  get(key: K): undefined | V {
    const node = this.search(this.root, key)
    return node ? node.value : undefined
  }

  has(key: K): boolean {
    return this.search(this.root, key) !== null
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  keys(): K[] {
    const result: K[] = []
    this.inorderWalk(this.root, (k) => result.push(k))
    return result
  }

  max(): K | undefined {
    const node = this.maximumNode(this.root)
    return node ? node.key : undefined
  }

  min(): K | undefined {
    const node = this.minimumNode(this.root)
    return node ? node.key : undefined
  }

  set(key: K, value: V): void {
    let y: Node<K, V> | null = null
    let x = this.root
    const z: Node<K, V> = { color: true, key, left: null, parent: null, right: null, value }

    while (x !== null) {
      y = x
      const cmp = this.comparator(z.key, x.key)
      if (cmp === 0) {
        x.value = value
        return
      }

 x = cmp < 0 ? x.left : x.right;
    }

    z.parent = y
    if (y === null) {
      this.root = z
    } else if (this.comparator(z.key, y.key) < 0) {
      y.left = z
    } else {
      y.right = z
    }

    this._size++
    this.insertFixup(z)
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    this.inorderWalk(this.root, (k, v) => result.push([k, v]))
    return result
  }

  values(): V[] {
    const result: V[] = []
    this.inorderWalk(this.root, (_, v) => result.push(v))
    return result
  }

  private deleteFixup(x: Node<K, V>): void {
    while (x !== this.root && !x.color) {
      if (x === x.parent!.left) {
        let w = x.parent!.right!
        if (w.color) {
          w.color = false
          x.parent!.color = true
          this.leftRotate(x.parent!)
          w = x.parent!.right!
        }

        if (!w.left!.color && !w.right!.color) {
          w.color = true
          x = x.parent!
        } else {
          if (!w.right!.color) {
            w.left!.color = false
            w.color = true
            this.rightRotate(w)
            w = x.parent!.right!
          }

          w.color = x.parent!.color
          x.parent!.color = false
          w.right!.color = false
          this.leftRotate(x.parent!)
          x = this.root!
        }
      } else {
        let w = x.parent!.left!
        if (w.color) {
          w.color = false
          x.parent!.color = true
          this.rightRotate(x.parent!)
          w = x.parent!.left!
        }

        if (!w.right!.color && !w.left!.color) {
          w.color = true
          x = x.parent!
        } else {
          if (!w.left!.color) {
            w.right!.color = false
            w.color = true
            this.leftRotate(w)
            w = x.parent!.left!
          }

          w.color = x.parent!.color
          x.parent!.color = false
          w.left!.color = false
          this.rightRotate(x.parent!)
          x = this.root!
        }
      }
    }

    x.color = false
  }

  private inorderWalk(node: Node<K, V> | null, callback: (key: K, value: V) => void): void {
    if (node !== null) {
      this.inorderWalk(node.left, callback)
      callback(node.key, node.value)
      this.inorderWalk(node.right, callback)
    }
  }

  private insertFixup(z: Node<K, V>): void {
    while (z.parent && z.parent.color) {
      if (z.parent === z.parent.parent!.left) {
        const y = z.parent.parent!.right
        if (y && y.color) {
          z.parent.color = false
          y.color = false
          z.parent.parent!.color = true
          z = z.parent.parent!
        } else {
          if (z === z.parent.right) {
            z = z.parent
            this.leftRotate(z)
          }

          z.parent!.color = false
          z.parent!.parent!.color = true
          this.rightRotate(z.parent!.parent!)
        }
      } else {
        const y = z.parent.parent!.left
        if (y && y.color) {
          z.parent.color = false
          y.color = false
          z.parent.parent!.color = true
          z = z.parent.parent!
        } else {
          if (z === z.parent.left) {
            z = z.parent
            this.rightRotate(z)
          }

          z.parent!.color = false
          z.parent!.parent!.color = true
          this.leftRotate(z.parent!.parent!)
        }
      }
    }

    this.root!.color = false
  }

  private leftRotate(x: Node<K, V>): void {
    const y = x.right!
    x.right = y.left
    if (y.left !== null) {
      y.left.parent = x
    }

    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }

    y.left = x
    x.parent = y
  }

  private maximumNode(node: Node<K, V> | null): Node<K, V> | null {
    while (node && node.right !== null) {
      node = node.right
    }

    return node
  }

  private minimumNode(node: Node<K, V> | null): Node<K, V> | null {
    while (node && node.left !== null) {
      node = node.left
    }

    return node
  }

  private rightRotate(x: Node<K, V>): void {
    const y = x.left!
    x.left = y.right
    if (y.right !== null) {
      y.right.parent = x
    }

    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.right) {
      x.parent.right = y
    } else {
      x.parent.left = y
    }

    y.right = x
    x.parent = y
  }

  private search(node: Node<K, V> | null, key: K): Node<K, V> | null {
    while (node !== null && this.comparator(key, node.key) !== 0) {
      node = this.comparator(key, node.key) < 0 ? node.left : node.right;
    }

    return node
  }

  private transplant(u: Node<K, V>, v: Node<K, V> | null): void {
    if (u.parent === null) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }

    if (v !== null) {
      v.parent = u.parent
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const stack: Array<Node<K, V>> = [];
    let current: Node<K, V> | null = this.root;
    return {
      next(): IteratorResult<[K, V]> {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value: [K, V] = [current.key, current.value];
          current = current.right;
          return { value, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      }
    };
  }


  toString(): string {
    return `RedBlackTreeMap2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RedBlackTreeMap2', size: this.size, items: this.toArray() }
  }


  entries(): [K, V][] {
    return this.toArray()
  }
}

interface Node<K, V> {
  color: boolean
  key: K
  left: Node<K, V> | null
  parent: Node<K, V> | null
  right: Node<K, V> | null
  value: V
}
