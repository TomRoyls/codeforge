import type { TrieMapNode, TrieMapOptions } from './types.js'

export class TrieMap<T = unknown> {
  private root: TrieMapNode<T>
  private _size: number

  constructor(_options?: TrieMapOptions) {
    this.root = this.createNode()
    this._size = 0
  }

  private createNode(): TrieMapNode<T> {
    return {
      children: new Map<string, TrieMapNode<T>>(),
      value: undefined,
      isEnd: false,
    }
  }

  set(key: string, value: T): void {
    let node = this.root
    for (const char of key) {
      let child = node.children.get(char)
      if (!child) {
        child = this.createNode()
        node.children.set(char, child)
      }
      node = child
    }
    if (!node.isEnd) {
      this._size++
    }
    node.isEnd = true
    node.value = value
  }

  get(key: string): T | undefined {
    const node = this.findNode(key)
    if (!node || !node.isEnd) return undefined
    return node.value
  }

  delete(key: string): boolean {
    const path: Array<{ parent: TrieMapNode<T>; char: string; node: TrieMapNode<T> }> = []
    let node = this.root
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) return false
      path.push({ parent: node, char, node: child })
      node = child
    }
    if (!node.isEnd) return false
    node.isEnd = false
    node.value = undefined
    this._size--
    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      if (entry.node.children.size === 0 && !entry.node.isEnd) {
        entry.parent.children.delete(entry.char)
      } else {
        break
      }
    }
    return true
  }

  has(key: string): boolean {
    const node = this.findNode(key)
    return node !== undefined && node.isEnd
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.createNode()
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

  forEach(callback: (key: string, value: T) => void): void {
    const all = this.entries()
    for (const [key, value] of all) {
      callback(key, value)
    }
  }

  startsWith(prefix: string): string[] {
    const node = this.findNode(prefix)
    if (!node) return []
    const result: string[] = []
    this.collectKeys(node, prefix, result)
    return result
  }

  longestCommonPrefix(): string {
    if (this._size === 0) return ''
    const keys = this.keys()
    if (keys.length === 0) return ''
    let prefix = keys[0]!
    for (let i = 1; i < keys.length; i++) {
      const key = keys[i]!
      while (!key.startsWith(prefix)) {
        prefix = prefix.slice(0, -1)
        if (prefix === '') return ''
      }
    }
    return prefix
  }

  longestPrefixOf(key: string): string {
    let node = this.root
    let longest = ''
    let current = ''
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) break
      current += char
      if (child.isEnd) {
        longest = current
      }
      node = child
    }
    return longest
  }

  private findNode(key: string): TrieMapNode<T> | undefined {
    let node = this.root
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) return undefined
      node = child
    }
    return node
  }

  private collectKeys(node: TrieMapNode<T>, prefix: string, result: string[]): void {
    if (node.isEnd) {
      result.push(prefix)
    }
    for (const [char, child] of node.children) {
      this.collectKeys(child, prefix + char, result)
    }
  }

  private collectValues(node: TrieMapNode<T>, result: T[]): void {
    if (node.isEnd && node.value !== undefined) {
      result.push(node.value)
    }
    for (const [, child] of node.children) {
      this.collectValues(child, result)
    }
  }

  private collectEntries(node: TrieMapNode<T>, prefix: string, result: Array<[string, T]>): void {
    if (node.isEnd && node.value !== undefined) {
      result.push([prefix, node.value])
    }
    for (const [char, child] of node.children) {
      this.collectEntries(child, prefix + char, result)
    }
  }
}

export { DEFAULT_TRIEMAP_OPTIONS } from './types.js'
export type { TrieMapNode, TrieMapOptions } from './types.js'
