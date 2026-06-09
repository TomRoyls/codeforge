class TernarySearchTreeNode {
  char: string
  left: TernarySearchTreeNode | null
  middle: TernarySearchTreeNode | null
  right: TernarySearchTreeNode | null
  isEnd: boolean

  constructor(char: string) {
    this.char = char
    this.left = null
    this.middle = null
    this.right = null
    this.isEnd = false
  }
}

export class TernarySearchTree2 {
  private root: TernarySearchTreeNode | null
  private _size: number

  constructor() {
    this.root = null
    this._size = 0
  }

  insert(word: string): void {
    if (word.length === 0) {
      return
    }
    this.root = this.insertNode(this.root, word, 0)
  }

  private insertNode(node: TernarySearchTreeNode | null, word: string, index: number): TernarySearchTreeNode | null {
    const char = word[index]!

    if (node === null) {
      node = new TernarySearchTreeNode(char)
    }

    if (char < node.char) {
      node.left = this.insertNode(node.left, word, index)
    } else if (char > node.char) {
      node.right = this.insertNode(node.right, word, index)
    } else {
      if (index < word.length - 1) {
        node.middle = this.insertNode(node.middle, word, index + 1)
      } else {
        if (!node.isEnd) {
          node.isEnd = true
          this._size++
        }
      }
    }

    return node
  }

  delete(word: string): boolean {
    if (word.length === 0) {
      return false
    }
    if (!this.search(word)) {
      return false
    }
    this.root = this.deleteNode(this.root, word, 0)
    this._size--
    return true
  }

  private deleteNode(node: TernarySearchTreeNode | null, word: string, index: number): TernarySearchTreeNode | null {
    if (node === null) {
      return null
    }

    const char = word[index]!

    if (char < node.char) {
      node.left = this.deleteNode(node.left, word, index)
    } else if (char > node.char) {
      node.right = this.deleteNode(node.right, word, index)
    } else {
      if (index === word.length - 1) {
        node.isEnd = false
      } else {
        node.middle = this.deleteNode(node.middle, word, index + 1)
      }

      if (!node.isEnd && node.left === null && node.middle === null && node.right === null) {
        return null
      }
    }

    return node
  }

  search(word: string): boolean {
    if (word.length === 0) {
      return false
    }
    return this.searchNode(this.root, word, 0)
  }

  private searchNode(node: TernarySearchTreeNode | null, word: string, index: number): boolean {
    if (node === null) {
      return false
    }

    const char = word[index]!

    if (char < node.char) {
      return this.searchNode(node.left, word, index)
    } else if (char > node.char) {
      return this.searchNode(node.right, word, index)
    } else {
      if (index === word.length - 1) {
        return node.isEnd
      }
      return this.searchNode(node.middle, word, index + 1)
    }
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) {
      return true
    }
    return this.startsWithNode(this.root, prefix, 0)
  }

  private startsWithNode(node: TernarySearchTreeNode | null, prefix: string, index: number): boolean {
    if (node === null || index >= prefix.length) {
      return false
    }

    const char = prefix[index]!

    if (char < node.char) {
      return this.startsWithNode(node.left, prefix, index)
    } else if (char > node.char) {
      return this.startsWithNode(node.right, prefix, index)
    } else {
      if (index === prefix.length - 1) {
        return true
      }
      return this.startsWithNode(node.middle, prefix, index + 1)
    }
  }

  getAllWords(): string[] {
    const words: string[] = []
    this.collectWords(this.root, '', words)
    return words
  }

  private collectWords(node: TernarySearchTreeNode | null, current: string, words: string[]): void {
    if (node === null) {
      return
    }

    this.collectWords(node.left, current, words)

    const newCurrent = current + node.char

    if (node.isEnd) {
      words.push(newCurrent)
    }

    this.collectWords(node.middle, newCurrent, words)
    this.collectWords(node.right, current, words)
  }

  autoComplete(prefix: string): string[] {
    const node = this.findPrefixNode(this.root, prefix, 0)
    if (node === null) {
      return []
    }

    const words: string[] = []
    if (prefix.length === 0) {
      this.collectWords(this.root, '', words)
      return words
    }

    this.collectWords(node.middle, prefix, words)

    if (node.isEnd) {
      words.push(prefix)
    }

    return words.sort()
  }

  private findPrefixNode(node: TernarySearchTreeNode | null, prefix: string, index: number): TernarySearchTreeNode | null {
    if (node === null || index >= prefix.length) {
      return node
    }

    const char = prefix[index]!

    if (char < node.char) {
      return this.findPrefixNode(node.left, prefix, index)
    } else if (char > node.char) {
      return this.findPrefixNode(node.right, prefix, index)
    } else {
      if (index === prefix.length - 1) {
        return node
      }
      return this.findPrefixNode(node.middle, prefix, index + 1)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  getTimeComplexity(): Record<string, string> {
    const complexities: Record<string, string> = {
      insert: 'O(m)',
      delete: 'O(m)',
      search: 'O(m)',
      startsWith: 'O(m)',
      getAllWords: 'O(n)',
      autoComplete: 'O(m + k)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(1)'
    }
    return complexities
  }

  toString(): string {
    return `TernarySearchTree2({ size: ${this.size} })`
  }
}
