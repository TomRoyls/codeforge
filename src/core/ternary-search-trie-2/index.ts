interface TSTNode<V> {
  char: string
  value: V | undefined
  left: TSTNode<V> | null
  mid: TSTNode<V> | null
  right: TSTNode<V> | null
}

export class TernarySearchTrie2<V> {
  private root: TSTNode<V> | null
  private _size: number

  constructor() {
    this.root = null
    this._size = 0
  }

  set(key: string, value: V): void {
    if (key.length === 0) {
      return
    }

    this.root = this._set(this.root, key, 0, value)
  }

  private _set(node: TSTNode<V> | null, key: string, index: number, value: V): TSTNode<V> {
    const char = key[index]!

    if (node === null) {
      node = {
        char,
        value: undefined,
        left: null,
        mid: null,
        right: null
      }
    }

    if (char < node.char!) {
      node.left = this._set(node.left, key, index, value)
    } else if (char > node.char!) {
      node.right = this._set(node.right, key, index, value)
    } else if (index < key.length - 1) {
      node.mid = this._set(node.mid, key, index + 1, value)
    } else {
      if (node!.value === undefined) {
        this._size++
      }
      node!.value = value
    }

    return node!
  }

  get(key: string): V | undefined {
    const node = this._get(this.root, key, 0)
    return node !== null ? node.value : undefined
  }

  private _get(node: TSTNode<V> | null, key: string, index: number): TSTNode<V> | null {
    if (node === null || key.length === 0) {
      return null
    }

    const char = key[index]!

    if (char < node.char!) {
      return this._get(node.left, key, index)
    } else if (char > node.char!) {
      return this._get(node.right, key, index)
    } else if (index < key.length - 1) {
      return this._get(node.mid, key, index + 1)
    } else {
      return node
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    if (key.length === 0) {
      return false
    }

    const node = this._get(this.root, key, 0)
    if (node === null || node.value === undefined) {
      return false
    }

    this.root = this._delete(this.root, key, 0)
    this._size--
    return true
  }

  private _delete(node: TSTNode<V> | null, key: string, index: number): TSTNode<V> | null {
    if (node === null) {
      return null
    }

    const char = key[index]!

    if (char < node!.char!) {
      node!.left = this._delete(node!.left, key, index)
    } else if (char > node!.char!) {
      node!.right = this._delete(node!.right, key, index)
    } else if (index < key.length - 1) {
      node!.mid = this._delete(node!.mid, key, index + 1)
    } else {
      node!.value = undefined
    }

    return node
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  keysWithPrefix(prefix: string): string[] {
    if (prefix.length === 0) {
      return this.keys()
    }

    const keys: string[] = []
    const node = this._get(this.root, prefix, 0)

    if (node !== null) {
      if (node.value !== undefined) {
        keys.push(prefix)
      }
      this._collect(node.mid, prefix, keys)
    }

    return keys
  }

  keys(): string[] {
    const keys: string[] = []
    this._collect(this.root, '', keys)
    return keys
  }

  private _collect(node: TSTNode<V> | null, prefix: string, keys: string[]): void {
    if (node === null) {
      return
    }

    if (node.left !== null) {
      this._collect(node.left, prefix, keys)
    }

    if (node.value !== undefined) {
      keys.push(prefix + node.char)
    }

    if (node.mid !== null) {
      this._collect(node.mid, prefix + node.char, keys)
    }

    if (node.right !== null) {
      this._collect(node.right, prefix, keys)
    }
  }

  toString(): string {
    return `TernarySearchTrie2({ size: ${this.size} })`
  }
}
