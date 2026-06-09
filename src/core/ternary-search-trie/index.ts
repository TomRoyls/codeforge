import type { TSTNode } from './types.js'

export type { TSTNode } from './types.js'

export class TernarySearchTrie<T = unknown> {
  private root: TSTNode<T> | null
  private _size: number

  constructor() {
    this.root = null
    this._size = 0
  }

  insert(key: string, value: T): void {
    if (key.length === 0) return
    const isNew = { value: false }
    this.root = this.insertNode(this.root, key, 0, value, isNew)
    if (isNew.value) {
      this._size++
    }
  }

  private insertNode(
    node: TSTNode<T> | null,
    key: string,
    depth: number,
    value: T,
    isNew: { value: boolean }
  ): TSTNode<T> {
    const char = key[depth]!
    if (node === null) {
      node = { char, value: undefined, isEnd: false, left: null, middle: null, right: null }
    }
    if (char < node.char) {
      node.left = this.insertNode(node.left, key, depth, value, isNew)
    } else if (char > node.char) {
      node.right = this.insertNode(node.right, key, depth, value, isNew)
    } else {
      if (depth < key.length - 1) {
        node.middle = this.insertNode(node.middle, key, depth + 1, value, isNew)
      } else {
        if (!node.isEnd) {
          isNew.value = true
        }
        node.isEnd = true
        node.value = value
      }
    }
    return node
  }

  get(key: string): T | undefined {
    if (key.length === 0) return undefined
    const node = this.findNode(this.root, key, 0)
    if (!node || !node.isEnd) return undefined
    return node.value
  }

  has(key: string): boolean {
    if (key.length === 0) return false
    const node = this.findNode(this.root, key, 0)
    return node !== null && node.isEnd
  }

  private findNode(node: TSTNode<T> | null, key: string, depth: number): TSTNode<T> | null {
    if (node === null) return null
    const char = key[depth]!
    if (char < node.char) {
      return this.findNode(node.left, key, depth)
    } else if (char > node.char) {
      return this.findNode(node.right, key, depth)
    } else {
      if (depth < key.length - 1) {
        return this.findNode(node.middle, key, depth + 1)
      }
      return node
    }
  }

  delete(key: string): boolean {
    if (key.length === 0) return false
    if (!this.has(key)) return false
    const result = { deleted: false }
    this.root = this.deleteNode(this.root, key, 0, result)
    if (result.deleted) {
      this._size--
    }
    return result.deleted
  }

  private deleteNode(
    node: TSTNode<T> | null,
    key: string,
    depth: number,
    result: { deleted: boolean }
  ): TSTNode<T> | null {
    if (node === null) return null
    const char = key[depth]!
    if (char < node.char) {
      node.left = this.deleteNode(node.left, key, depth, result)
    } else if (char > node.char) {
      node.right = this.deleteNode(node.right, key, depth, result)
    } else {
      if (depth < key.length - 1) {
        node.middle = this.deleteNode(node.middle, key, depth + 1, result)
      } else {
        if (node.isEnd) {
          result.deleted = true
          node.isEnd = false
          node.value = undefined
        }
      }
    }
    if (!node.isEnd && node.middle === null && node.left === null && node.right === null) {
      return null
    }
    return node
  }

  keysWithPrefix(prefix: string): string[] {
    const result: string[] = []
    if (prefix.length === 0) {
      this.collectKeys(this.root, '', result)
      return result
    }
    const prefixNode = this.findNode(this.root, prefix, 0)
    if (prefixNode === null) return result
    if (prefixNode.isEnd) {
      result.push(prefix)
    }
    this.collectKeys(prefixNode.middle, prefix, result)
    return result
  }

  valuesWithPrefix(prefix: string): T[] {
    const result: T[] = []
    if (prefix.length === 0) {
      this.collectValues(this.root, result)
      return result
    }
    const prefixNode = this.findNode(this.root, prefix, 0)
    if (prefixNode === null) return result
    if (prefixNode.isEnd && prefixNode.value !== undefined) {
      result.push(prefixNode.value)
    }
    this.collectValues(prefixNode.middle, result)
    return result
  }

  entriesWithPrefix(prefix: string): Array<[string, T]> {
    const result: Array<[string, T]> = []
    if (prefix.length === 0) {
      this.collectEntries(this.root, '', result)
      return result
    }
    const prefixNode = this.findNode(this.root, prefix, 0)
    if (prefixNode === null) return result
    if (prefixNode.isEnd && prefixNode.value !== undefined) {
      result.push([prefix, prefixNode.value])
    }
    this.collectEntries(prefixNode.middle, prefix, result)
    return result
  }

  longestPrefixOf(query: string): string {
    if (query.length === 0) return ''
    let longest = ''
    let current = ''
    let node = this.root
    let depth = 0
    while (node !== null && depth < query.length) {
      const char = query[depth]!
      if (char < node.char) {
        node = node.left
      } else if (char > node.char) {
        node = node.right
      } else {
        current += char
        depth++
        if (node.isEnd) {
          longest = current
        }
        node = node.middle
      }
    }
    return longest
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) return !this.isEmpty()
    return this.findNode(this.root, prefix, 0) !== null
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  keys(): string[] {
    const result: string[] = []
    this.collectKeys(this.root, '', result)
    return result
  }

  values(): T[] {
    const result: T[] = []
    this.collectValues(this.root, result)
    return result
  }

  entries(): Array<[string, T]> {
    const result: Array<[string, T]> = []
    this.collectEntries(this.root, '', result)
    return result
  }

  forEach(callback: (value: T, key: string) => void): void {
    const all = this.entries()
    for (const [key, value] of all) {
      callback(value, key)
    }
  }

  private collectKeys(node: TSTNode<T> | null, prefix: string, result: string[]): void {
    if (node === null) return
    this.collectKeys(node.left, prefix, result)
    if (node.isEnd) {
      result.push(prefix + node.char)
    }
    this.collectKeys(node.middle, prefix + node.char, result)
    this.collectKeys(node.right, prefix, result)
  }

  private collectValues(node: TSTNode<T> | null, result: T[]): void {
    if (node === null) return
    this.collectValues(node.left, result)
    if (node.isEnd && node.value !== undefined) {
      result.push(node.value)
    }
    this.collectValues(node.middle, result)
    this.collectValues(node.right, result)
  }

  private collectEntries(node: TSTNode<T> | null, prefix: string, result: Array<[string, T]>): void {
    if (node === null) return
    this.collectEntries(node.left, prefix, result)
    if (node.isEnd && node.value !== undefined) {
      result.push([prefix + node.char, node.value])
    }
    this.collectEntries(node.middle, prefix + node.char, result)
    this.collectEntries(node.right, prefix, result)
  }

  *[Symbol.iterator]() {
    yield* this.entries()
  }
}
