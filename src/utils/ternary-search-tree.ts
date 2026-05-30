export interface TSTNode {
  char: string
  left: TSTNode | null
  middle: TSTNode | null
  right: TSTNode | null
  isEnd: boolean
}

function createNode(char: string): TSTNode {
  return { char, left: null, middle: null, right: null, isEnd: false }
}

export class TernarySearchTree {
  private root: TSTNode | null = null
  private _size = 0

  insert(word: string): void {
    if (word === '') {
      if (this.root === null) {
        this.root = createNode('')
        this.root.isEnd = true
        this._size++
      } else if (!this.root.isEnd) {
        this.root.isEnd = true
        this._size++
      }
      return
    }

    const [newRoot, added] = this._insert(this.root, word, 0)
    this.root = newRoot
    if (added) this._size++
  }

  private _insert(
    node: TSTNode | null,
    word: string,
    index: number,
  ): [TSTNode, boolean] {
    const char = word[index]!
    if (node === null) {
      node = createNode(char)
    }

    if (char < node.char) {
      const [newLeft, added] = this._insert(node.left, word, index)
      node.left = newLeft
      return [node, added]
    } else if (char > node.char) {
      const [newRight, added] = this._insert(node.right, word, index)
      node.right = newRight
      return [node, added]
    } else {
      if (index === word.length - 1) {
        if (node.isEnd) return [node, false]
        node.isEnd = true
        return [node, true]
      }
      const [newMiddle, added] = this._insert(node.middle, word, index + 1)
      node.middle = newMiddle
      return [node, added]
    }
  }

  contains(word: string): boolean {
    if (word === '') {
      return this.root !== null && this.root.char === '' && this.root.isEnd
    }
    const node = this._find(this.root, word, 0)
    return node !== null && node.isEnd
  }

  private _find(
    node: TSTNode | null,
    word: string,
    index: number,
  ): TSTNode | null {
    if (node === null || index >= word.length) return null
    const char = word[index]!
    if (char < node.char) return this._find(node.left, word, index)
    if (char > node.char) return this._find(node.right, word, index)
    if (index === word.length - 1) return node
    return this._find(node.middle, word, index + 1)
  }

  startsWith(prefix: string): string[] {
    const results: string[] = []
    if (prefix === '') {
      this._collect(this.root, '', results)
      return results
    }
    const node = this._find(this.root, prefix, 0)
    if (node === null) return results
    if (node.isEnd) results.push(prefix)
    this._collect(node.middle, prefix, results)
    return results
  }

  private _collect(
    node: TSTNode | null,
    prefix: string,
    results: string[],
  ): void {
    if (node === null) return
    this._collect(node.left, prefix, results)
    if (node.isEnd) results.push(prefix + node.char)
    this._collect(node.middle, prefix + node.char, results)
    this._collect(node.right, prefix, results)
  }

  delete(word: string): boolean {
    if (word === '') {
      if (this.root !== null && this.root.char === '' && this.root.isEnd) {
        this.root.isEnd = false
        this._size--
        return true
      }
      return false
    }
    const node = this._find(this.root, word, 0)
    if (node === null || !node.isEnd) return false
    node.isEnd = false
    this._size--
    return true
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

  toList(): string[] {
    const results: string[] = []
    this._collect(this.root, '', results)
    return results
  }
}
