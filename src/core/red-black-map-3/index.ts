type RBColor = 'red' | 'black'

interface RBNode<K, V> {
  key: K
  value: V
  color: RBColor
  left: RBNode<K, V> | null
  right: RBNode<K, V> | null
  parent: RBNode<K, V> | null
}

type CompareFunction<K> = (a: K, b: K) => number

export class RedBlackMap3<K, V> {
  private root: RBNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(compare?: CompareFunction<K>) {
    this.compare = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private leftRotate(x: RBNode<K, V>): void {
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

  private rightRotate(y: RBNode<K, V>): void {
    const x = y.left!
    y.left = x.right
    if (x.right !== null) {
      x.right.parent = y
    }
    x.parent = y.parent
    if (y.parent === null) {
      this.root = x
    } else if (y === y.parent.right) {
      y.parent.right = x
    } else {
      y.parent.left = x
    }
    x.right = y
    y.parent = x
  }

  private insertFixup(z: RBNode<K, V>): void {
    while (z.parent !== null && z.parent.color === 'red') {
      if (z.parent === z.parent.parent!.left) {
        const y = z.parent.parent!.right
        if (y !== null && y.color === 'red') {
          z.parent.color = 'black'
          y.color = 'black'
          z.parent.parent!.color = 'red'
          z = z.parent.parent!
        } else {
          if (z === z.parent.right) {
            z = z.parent
            this.leftRotate(z)
          }
          z.parent!.color = 'black'
          z.parent!.parent!.color = 'red'
          this.rightRotate(z.parent!.parent!)
        }
      } else {
        const y = z.parent.parent!.left
        if (y !== null && y.color === 'red') {
          z.parent.color = 'black'
          y.color = 'black'
          z.parent.parent!.color = 'red'
          z = z.parent.parent!
        } else {
          if (z === z.parent.left) {
            z = z.parent
            this.rightRotate(z)
          }
          z.parent!.color = 'black'
          z.parent!.parent!.color = 'red'
          this.leftRotate(z.parent!.parent!)
        }
      }
    }
    this.root!.color = 'black'
  }

  set(key: K, value: V): void {
    let parent: RBNode<K, V> | null = null
    let current = this.root
    while (current !== null) {
      parent = current
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        current.value = value
        return
      }
    }
    const newNode: RBNode<K, V> = {
      key,
      value,
      color: 'red',
      left: null,
      right: null,
      parent,
    }
    if (parent === null) {
      this.root = newNode
    } else if (this.compare(key, parent.key) < 0) {
      parent.left = newNode
    } else {
      parent.right = newNode
    }
    this._size++
    this.insertFixup(newNode)
  }

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current.value
      }
    }
    return undefined
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return true
      }
    }
    return false
  }

  private findNode(key: K): RBNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current
      }
    }
    return null
  }

  private transplant(u: RBNode<K, V>, v: RBNode<K, V> | null): void {
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

  private minimum(node: RBNode<K, V>): RBNode<K, V> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private maximum(node: RBNode<K, V>): RBNode<K, V> {
    while (node.right !== null) {
      node = node.right
    }
    return node
  }

  private deleteFixup(x: RBNode<K, V> | null, parent: RBNode<K, V> | null): void {
    while (x !== this.root && (x === null || x.color === 'black')) {
      if (x !== null) {
        parent = x.parent
      }
      if (parent === null) break
      if (x === parent.left) {
        let w = parent.right
        if (w !== null && w.color === 'red') {
          w.color = 'black'
          parent.color = 'red'
          this.leftRotate(parent)
          w = parent.right
        }
        if (
          (w === null || w.left === null || w.left.color === 'black') &&
          (w === null || w.right === null || w.right.color === 'black')
        ) {
          if (w !== null) w.color = 'red'
          x = parent
        } else {
          if (w === null || w.right === null || w.right.color === 'black') {
            if (w !== null && w.left !== null) w.left.color = 'black'
            if (w !== null) w.color = 'red'
            if (w !== null) this.rightRotate(w)
            w = parent.right
          }
          if (w !== null) w.color = parent.color
          parent.color = 'black'
          if (w !== null && w.right !== null) w.right.color = 'black'
          this.leftRotate(parent)
          x = this.root
        }
      } else {
        let w = parent.left
        if (w !== null && w.color === 'red') {
          w.color = 'black'
          parent.color = 'red'
          this.rightRotate(parent)
          w = parent.left
        }
        if (
          (w === null || w.right === null || w.right.color === 'black') &&
          (w === null || w.left === null || w.left.color === 'black')
        ) {
          if (w !== null) w.color = 'red'
          x = parent
        } else {
          if (w === null || w.left === null || w.left.color === 'black') {
            if (w !== null && w.right !== null) w.right.color = 'black'
            if (w !== null) w.color = 'red'
            if (w !== null) this.leftRotate(w)
            w = parent.left
          }
          if (w !== null) w.color = parent.color
          parent.color = 'black'
          if (w !== null && w.left !== null) w.left.color = 'black'
          this.rightRotate(parent)
          x = this.root
        }
      }
    }
    if (x !== null) {
      x.color = 'black'
    }
  }

  delete(key: K): boolean {
    const z = this.findNode(key)
    if (z === null) return false

    let y: RBNode<K, V> = z
    let yOriginalColor: RBColor = y.color
    let x: RBNode<K, V> | null = null
    let xParent: RBNode<K, V> | null = null

    if (z.left === null) {
      x = z.right
      xParent = z.parent
      this.transplant(z, z.right)
    } else if (z.right === null) {
      x = z.left
      xParent = z.parent
      this.transplant(z, z.left)
    } else {
      y = this.minimum(z.right)
      yOriginalColor = y.color
      x = y.right
      if (y.parent === z) {
        xParent = y
      } else {
        xParent = y.parent
        this.transplant(y, y.right)
        y.right = z.right
        y.right!.parent = y
      }
      this.transplant(z, y)
      y.left = z.left
      y.left!.parent = y
      y.color = z.color
    }

    this._size--

    if (yOriginalColor === 'black') {
      this.deleteFixup(x, xParent)
    }

    return true
  }

  min(): K | undefined {
    if (this.root === null) return undefined
    return this.minimum(this.root).key
  }

  max(): K | undefined {
    if (this.root === null) return undefined
    return this.maximum(this.root).key
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private inOrderTraversal(node: RBNode<K, V> | null, result: Array<[K, V]>): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  keys(): K[] {
    const result: Array<[K, V]> = []
    this.inOrderTraversal(this.root, result)
    return result.map(([k]) => k)
  }

  values(): V[] {
    const result: Array<[K, V]> = []
    this.inOrderTraversal(this.root, result)
    return result.map(([, v]) => v)
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  forEach(callback: (entry: [K,  V], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toArray(): any[] {
    return [...this]
  }

  toString(): string {
    return `RedBlackMap3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RedBlackMap3', size: this.size, items: this.toArray() }
  }
}
