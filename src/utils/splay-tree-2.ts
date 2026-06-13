export class SplayTree2<T> {
  private root: SplayNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a, b) => a < b ? -1 : a > b ? 1 : 0)
  }

  private rotateRight(node: SplayNode<T>): SplayNode<T> {
    const x = node.left!
    node.left = x.right
    x.right = node
    return x
  }

  private rotateLeft(node: SplayNode<T>): SplayNode<T> {
    const x = node.right!
    node.right = x.left
    x.left = node
    return x
  }

  private splay(value: T): void {
    if (!this.root) return
    const header = new SplayNode<T>(null as T)
    header.left = null
    header.right = null
    let left = header
    let right = header
    let root = this.root

    while (true) {
      const cmp = this.compare(value, root!.value)
      if (cmp < 0) {
        if (!root!.left) break
        if (this.compare(value, root!.left.value) < 0) {
          const tmp = root!.left
          root!.left = tmp.right
          tmp.right = root
          root = tmp
          if (!root!.left) break
        }
        right!.left = root
        right = root!
        root = root!.left
      } else if (cmp > 0) {
        if (!root!.right) break
        if (this.compare(value, root!.right.value) > 0) {
          const tmp = root!.right
          root!.right = tmp.left
          tmp.left = root
          root = tmp
          if (!root!.right) break
        }
        left!.right = root
        left = root!
        root = root!.right
      } else {
        break
      }
    }
    left!.right = root!.left
    right!.left = root!.right
    root!.left = header.right
    root!.right = header.left
    this.root = root
  }

  insert(value: T): void {
    if (!this.root) {
      this.root = new SplayNode(value)
      this._size++
      return
    }
    this.splay(value)
    const cmp = this.compare(value, this.root!.value)
    if (cmp === 0) return
    const node = new SplayNode(value)
    if (cmp < 0) {
      node.left = this.root!.left
      node.right = this.root
      this.root!.left = null
    } else {
      node.right = this.root!.right
      node.left = this.root
      this.root!.right = null
    }
    this.root = node
    this._size++
  }

  contains(value: T): boolean {
    if (!this.root) return false
    this.splay(value)
    return this.compare(value, this.root!.value) === 0
  }

  inOrder(): T[] {
    const result: T[] = []
    const visit = (node: SplayNode<T> | null) => {
      if (!node) return
      visit(node.left)
      result.push(node.value)
      visit(node.right)
    }
    visit(this.root)
    return result
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void { this.root = null; this._size = 0 }

  toArray(): T[] { return this.inOrder() }
  toString(): string { return JSON.stringify({ size: this._size }) }
  toJSON(): Record<string, number> { return { size: this._size } }

  clone(): SplayTree2<T> {
    const c = new SplayTree2<T>(this.compare)
    for (const v of this.inOrder()) c.insert(v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SplayTree2)) return false
    return this._size === other._size
  }
}

class SplayNode<T> {
  value: T
  left: SplayNode<T> | null = null
  right: SplayNode<T> | null = null

  constructor(value: T) { this.value = value }
}
