import type { BoyerMooreOptions } from './types.js'
import { DEFAULT_BOYER_MOORE_OPTIONS } from './types.js'

export class BoyerMoore {
  private _pattern: string
  private _originalPattern: string
  private _caseSensitive: boolean
  private _badCharTable: Map<string, number>
  private _goodSuffixTable: number[]

  constructor(pattern: string, options?: Partial<BoyerMooreOptions>) {
    const opts: BoyerMooreOptions = { ...DEFAULT_BOYER_MOORE_OPTIONS, ...options }
    this._caseSensitive = opts.caseSensitive
    this._originalPattern = pattern
    this._pattern = this._caseSensitive ? pattern : pattern.toLowerCase()
    this._badCharTable = new Map()
    this._goodSuffixTable = []
    this._buildTables()
  }

  private _buildTables(): void {
    this._buildBadCharTable()
    this._buildGoodSuffixTable()
  }

  private _buildBadCharTable(): void {
    this._badCharTable = new Map()
    const m = this._pattern.length
    for (let i = 0; i < m - 1; i++) {
      const char = this._pattern[i]!
      this._badCharTable.set(char, m - 1 - i)
    }
  }

  private _buildGoodSuffixTable(): void {
    const m = this._pattern.length
    const table = new Array<number>(m + 1).fill(m)
    const lastOcc = new Array<number>(m + 1).fill(0)

    lastOcc[0] = 0
    let i = m
    let j = m + 1
    const f = new Array<number>(m + 1).fill(0)
    f[i] = j

    while (i > 0) {
      while (j <= m && this._pattern[i - 1] !== this._pattern[j - 1]) {
        if (table[j] === m) {
          table[j] = j - i
        }
        j = f[j]!
      }
      i--
      j--
      f[i] = j
    }

    j = f[0]!
    for (i = 0; i <= m; i++) {
      if (table[i] === m) {
        table[i] = j
      }
      if (i === j) {
        j = f[j]!
      }
    }

    this._goodSuffixTable = table
  }

  private _getBadCharShift(char: string): number {
    const m = this._pattern.length
    return this._badCharTable.get(char) ?? m
  }

  search(text: string): number {
    if (this._pattern.length === 0) return 0
    if (text.length === 0 || text.length < this._pattern.length) return -1

    const input = this._caseSensitive ? text : text.toLowerCase()
    const m = this._pattern.length
    const n = input.length

    let s = 0
    while (s <= n - m) {
      let j = m - 1
      while (j >= 0 && this._pattern[j] === input[s + j]) {
        j--
      }
      if (j < 0) {
        return s
      }
      const badShift = Math.max(1, this._getBadCharShift(input[s + j]!) - (m - 1 - j))
      const goodShift = this._goodSuffixTable[j + 1]!
      s += Math.max(badShift, goodShift)
    }

    return -1
  }

  searchAll(text: string): number[] {
    if (this._pattern.length === 0) {
      const indices: number[] = []
      for (let i = 0; i <= text.length; i++) {
        indices.push(i)
      }
      return indices
    }
    if (text.length === 0 || text.length < this._pattern.length) return []

    const input = this._caseSensitive ? text : text.toLowerCase()
    const m = this._pattern.length
    const n = input.length
    const results: number[] = []

    let s = 0
    while (s <= n - m) {
      let j = m - 1
      while (j >= 0 && this._pattern[j] === input[s + j]) {
        j--
      }
      if (j < 0) {
        results.push(s)
        s += m
      } else {
        const badShift = Math.max(1, this._getBadCharShift(input[s + j]!) - (m - 1 - j))
        const goodShift = this._goodSuffixTable[j + 1]!
        s += Math.max(badShift, goodShift)
      }
    }

    return results
  }

  count(text: string): number {
    return this.searchAll(text).length
  }

  contains(text: string): boolean {
    return this.search(text) !== -1
  }

  getPattern(): string {
    return this._originalPattern
  }

  setPattern(pattern: string): void {
    this._originalPattern = pattern
    this._pattern = this._caseSensitive ? pattern : pattern.toLowerCase()
    this._buildTables()
  }

  static search(text: string, pattern: string): number {
    const bm = new BoyerMoore(pattern)
    return bm.search(text)
  }

  static searchAll(text: string, pattern: string): number[] {
    const bm = new BoyerMoore(pattern)
    return bm.searchAll(text)
  }

  static count(text: string, pattern: string): number {
    const bm = new BoyerMoore(pattern)
    return bm.count(text)
  }

  static contains(text: string, pattern: string): boolean {
    const bm = new BoyerMoore(pattern)
    return bm.contains(text)
  }
}

export { DEFAULT_BOYER_MOORE_OPTIONS } from './types.js'
export type { BoyerMooreOptions } from './types.js'
