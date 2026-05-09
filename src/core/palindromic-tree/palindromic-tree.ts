import type { PalindromicTreeNode, PalindromicTreeOptions } from './types.js'
import { DEFAULT_PALINDROMIC_TREE_OPTIONS } from './types.js'

export class PalindromicTree {
  private _nodes: PalindromicTreeNode[]
  private _text: string[]
  private _last: number
  private _totalPalindromicSubstrings: number
  private _caseSensitive: boolean

  constructor(text?: string, options?: Partial<PalindromicTreeOptions>) {
    const opts: PalindromicTreeOptions = { ...DEFAULT_PALINDROMIC_TREE_OPTIONS, ...options }
    this._caseSensitive = opts.caseSensitive
    this._nodes = []
    this._text = []
    this._last = 1
    this._totalPalindromicSubstrings = 0

    this._nodes.push({ length: -1, link: 0, next: new Map(), count: 0, num: 0, start: -1 })
    this._nodes.push({ length: 0, link: 0, next: new Map(), count: 0, num: 0, start: -1 })

    if (text !== undefined && text.length > 0) {
      this.build(text)
    }
  }

  addChar(ch: string): void {
    const character = this._caseSensitive ? ch : ch.toLowerCase()
    this._text.push(character)
    const pos = this._text.length - 1
    let cur = this._last

    while (true) {
      const curLen = this._nodes[cur]!.length
      if (pos - 1 - curLen >= 0 && this._text[pos - 1 - curLen] === character) {
        break
      }
      cur = this._nodes[cur]!.link
    }

    if (this._nodes[cur]!.next.has(character)) {
      this._last = this._nodes[cur]!.next.get(character)!
      this._nodes[this._last]!.count++
      this._totalPalindromicSubstrings += this._nodes[this._last]!.num
      return
    }

    const newNode: PalindromicTreeNode = {
      length: this._nodes[cur]!.length + 2,
      link: 1,
      next: new Map(),
      count: 1,
      num: 1,
      start: pos - this._nodes[cur]!.length - 1,
    }

    this._nodes.push(newNode)
    const nodeIdx = this._nodes.length - 1
    this._nodes[cur]!.next.set(character, nodeIdx)

    if (newNode.length === 1) {
      newNode.link = 1
      this._last = nodeIdx
      this._totalPalindromicSubstrings += newNode.num
      return
    }

    let linkCandidate = this._nodes[cur]!.link
    while (true) {
      const linkLen = this._nodes[linkCandidate]!.length
      if (pos - 1 - linkLen >= 0 && this._text[pos - 1 - linkLen] === character) {
        break
      }
      linkCandidate = this._nodes[linkCandidate]!.link
    }

    newNode.link = this._nodes[linkCandidate]!.next.get(character)!
    newNode.num = 1 + this._nodes[newNode.link]!.num

    this._last = nodeIdx
    this._totalPalindromicSubstrings += newNode.num
  }

  build(text: string): void {
    for (const ch of text) {
      this.addChar(ch)
    }
  }

  containsPalindrome(pal: string): boolean {
    const normalized = this._caseSensitive ? pal : pal.toLowerCase()
    if (normalized.length === 0) return false
    return this._walkTree(normalized)
  }

  private _walkTree(pal: string): boolean {
    const chars = [...pal]
    for (let i = 2; i < this._nodes.length; i++) {
      const node = this._nodes[i]!
      if (node.length !== chars.length) continue
      if (node.start < 0) continue
      let match = true
      for (let j = 0; j < chars.length; j++) {
        if (this._text[node.start + j] !== chars[j]) {
          match = false
          break
        }
      }
      if (match) return true
    }
    return false
  }

  private _getPalindromeFromNode(nodeIdx: number): string {
    const node = this._nodes[nodeIdx]!
    if (node.start < 0 || node.length <= 0) return ''
    return this._text.slice(node.start, node.start + node.length).join('')
  }

  countDistinctPalindromes(): number {
    return this._nodes.length - 2
  }

  getAllPalindromes(): string[] {
    const result: string[] = []
    for (let i = 2; i < this._nodes.length; i++) {
      result.push(this._getPalindromeFromNode(i))
    }
    return result
  }

  getLongestPalindrome(): string {
    if (this._nodes.length <= 2) return ''
    let maxLen = 0
    let maxIdx = 2
    for (let i = 2; i < this._nodes.length; i++) {
      if (this._nodes[i]!.length > maxLen) {
        maxLen = this._nodes[i]!.length
        maxIdx = i
      }
    }
    return this._getPalindromeFromNode(maxIdx)
  }

  countOccurrences(pal: string): number {
    const normalized = this._caseSensitive ? pal : pal.toLowerCase()
    const len = [...normalized].length
    if (len === 0) return 0

    const counts = this._propagateCounts()

    for (let i = 2; i < this._nodes.length; i++) {
      const node = this._nodes[i]!
      if (node.length !== len) continue
      if (this._getPalindromeFromNode(i) === normalized) return counts[i]!
    }
    return 0
  }

  private _propagateCounts(): number[] {
    const counts = new Array<number>(this._nodes.length).fill(0)
    for (let i = 0; i < this._nodes.length; i++) {
      counts[i] = this._nodes[i]!.count
    }
    for (let i = counts.length - 1; i >= 2; i--) {
      const link = this._nodes[i]!.link
      if (link >= 2) {
        counts[link]! += counts[i]!
      }
    }
    return counts
  }

  getTotalPalindromicSubstrings(): number {
    return this._totalPalindromicSubstrings
  }

  getLength(): number {
    return this._text.length
  }

  clone(): PalindromicTree {
    const cloned = new PalindromicTree(undefined, { caseSensitive: this._caseSensitive })
    cloned._text = [...this._text]
    cloned._nodes = this._nodes.map((node) => ({
      length: node.length,
      link: node.link,
      next: new Map(node.next),
      count: node.count,
      num: node.num,
      start: node.start,
    }))
    cloned._last = this._last
    cloned._totalPalindromicSubstrings = this._totalPalindromicSubstrings
    return cloned
  }

  clear(): void {
    this._nodes = []
    this._text = []
    this._last = 1
    this._totalPalindromicSubstrings = 0

    this._nodes.push({ length: -1, link: 0, next: new Map(), count: 0, num: 0, start: -1 })
    this._nodes.push({ length: 0, link: 0, next: new Map(), count: 0, num: 0, start: -1 })
  }
}

export { DEFAULT_PALINDROMIC_TREE_OPTIONS } from './types.js'
export type { PalindromicTreeOptions, PalindromicTreeNode } from './types.js'
