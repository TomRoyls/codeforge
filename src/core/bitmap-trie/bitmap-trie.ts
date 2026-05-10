import type { BitmapTrieNode, BitmapTrieOptions } from './types.js'

function popcount(n: number): number {
  let count = 0
  while (n) {
    count += n & 1
    n >>>= 1
  }
  return count
}

function charToIndex(ch: string): number {
  return ch.charCodeAt(0) - 97
}

export class BitmapTrie<V = unknown> {
  private root: BitmapTrieNode<V>
  private _size: number

  constructor(_options?: BitmapTrieOptions) {
    this.root = { bitmap: 0, children: [], value: undefined, isEnd: false }
    this._size = 0
  }

  insert(key: string, value: V): void {
    let node = this.root
    for (const ch of key) {
      const idx = charToIndex(ch)
      const bit = 1 << idx
      const childPos = popcount(node.bitmap & (bit - 1))
      if (!(node.bitmap & bit)) {
        node.bitmap |= bit
        node.children.splice(childPos, 0, { bitmap: 0, children: [], value: undefined, isEnd: false })
      }
      node = node.children[childPos]!
    }
    if (!node.isEnd) this._size++
    node.isEnd = true
    node.value = value
  }

  get(key: string): V | undefined {
    const node = this.findNode(key)
    if (!node || !node.isEnd) return undefined
    return node.value
  }

  has(key: string): boolean {
    const node = this.findNode(key)
    return node !== undefined && node.isEnd
  }

  delete(key: string): boolean {
    const path: Array<{ parent: BitmapTrieNode<V>; bit: number; node: BitmapTrieNode<V> }> = []
    let node = this.root
    for (const ch of key) {
      const idx = charToIndex(ch)
      const bit = 1 << idx
      if (!(node.bitmap & bit)) return false
      const childPos = popcount(node.bitmap & (bit - 1))
      const child = node.children[childPos]!
      path.push({ parent: node, bit, node: child })
      node = child
    }
    if (!node.isEnd) return false
    node.isEnd = false
    node.value = undefined
    this._size--
    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      if (entry.node.children.length === 0 && !entry.node.isEnd) {
        const childPos = popcount(entry.parent.bitmap & (entry.bit - 1))
        entry.parent.bitmap ^= entry.bit
        entry.parent.children.splice(childPos, 1)
      } else {
        break
      }
    }
    return true
  }

  startsWith(prefix: string): string[] {
    const node = this.findNode(prefix)
    if (!node) return []
    const result: string[] = []
    this.collectKeys(node, prefix, result)
    return result
  }

  keysWithPrefix(prefix: string): string[] {
    return this.startsWith(prefix)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = { bitmap: 0, children: [], value: undefined, isEnd: false }
    this._size = 0
  }

  forEach(callback: (key: string, value: V) => void): void {
    const all = this.entries()
    for (const [key, value] of all) {
      callback(key, value)
    }
  }

  keys(): string[] {
    const result: string[] = []
    this.collectKeys(this.root, '', result)
    return result
  }

  values(): V[] {
    const result: V[] = []
    this.collectValues(this.root, result)
    return result
  }

  entries(): Array<[string, V]> {
    const result: Array<[string, V]> = []
    this.collectEntries(this.root, '', result)
    return result
  }

  longestPrefixOf(key: string): string {
    let node = this.root
    let longest = ''
    let current = ''
    for (const ch of key) {
      const idx = charToIndex(ch)
      const bit = 1 << idx
      if (!(node.bitmap & bit)) break
      const childPos = popcount(node.bitmap & (bit - 1))
      node = node.children[childPos]!
      current += ch
      if (node.isEnd) longest = current
    }
    return longest
  }

  shortestPrefixOf(key: string): string {
    if (this.root.isEnd) return ''
    let node = this.root
    let current = ''
    for (const ch of key) {
      const idx = charToIndex(ch)
      const bit = 1 << idx
      if (!(node.bitmap & bit)) break
      const childPos = popcount(node.bitmap & (bit - 1))
      node = node.children[childPos]!
      current += ch
      if (node.isEnd) return current
    }
    return ''
  }

  containsPrefix(prefix: string): boolean {
    const node = this.findNode(prefix)
    if (!node) return false
    return node.isEnd || node.children.length > 0
  }

  private findNode(key: string): BitmapTrieNode<V> | undefined {
    let node = this.root
    for (const ch of key) {
      const idx = charToIndex(ch)
      const bit = 1 << idx
      if (!(node.bitmap & bit)) return undefined
      const childPos = popcount(node.bitmap & (bit - 1))
      node = node.children[childPos]!
    }
    return node
  }

  private collectKeys(node: BitmapTrieNode<V>, prefix: string, result: string[]): void {
    if (node.isEnd) result.push(prefix)
    for (let i = 0; i < 26; i++) {
      const bit = 1 << i
      if (node.bitmap & bit) {
        const childPos = popcount(node.bitmap & (bit - 1))
        this.collectKeys(node.children[childPos]!, prefix + String.fromCharCode(i + 97), result)
      }
    }
  }

  private collectValues(node: BitmapTrieNode<V>, result: V[]): void {
    if (node.isEnd && node.value !== undefined) result.push(node.value)
    for (let i = 0; i < 26; i++) {
      const bit = 1 << i
      if (node.bitmap & bit) {
        const childPos = popcount(node.bitmap & (bit - 1))
        this.collectValues(node.children[childPos]!, result)
      }
    }
  }

  private collectEntries(node: BitmapTrieNode<V>, prefix: string, result: Array<[string, V]>): void {
    if (node.isEnd && node.value !== undefined) result.push([prefix, node.value])
    for (let i = 0; i < 26; i++) {
      const bit = 1 << i
      if (node.bitmap & bit) {
        const childPos = popcount(node.bitmap & (bit - 1))
        this.collectEntries(node.children[childPos]!, prefix + String.fromCharCode(i + 97), result)
      }
    }
  }
}

export { DEFAULT_BITMAP_TRIE_OPTIONS } from './types.js'
export type { BitmapTrieNode, BitmapTrieOptions } from './types.js'
