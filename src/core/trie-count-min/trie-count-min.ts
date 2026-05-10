import type { TrieCountMinOptions, TrieCountMinNode } from './types.js'
import { DEFAULT_TRIECOUNTMIN_OPTIONS } from './types.js'

export class TrieCountMin {
  private root: TrieCountMinNode
  private _width: number
  private _depth: number
  private _seed: number
  private _totalInsertions: number
  private _distinctCount: number

  constructor(width?: number, depth?: number, seed?: number)
  constructor(options?: Partial<TrieCountMinOptions>)
  constructor(
    widthOrOptions?: number | Partial<TrieCountMinOptions>,
    depth?: number,
    seed?: number,
  ) {
    let opts: TrieCountMinOptions
    if (typeof widthOrOptions === 'object' && widthOrOptions !== null) {
      opts = { ...DEFAULT_TRIECOUNTMIN_OPTIONS, ...widthOrOptions }
    } else {
      opts = {
        ...DEFAULT_TRIECOUNTMIN_OPTIONS,
        ...(widthOrOptions !== undefined ? { width: widthOrOptions } : {}),
        ...(depth !== undefined ? { depth } : {}),
        ...(seed !== undefined ? { seed } : {}),
      }
    }
    this._width = Math.max(1, Math.ceil(opts.width))
    this._depth = Math.max(1, Math.ceil(opts.depth))
    this._seed = opts.seed ?? 0
    this._totalInsertions = 0
    this._distinctCount = 0
    this.root = this.createNode()
  }

  private createNode(): TrieCountMinNode {
    return {
      children: new Map<string, TrieCountMinNode>(),
      isEnd: false,
      counters: new Array(this._width).fill(0),
    }
  }

  insert(key: string): void {
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
      node.isEnd = true
      this._distinctCount++
    }
    const h1 = this.hash(key, 0)
    const h2 = this.hash(key, h1)
    for (let i = 0; i < this._depth; i++) {
      const pos = ((h1 + i * h2) >>> 0) % this._width
      node.counters[pos] = node.counters[pos]! + 1
    }
    this._totalInsertions++
  }

  count(key: string): number {
    const node = this.findNode(key)
    if (!node || !node.isEnd) return 0
    const h1 = this.hash(key, 0)
    const h2 = this.hash(key, h1)
    let min = Infinity
    for (let i = 0; i < this._depth; i++) {
      const pos = ((h1 + i * h2) >>> 0) % this._width
      const val = node.counters[pos]!
      if (val < min) {
        min = val
      }
    }
    return min
  }

  prefixCount(prefix: string): number {
    const node = this.findNode(prefix)
    if (!node) return 0
    let sum = 0
    this.collectCounts(node, prefix, (c) => {
      sum += c
    })
    return sum
  }

  private estimateCount(node: TrieCountMinNode, key: string): number {
    const h1 = this.hash(key, 0)
    const h2 = this.hash(key, h1)
    let min = Infinity
    for (let i = 0; i < this._depth; i++) {
      const pos = ((h1 + i * h2) >>> 0) % this._width
      const val = node.counters[pos]!
      if (val < min) {
        min = val
      }
    }
    return min
  }

  remove(key: string): boolean {
    const node = this.findNode(key)
    if (!node || !node.isEnd) return false
    const currentEstimate = this.estimateCount(node, key)
    if (currentEstimate <= 0) return false
    const h1 = this.hash(key, 0)
    const h2 = this.hash(key, h1)
    for (let i = 0; i < this._depth; i++) {
      const pos = ((h1 + i * h2) >>> 0) % this._width
      node.counters[pos] = Math.max(0, node.counters[pos]! - 1)
    }
    this._totalInsertions--
    if (this.estimateCount(node, key) === 0) {
      node.isEnd = false
      this._distinctCount--
      this.cleanupPath(key)
    }
    return true
  }

  contains(key: string): boolean {
    const node = this.findNode(key)
    return node !== undefined && node.isEnd
  }

  totalInsertions(): number {
    return this._totalInsertions
  }

  clear(): void {
    this.root = this.createNode()
    this._totalInsertions = 0
    this._distinctCount = 0
  }

  isEmpty(): boolean {
    return this._totalInsertions === 0
  }

  getFrequentItems(threshold: number): string[] {
    const result: string[] = []
    this.collectFrequent(this.root, '', threshold, result)
    return result
  }

  update(key: string, count: number): void {
    if (count < 0) return
    if (count === 0) return
    let node = this.root
    for (const char of key) {
      let child = node.children.get(char)
      if (!child) {
        child = this.createNode()
        node.children.set(char, child)
      }
      node = child
    }
    if (!node.isEnd && count > 0) {
      node.isEnd = true
      this._distinctCount++
    }
    const oldEstimate = this.estimateCount(node, key)
    const delta = count - oldEstimate
    if (delta > 0) {
      const h1 = this.hash(key, 0)
      const h2 = this.hash(key, h1)
      for (let i = 0; i < this._depth; i++) {
        const pos = ((h1 + i * h2) >>> 0) % this._width
        node.counters[pos] = node.counters[pos]! + delta
      }
      this._totalInsertions += delta
    } else if (delta < 0) {
      const h1 = this.hash(key, 0)
      const h2 = this.hash(key, h1)
      for (let i = 0; i < this._depth; i++) {
        const pos = ((h1 + i * h2) >>> 0) % this._width
        node.counters[pos] = Math.max(0, node.counters[pos]! + delta)
      }
      this._totalInsertions = Math.max(0, this._totalInsertions + delta)
    }
  }

  get width(): number {
    return this._width
  }

  get depth(): number {
    return this._depth
  }

  get seed(): number {
    return this._seed
  }

  distinctCount(): number {
    return this._distinctCount
  }

  private findNode(key: string): TrieCountMinNode | undefined {
    let node = this.root
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) return undefined
      node = child
    }
    return node
  }

  private collectCounts(
    node: TrieCountMinNode,
    prefix: string,
    callback: (count: number) => void,
  ): void {
    if (node.isEnd) {
      callback(this.estimateCount(node, prefix))
    }
    for (const [char, child] of node.children) {
      this.collectCounts(child, prefix + char, callback)
    }
  }

  private collectFrequent(
    node: TrieCountMinNode,
    prefix: string,
    threshold: number,
    result: string[],
  ): void {
    if (node.isEnd) {
      const c = this.estimateCount(node, prefix)
      if (c >= threshold) {
        result.push(prefix)
      }
    }
    for (const [char, child] of node.children) {
      this.collectFrequent(child, prefix + char, threshold, result)
    }
  }

  private cleanupPath(key: string): void {
    const path: Array<{ parent: TrieCountMinNode; char: string; node: TrieCountMinNode }> = []
    let node = this.root
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) return
      path.push({ parent: node, char, node: child })
      node = child
    }
    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      if (entry.node.children.size === 0 && !entry.node.isEnd) {
        entry.parent.children.delete(entry.char)
      } else {
        break
      }
    }
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ (seed + this._seed)
    let h2 = 0x41c6ce57 ^ (seed + this._seed)
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }
}

export { DEFAULT_TRIECOUNTMIN_OPTIONS } from './types.js'
export type { TrieCountMinOptions, TrieCountMinNode } from './types.js'
