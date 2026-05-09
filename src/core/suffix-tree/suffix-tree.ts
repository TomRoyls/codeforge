import type { SuffixTreeNode, SuffixTreeOptions } from './types.js'
import { DEFAULT_SUFFIXTREE_OPTIONS } from './types.js'

export class SuffixTree {
  private root: SuffixTreeNode
  private text: string
  private options: SuffixTreeOptions
  private nodeCount: number

  constructor(text: string, options?: Partial<SuffixTreeOptions>) {
    this.options = { ...DEFAULT_SUFFIXTREE_OPTIONS, ...options }
    this.text = text + this.options.terminator
    this.root = this.createNode(-1, -1, false)
    this.nodeCount = 1
    this.build()
  }

  private createNode(start: number, end: number, isLeaf: boolean): SuffixTreeNode {
    return {
      children: new Map<string, SuffixTreeNode>(),
      start,
      end,
      suffixLink: null,
      isLeaf,
      suffixIndex: -1,
    }
  }

  private build(): void {
    for (let i = 0; i < this.text.length; i++) {
      this.addSuffix(i)
    }
  }

  private addSuffix(suffixStart: number): void {
    let i = suffixStart
    let node = this.root

    while (i < this.text.length) {
      const ch = this.text[i]!
      const child = node.children.get(ch)

      if (!child) {
        const leaf = this.createNode(i, this.text.length - 1, true)
        leaf.suffixIndex = suffixStart
        node.children.set(ch, leaf)
        this.nodeCount++
        return
      }

      const edgeLen = child.end - child.start + 1
      let k = 0

      while (k < edgeLen) {
        if (this.text[child.start + k]! !== this.text[i + k]!) {
          const internal = this.createNode(child.start, child.start + k - 1, false)
          internal.suffixLink = this.root

          const oldStart = child.start
          child.start = oldStart + k

          const leaf = this.createNode(i + k, this.text.length - 1, true)
          leaf.suffixIndex = suffixStart

          internal.children.set(this.text[child.start]!, child)
          internal.children.set(this.text[leaf.start]!, leaf)
          node.children.set(this.text[oldStart]!, internal)

          this.nodeCount += 2
          return
        }
        k++
      }

      i += edgeLen
      node = child
    }
  }

  search(pattern: string): boolean {
    if (pattern.length === 0) return false
    if (pattern.includes(this.options.terminator)) return false
    return this.findAll(pattern).length > 0
  }

  findAll(pattern: string): number[] {
    if (pattern.length === 0) return []
    if (pattern.includes(this.options.terminator)) return []

    let node = this.root
    let patIdx = 0

    while (patIdx < pattern.length) {
      const ch = pattern[patIdx]!
      const child = node.children.get(ch)
      if (!child) return []

      const edgeLen = child.end - child.start + 1
      for (let k = 0; k < edgeLen && patIdx < pattern.length; k++, patIdx++) {
        if (this.text[child.start + k]! !== pattern[patIdx]!) return []
      }

      node = child
    }

    const positions: number[] = []
    this.collectLeafPositions(node, positions)
    return positions.sort((a, b) => a - b)
  }

  countOccurrences(pattern: string): number {
    return this.findAll(pattern).length
  }

  longestRepeat(): string {
    let best = ''
    const find = (node: SuffixTreeNode, path: string): void => {
      if (node.isLeaf) return
      if (node !== this.root && path.length > best.length) {
        best = path
      }
      for (const child of node.children.values()) {
        const label = this.text.substring(child.start, child.end + 1)
        find(child, path + label)
      }
    }
    find(this.root, '')
    return best
  }

  longestCommonPrefix(): string {
    const originalLen = this.text.length - this.options.terminator.length
    for (let len = originalLen - 1; len > 0; len--) {
      const prefix = this.text.substring(0, len)
      if (this.isSuffix(prefix)) return prefix
    }
    return ''
  }

  hasSubstring(pattern: string): boolean {
    return this.search(pattern)
  }

  isSuffix(pattern: string): boolean {
    if (pattern.length === 0) return true
    const fullSuffix = pattern + this.options.terminator
    const expectedStart = this.text.length - fullSuffix.length
    if (expectedStart < 0) return false
    const positions = this.findAll(pattern)
    return positions.includes(expectedStart)
  }

  toString(): string {
    const lines: string[] = []
    const traverse = (node: SuffixTreeNode, indent: string, label: string): void => {
      const display = label ? `"${label}"` : 'root'
      const suffix = node.isLeaf ? ` [@${node.suffixIndex}]` : ''
      lines.push(`${indent}${display}${suffix}`)
      for (const child of node.children.values()) {
        const childLabel = this.text.substring(child.start, child.end + 1)
        traverse(child, indent + '  ', childLabel)
      }
    }
    traverse(this.root, '', '')
    return lines.join('\n')
  }

  getNodeCount(): number {
    return this.nodeCount
  }

  private collectLeafPositions(node: SuffixTreeNode, positions: number[]): void {
    if (node.isLeaf) {
      positions.push(node.suffixIndex)
      return
    }
    for (const child of node.children.values()) {
      this.collectLeafPositions(child, positions)
    }
  }
}

export { DEFAULT_SUFFIXTREE_OPTIONS } from './types.js'
export type { SuffixTreeNode, SuffixTreeOptions } from './types.js'
