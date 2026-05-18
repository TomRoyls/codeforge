import type { MultisearchMatch } from './types.js'
import { increment } from '../../utils/map-helpers.js'

interface AutomatonNode {
  children: Map<string, number>
  fail: number
  output: string[]
}

export class Multisearch {
  private _patterns: string[]
  private _nodes: AutomatonNode[]

  constructor(patterns: string[]) {
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
      let current = 0
      for (const char of pattern) {
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

  search(text: string): MultisearchMatch[] {
    if (this._patterns.length === 0 || text.length === 0) return []

    const results: MultisearchMatch[] = []
    let state = 0

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
      while (state !== 0 && !this._nodes[state]!.children.has(char)) {
        state = this._nodes[state]!.fail
      }
      const next = this._nodes[state]!.children.get(char)
      if (next !== undefined) {
        state = next
      }
      for (const pattern of this._nodes[state]!.output) {
        results.push({
          pattern,
          index: i - pattern.length + 1,
        })
      }
    }

    return results
  }

  searchFirst(text: string): MultisearchMatch | undefined {
    if (this._patterns.length === 0 || text.length === 0) return undefined

    let state = 0

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
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
          index: i - pattern.length + 1,
        }
      }
    }

    return undefined
  }

  countMatches(text: string): Map<string, number> {
    const counts = new Map<string, number>()
    const matches = this.search(text)
    for (const match of matches) {
      increment(counts, match.pattern)
    }
    return counts
  }

  containsAny(text: string): boolean {
    if (this._patterns.length === 0 || text.length === 0) return false

    let state = 0

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
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

  containsAll(text: string): boolean {
    if (this._patterns.length === 0) return true

    const counts = this.countMatches(text)
    for (const pattern of this._patterns) {
      if ((counts.get(pattern) ?? 0) === 0) {
        return false
      }
    }
    return true
  }

  getPatterns(): string[] {
    return [...this._patterns]
  }

  addPattern(pattern: string): void {
    if (pattern.length === 0) return
    this._patterns.push(pattern)
    this._buildAutomaton()
  }

  removePattern(pattern: string): boolean {
    const idx = this._patterns.indexOf(pattern)
    if (idx === -1) return false
    this._patterns.splice(idx, 1)
    this._buildAutomaton()
    return true
  }

  setPatterns(patterns: string[]): void {
    this._patterns = patterns.filter(p => p.length > 0)
    this._buildAutomaton()
  }

  clone(): Multisearch {
    const copy = new Multisearch(this._patterns)
    return copy
  }

  static search(text: string, patterns: string[]): MultisearchMatch[] {
    const ms = new Multisearch(patterns)
    return ms.search(text)
  }

  static searchFirst(text: string, patterns: string[]): MultisearchMatch | undefined {
    const ms = new Multisearch(patterns)
    return ms.searchFirst(text)
  }

  static countMatches(text: string, patterns: string[]): Map<string, number> {
    const ms = new Multisearch(patterns)
    return ms.countMatches(text)
  }

  static containsAny(text: string, patterns: string[]): boolean {
    const ms = new Multisearch(patterns)
    return ms.containsAny(text)
  }
}

export type { MultisearchMatch } from './types.js'
