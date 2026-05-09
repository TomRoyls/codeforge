import type { AhoCorasickMatch, AhoCorasickOptions } from './types.js'
import { DEFAULT_AHO_CORASICK_OPTIONS } from './types.js'

interface AutomatonNode {
  children: Map<string, number>
  fail: number
  output: string[]
}

export class AhoCorasick {
  private _patterns: string[]
  private _caseSensitive: boolean
  private _nodes: AutomatonNode[]

  constructor(patterns: string[], options?: Partial<AhoCorasickOptions>) {
    const opts: AhoCorasickOptions = { ...DEFAULT_AHO_CORASICK_OPTIONS, ...options }
    this._caseSensitive = opts.caseSensitive
    this._patterns = patterns.filter(p => p.length > 0)
    this._nodes = []
    this._buildAutomaton()
  }

  private _createNode(): AutomatonNode {
    return {
      children: new Map<string, number>(),
      fail: 0,
      output: [],
    }
  }

  private _buildAutomaton(): void {
    this._nodes = [this._createNode()]

    for (const pattern of this._patterns) {
      const p = this._caseSensitive ? pattern : pattern.toLowerCase()
      let current = 0
      for (const char of p) {
        let next = this._nodes[current]!.children.get(char)
        if (next === undefined) {
          next = this._nodes.length
          this._nodes.push(this._createNode())
          this._nodes[current]!.children.set(char, next)
        }
        current = next
      }
      this._nodes[current]!.output.push(pattern)
    }

    const queue: number[] = []
    for (const [, childIdx] of this._nodes[0]!.children) {
      queue.push(childIdx)
      this._nodes[childIdx]!.fail = 0
    }

    let head = 0
    while (head < queue.length) {
      const current = queue[head]!
      head++

      for (const [char, childIdx] of this._nodes[current]!.children) {
        queue.push(childIdx)
        let failState = this._nodes[current]!.fail
        while (failState !== 0 && !this._nodes[failState]!.children.has(char)) {
          failState = this._nodes[failState]!.fail
        }
        const failChild = this._nodes[failState]!.children.get(char)
        if (failChild !== undefined && failChild !== childIdx) {
          this._nodes[childIdx]!.fail = failChild
        } else {
          this._nodes[childIdx]!.fail = 0
        }
        this._nodes[childIdx]!.output = [
          ...this._nodes[childIdx]!.output,
          ...this._nodes[this._nodes[childIdx]!.fail]!.output,
        ]
      }
    }
  }

  search(text: string): AhoCorasickMatch[] {
    if (this._patterns.length === 0 || text.length === 0) return []

    const input = this._caseSensitive ? text : text.toLowerCase()
    const results: AhoCorasickMatch[] = []
    let state = 0

    for (let i = 0; i < input.length; i++) {
      const char = input[i]!
      while (state !== 0 && !this._nodes[state]!.children.has(char)) {
        state = this._nodes[state]!.fail
      }
      const next = this._nodes[state]!.children.get(char)
      if (next !== undefined) {
        state = next
      }
      for (const pattern of this._nodes[state]!.output) {
        const patternLen = this._caseSensitive ? pattern.length : pattern.length
        results.push({
          pattern,
          startIndex: i - patternLen + 1,
          endIndex: i + 1,
        })
      }
    }

    return results
  }

  findAll(text: string): AhoCorasickMatch[] {
    return this.search(text)
  }

  findFirst(text: string): AhoCorasickMatch | undefined {
    if (this._patterns.length === 0 || text.length === 0) return undefined

    const input = this._caseSensitive ? text : text.toLowerCase()
    let state = 0

    for (let i = 0; i < input.length; i++) {
      const char = input[i]!
      while (state !== 0 && !this._nodes[state]!.children.has(char)) {
        state = this._nodes[state]!.fail
      }
      const next = this._nodes[state]!.children.get(char)
      if (next !== undefined) {
        state = next
      }
      if (this._nodes[state]!.output.length > 0) {
        const pattern = this._nodes[state]!.output[0]!
        return {
          pattern,
          startIndex: i - pattern.length + 1,
          endIndex: i + 1,
        }
      }
    }

    return undefined
  }

  containsAny(text: string): boolean {
    if (this._patterns.length === 0 || text.length === 0) return false

    const input = this._caseSensitive ? text : text.toLowerCase()
    let state = 0

    for (let i = 0; i < input.length; i++) {
      const char = input[i]!
      while (state !== 0 && !this._nodes[state]!.children.has(char)) {
        state = this._nodes[state]!.fail
      }
      const next = this._nodes[state]!.children.get(char)
      if (next !== undefined) {
        state = next
      }
      if (this._nodes[state]!.output.length > 0) {
        return true
      }
    }

    return false
  }

  countMatches(text: string): number {
    return this.search(text).length
  }

  getPatterns(): string[] {
    return [...this._patterns]
  }

  addPattern(pattern: string): void {
    if (pattern.length === 0) return
    this._patterns.push(pattern)
    this.rebuild()
  }

  rebuild(): void {
    this._buildAutomaton()
  }
}

export { DEFAULT_AHO_CORASICK_OPTIONS } from './types.js'
export type { AhoCorasickOptions, AhoCorasickMatch } from './types.js'
