import type { TrieNode, TrieEntry } from './types.js'

export type { TrieNode, TrieEntry } from './types.js'

export class PathCompressionTrie<T = unknown> {
  private root: TrieNode<T>
  private _size: number = 0

  constructor() {
    this.root = {
      label: '',
      value: undefined,
      hasValue: false,
      children: new Map(),
    }
  }

  insert(key: string, value?: T): this {
    if (key.length === 0) {
      if (!this.root.hasValue) {
        this._size++
      }
      this.root.value = value
      this.root.hasValue = true
      return this
    }

    let node = this.root
    let remaining = key

    while (remaining.length > 0) {
      const firstChar = remaining[0]!
      const child = node.children.get(firstChar)

      if (!child) {
        const newChild: TrieNode<T> = {
          label: remaining,
          value: value,
          hasValue: true,
          children: new Map(),
        }
        node.children.set(firstChar, newChild)
        this._size++
        return this
      }

      const commonLen = commonPrefixLength(remaining, child.label)

      if (commonLen === child.label.length) {
        remaining = remaining.slice(commonLen)
        node = child
        if (remaining.length === 0) {
          if (!node.hasValue) {
            this._size++
          }
          node.value = value
          node.hasValue = true
          return this
        }
        continue
      }

      const splitLabel = child.label.slice(0, commonLen)
      const childSuffix = child.label.slice(commonLen)

      const splitNode: TrieNode<T> = {
        label: splitLabel,
        value: undefined,
        hasValue: false,
        children: new Map(),
      }

      child.label = childSuffix
      splitNode.children.set(childSuffix[0]!, child)
      node.children.set(firstChar, splitNode)

      remaining = remaining.slice(commonLen)

      if (remaining.length === 0) {
        if (!splitNode.hasValue) {
          this._size++
        }
        splitNode.value = value
        splitNode.hasValue = true
        return this
      }

      const newLeaf: TrieNode<T> = {
        label: remaining,
        value: value,
        hasValue: true,
        children: new Map(),
      }
      splitNode.children.set(remaining[0]!, newLeaf)
      this._size++
      return this
    }

    return this
  }

  search(key: string): T | undefined {
    const node = this.findExactNode(key)
    if (node && node.hasValue) {
      return node.value
    }
    return undefined
  }

  has(key: string): boolean {
    const node = this.findExactNode(key)
    return node !== null && node.hasValue
  }

  delete(key: string): boolean {
    if (key.length === 0) {
      if (!this.root.hasValue) return false
      this.root.value = undefined
      this.root.hasValue = false
      this._size--
      return true
    }

    const path = this.findPath(key)
    if (!path || path.length === 0) return false

    const target = path[path.length - 1]!
    if (!target.node.hasValue) return false

    target.node.value = undefined
    target.node.hasValue = false
    this._size--

    this.compressAfterDelete(path)
    return true
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) return this._size > 0
    const result = this.findPrefixNode(prefix)
    return result !== null
  }

  keysWithPrefix(prefix: string): string[] {
    const results: string[] = []
    if (prefix.length === 0) {
      if (this.root.hasValue) {
        results.push('')
      }
      this.collectKeys(this.root, '', results)
      return results
    }

    const found = this.findPrefixNode(prefix)
    if (!found) return results

    const { node, consumed } = found
    if (node.hasValue) {
      results.push(consumed)
    }
    this.collectKeys(node, consumed, results)
    return results
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root.children.clear()
    this.root.value = undefined
    this.root.hasValue = false
    this._size = 0
  }

  *keys(): Generator<string> {
    if (this.root.hasValue) {
      yield ''
    }
    yield* this.collectKeysGen(this.root, '')
  }

  *values(): Generator<T> {
    if (this.root.hasValue) {
      yield this.root.value as T
    }
    yield* this.collectValuesGen(this.root)
  }

  *entries(): Generator<TrieEntry<T>> {
    if (this.root.hasValue) {
      yield { key: '', value: this.root.value as T }
    }
    yield* this.collectEntriesGen(this.root, '')
  }

  forEach(callback: (value: T, key: string, trie: this) => void): void {
    for (const entry of this.entries()) {
      callback(entry.value, entry.key, this)
    }
  }

  [Symbol.iterator](): Generator<TrieEntry<T>> {
    return this.entries()
  }

  private findExactNode(key: string): TrieNode<T> | null {
    if (key.length === 0) return this.root

    let node = this.root
    let remaining = key

    while (remaining.length > 0) {
      const firstChar = remaining[0]!
      const child = node.children.get(firstChar)
      if (!child) return null

      if (remaining.length < child.label.length) {
        return null
      }

      if (!remaining.startsWith(child.label)) {
        return null
      }

      remaining = remaining.slice(child.label.length)
      node = child
    }

    return node
  }

  private findPrefixNode(prefix: string): { node: TrieNode<T>; consumed: string } | null {
    if (prefix.length === 0) return { node: this.root, consumed: '' }

    let node = this.root
    let remaining = prefix
    let consumed = ''

    while (remaining.length > 0) {
      const firstChar = remaining[0]!
      const child = node.children.get(firstChar)
      if (!child) return null

      if (remaining.length < child.label.length) {
        if (child.label.startsWith(remaining)) {
          return { node: child, consumed: consumed + child.label }
        }
        return null
      }

      if (!remaining.startsWith(child.label)) {
        return null
      }

      consumed += child.label
      remaining = remaining.slice(child.label.length)
      node = child
    }

    return { node, consumed }
  }

  private findPath(key: string): Array<{ node: TrieNode<T>; parent: TrieNode<T> | null; edgeLabel: string }> | null {
    if (key.length === 0) {
      return [{ node: this.root, parent: null, edgeLabel: '' }]
    }

    const path: Array<{ node: TrieNode<T>; parent: TrieNode<T> | null; edgeLabel: string }> = []
    let node = this.root
    let remaining = key

    while (remaining.length > 0) {
      const firstChar = remaining[0]!
      const child = node.children.get(firstChar)
      if (!child) return null

      if (remaining.length < child.label.length) return null

      if (!remaining.startsWith(child.label)) return null

      path.push({ node: child, parent: node, edgeLabel: child.label })
      remaining = remaining.slice(child.label.length)
      node = child
    }

    return path
  }

  private compressAfterDelete(path: Array<{ node: TrieNode<T>; parent: TrieNode<T> | null; edgeLabel: string }>): void {
    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      const current = entry.node
      const parent = entry.parent

      if (parent === null) break
      if (current.hasValue) break

      if (current.children.size === 0) {
        parent.children.delete(current.label[0]!)
      } else if (current.children.size === 1) {
        const [_key, grandChild] = current.children.entries().next().value! as [string, TrieNode<T>]
        grandChild.label = current.label + grandChild.label
        parent.children.set(current.label[0]!, grandChild)
      } else {
        break
      }
    }
  }

  private collectKeys(node: TrieNode<T>, prefix: string, results: string[]): void {
    for (const [_char, child] of node.children) {
      const childKey = prefix + child.label
      if (child.hasValue) {
        results.push(childKey)
      }
      this.collectKeys(child, childKey, results)
    }
  }

  private *collectKeysGen(node: TrieNode<T>, prefix: string): Generator<string> {
    for (const child of node.children.values()) {
      const childKey = prefix + child.label
      if (child.hasValue) {
        yield childKey
      }
      yield* this.collectKeysGen(child, childKey)
    }
  }

  private *collectValuesGen(node: TrieNode<T>): Generator<T> {
    for (const child of node.children.values()) {
      if (child.hasValue) {
        yield child.value as T
      }
      yield* this.collectValuesGen(child)
    }
  }

  private *collectEntriesGen(node: TrieNode<T>, prefix: string): Generator<TrieEntry<T>> {
    for (const child of node.children.values()) {
      const childKey = prefix + child.label
      if (child.hasValue) {
        yield { key: childKey, value: child.value as T }
      }
      yield* this.collectEntriesGen(child, childKey)
    }
  }

  toArray(): any[] {
    return [...this]
  }



  toString(): string {
    return `PathCompressionTrie({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PathCompressionTrie', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'PathCompressionTrie'
  }
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  let i = 0
  while (i < max && a[i] === b[i]) {
    i++
  }
  return i
}
