import type {
  AdaptiveTrieOptions,
  AdaptiveTrieNode,
  NodeType,
} from './types.js'
const NODE4_MAX = 4
const NODE16_MAX = 16
const NODE48_MAX = 48

function makeNode<T>(type: NodeType): AdaptiveTrieNode<T> {
  return {
    type,
    prefix: [],
    prefixLen: 0,
    value: undefined,
    hasValue: false,
    childCount: 0,
    children: new Map(),
  }
}

function findChild<T>(node: AdaptiveTrieNode<T>, key: number): AdaptiveTrieNode<T> | undefined {
  return node.children.get(key)
}

function addChild<T>(node: AdaptiveTrieNode<T>, key: number, child: AdaptiveTrieNode<T>): AdaptiveTrieNode<T> {
  const isNew = !node.children.has(key)
  node.children.set(key, child)
  if (isNew) node.childCount++

  const needsGrow = (node.type === 'node4' && node.childCount > NODE4_MAX)
    || (node.type === 'node16' && node.childCount > NODE16_MAX)
    || (node.type === 'node48' && node.childCount > NODE48_MAX)

  if (needsGrow) {
    return growNode(node)
  }
  return node
}

function growNode<T>(node: AdaptiveTrieNode<T>): AdaptiveTrieNode<T> {
  const newType: NodeType = node.type === 'node4' ? 'node16'
    : node.type === 'node16' ? 'node48'
    : 'node256'
  const nn = makeNode<T>(newType)
  nn.prefix = node.prefix
  nn.prefixLen = node.prefixLen
  nn.value = node.value
  nn.hasValue = node.hasValue
  nn.children = node.children
  nn.childCount = node.childCount
  return nn
}

function shouldShrink<T>(node: AdaptiveTrieNode<T>): boolean {
  if (node.type === 'node16') return node.childCount <= NODE4_MAX
  if (node.type === 'node48') return node.childCount <= NODE16_MAX
  if (node.type === 'node256') return node.childCount <= NODE48_MAX
  return false
}

function shrinkNode<T>(node: AdaptiveTrieNode<T>): AdaptiveTrieNode<T> {
  const newType: NodeType = node.type === 'node16' ? 'node4'
    : node.type === 'node48' ? 'node16'
    : 'node48'
  const nn = makeNode<T>(newType)
  nn.prefix = node.prefix
  nn.prefixLen = node.prefixLen
  nn.value = node.value
  nn.hasValue = node.hasValue
  nn.children = node.children
  nn.childCount = node.childCount
  return nn
}

function removeChild<T>(node: AdaptiveTrieNode<T>, key: number): AdaptiveTrieNode<T> {
  if (node.children.delete(key)) {
    node.childCount--
    if (shouldShrink(node)) return shrinkNode(node)
  }
  return node
}

function keyChars(key: string): number[] {
  const r: number[] = []
  for (let i = 0; i < key.length; i++) r.push(key.charCodeAt(i))
  return r
}

function charsToStr(chars: readonly number[]): string {
  let s = ''
  for (let i = 0; i < chars.length; i++) s += String.fromCharCode(chars[i]!)
  return s
}

function prefixMismatch<T>(node: AdaptiveTrieNode<T>, key: number[], depth: number): number {
  const maxCmp = Math.min(node.prefixLen, key.length - depth)
  let i = 0
  for (; i < maxCmp; i++) {
    if (node.prefix[i] !== key[depth + i]) return i
  }
  return i
}

function forEachChild<T>(node: AdaptiveTrieNode<T>, fn: (key: number, child: AdaptiveTrieNode<T>) => void): void {
  node.children.forEach((child, key) => fn(key, child))
}

function countNodes<T>(node: AdaptiveTrieNode<T> | undefined): number {
  if (node === undefined) return 0
  let c = 1
  forEachChild(node, (_, child) => { c += countNodes(child) })
  return c
}

function treeHeight<T>(node: AdaptiveTrieNode<T> | undefined): number {
  if (node === undefined) return 0
  let h = 0
  forEachChild(node, (_, child) => { const ch = treeHeight(child); if (ch > h) h = ch })
  return h + 1
}

function insertRecursive<T>(
  node: AdaptiveTrieNode<T> | undefined,
  key: number[],
  depth: number,
  value: T,
): { node: AdaptiveTrieNode<T>; added: boolean } {
  if (node === undefined) {
    const nn = makeNode<T>('node4')
    nn.prefix = key.slice(depth)
    nn.prefixLen = key.length - depth
    nn.value = value
    nn.hasValue = true
    return { node: nn, added: true }
  }

  const pml = prefixMismatch(node, key, depth)

  if (pml < node.prefixLen) {
    const split = makeNode<T>('node4')
    split.prefix = node.prefix.slice(0, pml)
    split.prefixLen = pml

    const remaining = key.length - depth - pml

    if (remaining === 0) {
      split.value = value
      split.hasValue = true
      if (node.prefixLen - pml > 0) {
        const cChar = node.prefix[pml]!
        const gc = makeNode<T>(node.type)
        gc.prefix = node.prefix.slice(pml + 1)
        gc.prefixLen = node.prefixLen - pml - 1
        gc.children = node.children
        gc.childCount = node.childCount
        gc.value = node.value
        gc.hasValue = node.hasValue
        return { node: addChild(split, cChar, gc), added: true }
      }
      split.children = node.children
      split.childCount = node.childCount
      return { node: split, added: true }
    }

    const nChar = node.prefix[pml]!
    const kChar = key[depth + pml]!
    const gc = makeNode<T>(node.type)
    gc.prefix = node.prefix.slice(pml + 1)
    gc.prefixLen = node.prefixLen - pml - 1
    gc.children = node.children
    gc.childCount = node.childCount
    gc.value = node.value
    gc.hasValue = node.hasValue

    const leaf = makeNode<T>('node4')
    leaf.prefix = key.slice(depth + pml + 1)
    leaf.prefixLen = remaining - 1
    leaf.value = value
    leaf.hasValue = true

    let s = addChild(split, nChar, gc)
    s = addChild(s, kChar, leaf)
    return { node: s, added: true }
  }

  const nd = depth + node.prefixLen
  if (nd === key.length) {
    const wasNew = !node.hasValue
    node.value = value
    node.hasValue = true
    return { node, added: wasNew }
  }

  const nc = key[nd]!
  const child = findChild(node, nc)
  if (child === undefined) {
    const nn = makeNode<T>('node4')
    nn.prefix = key.slice(nd + 1)
    nn.prefixLen = key.length - nd - 1
    nn.value = value
    nn.hasValue = true
    return { node: addChild(node, nc, nn), added: true }
  }

  const res = insertRecursive(child, key, nd + 1, value)
  return { node: addChild(node, nc, res.node), added: res.added }
}

function deleteRecursive<T>(node: AdaptiveTrieNode<T>, key: number[], depth: number): { node: AdaptiveTrieNode<T> | undefined; deleted: boolean } {
  const pml = prefixMismatch(node, key, depth)
  if (pml !== node.prefixLen) return { node, deleted: false }

  const nd = depth + node.prefixLen
  if (nd === key.length) {
    if (!node.hasValue) return { node, deleted: false }
    node.value = undefined
    node.hasValue = false
    if (node.childCount === 0) return { node: undefined, deleted: true }
    if (node.childCount === 1) return { node: mergeSingle(node), deleted: true }
    return { node, deleted: true }
  }

  const nc = key[nd]!
  const child = findChild(node, nc)
  if (child === undefined) return { node, deleted: false }

  const res = deleteRecursive(child, key, nd + 1)
  if (!res.deleted) return { node, deleted: false }

  if (res.node === undefined) {
    const updated = removeChild(node, nc)
    if (!updated.hasValue && updated.childCount === 1) return { node: mergeSingle(updated), deleted: true }
    return { node: updated, deleted: true }
  }

  return { node: addChild(node, nc, res.node), deleted: true }
}

function mergeSingle<T>(node: AdaptiveTrieNode<T>): AdaptiveTrieNode<T> {
  if (node.childCount !== 1) return node
  let onlyKey = -1
  let onlyChild: AdaptiveTrieNode<T> | undefined
  node.children.forEach((c, k) => { onlyKey = k; onlyChild = c })
  if (onlyChild === undefined || onlyKey < 0) return node
  const m = makeNode<T>(onlyChild.type)
  m.prefix = [...node.prefix, onlyKey, ...onlyChild.prefix]
  m.prefixLen = node.prefixLen + 1 + onlyChild.prefixLen
  m.value = onlyChild.value
  m.hasValue = onlyChild.hasValue
  m.children = onlyChild.children
  m.childCount = onlyChild.childCount
  return m
}

function collectKeys<T>(node: AdaptiveTrieNode<T>, prefix: string, out: string[]): void {
  const p = prefix + charsToStr(node.prefix)
  if (node.hasValue) out.push(p)
  forEachChild(node, (k, c) => collectKeys(c, p + String.fromCharCode(k), out))
}

function collectValues<T>(node: AdaptiveTrieNode<T>, out: T[]): void {
  if (node.hasValue && node.value !== undefined) out.push(node.value)
  forEachChild(node, (_, c) => collectValues(c, out))
}

function collectEntries<T>(node: AdaptiveTrieNode<T>, prefix: string, out: Array<[string, T]>): void {
  const p = prefix + charsToStr(node.prefix)
  if (node.hasValue && node.value !== undefined) out.push([p, node.value])
  forEachChild(node, (k, c) => collectEntries(c, p + String.fromCharCode(k), out))
}

function forEachEntry<T>(node: AdaptiveTrieNode<T>, prefix: string, cb: (value: T, key: string) => void): void {
  const p = prefix + charsToStr(node.prefix)
  if (node.hasValue && node.value !== undefined) cb(node.value, p)
  forEachChild(node, (k, c) => forEachEntry(c, p + String.fromCharCode(k), cb))
}

function longestPrefixMatch<T>(node: AdaptiveTrieNode<T>, key: number[], depth: number, cur: string): string | undefined {
  const pml = prefixMismatch(node, key, depth)
  if (pml < node.prefixLen) {
    return undefined
  }
  const fp = cur + charsToStr(node.prefix)
  let result: string | undefined = node.hasValue ? fp : undefined
  const nd = depth + node.prefixLen
  if (nd >= key.length) return result
  const nc = key[nd]!
  const child = findChild(node, nc)
  if (child !== undefined) {
    const cr = longestPrefixMatch(child, key, nd + 1, fp + String.fromCharCode(nc))
    if (cr !== undefined) return cr
  }
  return result
}

export class AdaptiveTrie<T> {
  private root: AdaptiveTrieNode<T> | undefined
  private _size: number = 0

  constructor(_options?: AdaptiveTrieOptions) {
    void _options
    this.root = undefined
  }

  insert(key: string, value: T): void {
    const chars = keyChars(key)
    const res = insertRecursive(this.root, chars, 0, value)
    this.root = res.node
    if (res.added) this._size++
  }

  get(key: string): T | undefined {
    const chars = keyChars(key)
    let node = this.root
    let depth = 0
    while (node !== undefined) {
      const pml = prefixMismatch(node, chars, depth)
      if (pml !== node.prefixLen) return undefined
      depth += node.prefixLen
      if (depth === chars.length) return node.hasValue ? node.value : undefined
      if (depth >= chars.length) return undefined
      const nc = chars[depth]!
      node = findChild(node, nc)
      depth++
    }
    return undefined
  }

  has(key: string): boolean {
    const chars = keyChars(key)
    let node = this.root
    let depth = 0
    while (node !== undefined) {
      const pml = prefixMismatch(node, chars, depth)
      if (pml !== node.prefixLen) return false
      depth += node.prefixLen
      if (depth === chars.length) return node.hasValue
      if (depth >= chars.length) return false
      const nc = chars[depth]!
      node = findChild(node, nc)
      depth++
    }
    return false
  }

  delete(key: string): boolean {
    if (this.root === undefined) return false
    const chars = keyChars(key)
    const res = deleteRecursive(this.root, chars, 0)
    if (res.deleted) {
      this.root = res.node
      this._size--
      return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this.root = undefined
    this._size = 0
  }

  keys(): string[] {
    const out: string[] = []
    if (this.root !== undefined) collectKeys(this.root, '', out)
    return out
  }

  values(): T[] {
    const out: T[] = []
    if (this.root !== undefined) collectValues(this.root, out)
    return out
  }

  entries(): Array<[string, T]> {
    const out: Array<[string, T]> = []
    if (this.root !== undefined) collectEntries(this.root, '', out)
    return out
  }

  forEach(callback: (value: T, key: string) => void): void {
    if (this.root !== undefined) forEachEntry(this.root, '', callback)
  }

  startsWith(prefix: string): string[] {
    if (this.root === undefined) return []
    if (prefix === '') return this.keys()
    const chars = keyChars(prefix)
    const out: string[] = []
    let node: AdaptiveTrieNode<T> | undefined = this.root
    let depth = 0
    let pathPrefix = ''
    while (node !== undefined && depth < chars.length) {
      const pml = prefixMismatch(node, chars, depth)
      if (pml < node.prefixLen) {
        if (depth + pml === chars.length) {
          const partialNode: AdaptiveTrieNode<T> = {
            ...node,
            prefix: node.prefix.slice(pml),
            prefixLen: node.prefixLen - pml,
          }
          collectKeys(partialNode, pathPrefix + charsToStr(node.prefix.slice(0, pml)), out)
        }
        return out
      }
      depth += node.prefixLen
      if (depth >= chars.length) {
        collectKeys(node, pathPrefix, out)
        return out
      }
      const nc = chars[depth]!
      pathPrefix += charsToStr(node.prefix) + String.fromCharCode(nc)
      node = findChild(node, nc)
      depth++
    }
    if (node !== undefined) {
      collectKeys(node, pathPrefix, out)
    }
    return out
  }

  longestPrefixOf(key: string): string | undefined {
    if (this.root === undefined) return undefined
    return longestPrefixMatch(this.root, keyChars(key), 0, '')
  }

  nodeCount(): number {
    return countNodes(this.root)
  }

  height(): number {
    return treeHeight(this.root)
  }
}

export { DEFAULT_ADAPTIVE_TRIE_OPTIONS } from './types.js'
export type { AdaptiveTrieOptions, AdaptiveTrieNode, NodeType } from './types.js'
