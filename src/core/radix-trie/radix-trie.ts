import type { RadixNode } from './types.js'

export class RadixTrie<T = unknown> {
  private root: RadixNode<T>
  private _size: number

  constructor() {
    this.root = this.createNode('')
    this._size = 0
  }

  private createNode(label: string): RadixNode<T> {
    return {
      children: new Map<string, RadixNode<T>>(),
      value: undefined,
      isEnd: false,
      label,
    }
  }

  set(key: string, value: T): void {
    let node = this.root
    let remaining = key

    while (remaining.length > 0) {
      let matched = false
      for (const [edgeLabel, child] of node.children) {
        const commonLen = this.commonPrefixLength(remaining, edgeLabel)
        if (commonLen === 0) continue

        if (commonLen === edgeLabel.length) {
          node = child
          remaining = remaining.slice(commonLen)
          matched = true
          break
        }

        const splitLabel = edgeLabel.slice(0, commonLen)
        const restLabel = edgeLabel.slice(commonLen)

        const splitNode = this.createNode(splitLabel)
        splitNode.children.set(restLabel, child)
        child.label = restLabel

        node.children.delete(edgeLabel)
        node.children.set(splitLabel, splitNode)
        node = splitNode
        remaining = remaining.slice(commonLen)
        matched = true
        break
      }

      if (!matched) {
        const newNode = this.createNode(remaining)
        node.children.set(remaining, newNode)
        node = newNode
        remaining = ''
      }
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

  has(key: string): boolean {
    const node = this.findNode(key)
    return node !== undefined && node.isEnd
  }

  delete(key: string): boolean {
    const result = this.deleteRecursive(this.root, key)
    if (result) this._size--
    return result
  }

  private deleteRecursive(node: RadixNode<T>, key: string): boolean {
    if (key === '') {
      if (!node.isEnd) return false
      node.isEnd = false
      node.value = undefined
      return true
    }

    for (const [edgeLabel, child] of node.children) {
      if (key.startsWith(edgeLabel)) {
        const remaining = key.slice(edgeLabel.length)
        const deleted = this.deleteRecursive(child, remaining)
        if (!deleted) return false

        if (!child.isEnd && child.children.size === 0) {
          node.children.delete(edgeLabel)
        } else if (!child.isEnd && child.children.size === 1) {
          const [grandEdge, grandChild] = child.children.entries().next().value!
          const mergedLabel = edgeLabel + grandEdge
          child.children.delete(grandEdge)
          grandChild.label = mergedLabel
          node.children.delete(edgeLabel)
          node.children.set(mergedLabel, grandChild)
        }
        return true
      }

      const commonLen = this.commonPrefixLength(key, edgeLabel)
      if (commonLen > 0) {
        return false
      }
    }

    return false
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.createNode('')
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

  startsWith(prefix: string): string[] {
    if (prefix === '') {
      const result: string[] = []
      this.collectKeys(this.root, '', result)
      return result
    }

    let node = this.root
    let accumulated = ''
    let remaining = prefix

    while (remaining.length > 0) {
      let found = false
      for (const [edgeLabel, child] of node.children) {
        if (remaining.startsWith(edgeLabel)) {
          accumulated += edgeLabel
          remaining = remaining.slice(edgeLabel.length)
          node = child
          found = true
          break
        }

        const commonLen = this.commonPrefixLength(remaining, edgeLabel)
        if (commonLen > 0 && commonLen === remaining.length) {
          accumulated += edgeLabel
          const result: string[] = []
          this.collectKeys(child, accumulated, result)
          return result
        }
      }
      if (!found) return []
    }

    const result: string[] = []
    this.collectKeys(node, prefix, result)
    return result
  }

  autocomplete(prefix: string, limit?: number): string[] {
    const all = this.startsWith(prefix)
    if (limit !== undefined) {
      return all.slice(0, limit)
    }
    return all
  }

  longestCommonPrefix(): string {
    if (this._size === 0) return ''
    if (this._size === 1) return this.keys()[0] ?? ''

    let prefix = ''
    let node = this.root

    while (true) {
      if (node.isEnd && node !== this.root) break
      const entries = Array.from(node.children.entries())
      if (entries.length !== 1) break
      const [edgeLabel, child] = entries[0]!
      prefix += edgeLabel
      node = child
    }

    return prefix
  }

  clone(): RadixTrie<T> {
    const cloned = new RadixTrie<T>()
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      cloned.set(key, value)
    }
    return cloned
  }

  [Symbol.iterator](): Iterator<[string, T]> {
    const all = this.entries()
    let index = 0
    return {
      next(): IteratorResult<[string, T]> {
        if (index < all.length) {
          const entry = all[index]!
          index++
          return { value: entry, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }

  private findNode(key: string): RadixNode<T> | undefined {
    let node = this.root
    let remaining = key

    while (remaining.length > 0) {
      let found = false
      for (const [edgeLabel, child] of node.children) {
        if (remaining.startsWith(edgeLabel)) {
          node = child
          remaining = remaining.slice(edgeLabel.length)
          found = true
          break
        }
      }
      if (!found) return undefined
    }

    return node
  }

  private commonPrefixLength(a: string, b: string): number {
    const maxLen = Math.min(a.length, b.length)
    let i = 0
    while (i < maxLen && a[i] === b[i]) {
      i++
    }
    return i
  }

  private collectKeys(node: RadixNode<T>, prefix: string, result: string[]): void {
    if (node.isEnd) {
      result.push(prefix)
    }
    for (const [edgeLabel, child] of node.children) {
      this.collectKeys(child, prefix + edgeLabel, result)
    }
  }

  private collectValues(node: RadixNode<T>, result: T[]): void {
    if (node.isEnd && node.value !== undefined) {
      result.push(node.value)
    }
    for (const [, child] of node.children) {
      this.collectValues(child, result)
    }
  }

  private collectEntries(node: RadixNode<T>, prefix: string, result: Array<[string, T]>): void {
    if (node.isEnd && node.value !== undefined) {
      result.push([prefix, node.value])
    }
    for (const [edgeLabel, child] of node.children) {
      this.collectEntries(child, prefix + edgeLabel, result)
    }
  }
}

export type { RadixNode } from './types.js'
