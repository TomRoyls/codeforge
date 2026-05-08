import type { SuffixArrayOptions } from './types.js'
import { DEFAULT_SUFFIX_ARRAY_OPTIONS } from './types.js'

export class SuffixArray {
  private _text: string
  private _normalized: string
  private _suffixArray: number[]
  private _caseSensitive: boolean

  constructor(text: string, options?: Partial<SuffixArrayOptions>) {
    const opts: SuffixArrayOptions = { ...DEFAULT_SUFFIX_ARRAY_OPTIONS, ...options }
    this._text = text
    this._caseSensitive = opts.caseSensitive
    this._normalized = this._caseSensitive ? text : text.toLowerCase()
    this._suffixArray = this._buildSuffixArray(this._normalized)
  }

  private _buildSuffixArray(text: string): number[] {
    const n = text.length
    if (n === 0) return []

    const sa = Array.from({ length: n }, (_, i) => i)
    const rank = new Array<number>(n)
    const tmp = new Array<number>(n)

    for (let i = 0; i < n; i++) {
      rank[i] = text.charCodeAt(i)
    }

    for (let k = 1; k < n; k *= 2) {
      const currentK = k
      const currentRank = [...rank]

      sa.sort((a: number, b: number): number => {
        if (currentRank[a] !== currentRank[b]) return currentRank[a]! - currentRank[b]!
        const ra = a + currentK < n ? currentRank[a + currentK] : -1
        const rb = b + currentK < n ? currentRank[b + currentK] : -1
        return (ra ?? -1) - (rb ?? -1)
      })

      tmp[sa[0]!] = 0
      for (let i = 1; i < n; i++) {
        const prev = sa[i - 1]!
        const curr = sa[i]!
        const sameRank = currentRank[prev] === currentRank[curr]
        const prevNext = prev + currentK < n ? currentRank[prev + currentK] : -1
        const currNext = curr + currentK < n ? currentRank[curr + currentK] : -1
        tmp[curr] = sameRank && prevNext === currNext ? tmp[prev]! : tmp[prev]! + 1
      }

      for (let i = 0; i < n; i++) {
        rank[i] = tmp[i]!
      }

      if (rank[sa[n - 1]!] === n - 1) break
    }

    return sa
  }

  search(pattern: string): number[] {
    if (pattern.length === 0) return []
    const normPattern = this._caseSensitive ? pattern : pattern.toLowerCase()
    const n = this._normalized.length
    const m = normPattern.length
    if (m > n) return []

    const results: number[] = []
    let lo = 0
    let hi = n - 1
    let first = -1

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const suffixIdx = this._suffixArray[mid]!
      const cmp = this._compareAt(suffixIdx, normPattern)
      if (cmp === 0) {
        first = mid
        hi = mid - 1
      } else if (cmp < 0) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    if (first === -1) return results

    lo = 0
    hi = n - 1
    let last = -1

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const suffixIdx = this._suffixArray[mid]!
      const cmp = this._compareAt(suffixIdx, normPattern)
      if (cmp === 0) {
        last = mid
        lo = mid + 1
      } else if (cmp < 0) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    for (let i = first; i <= last; i++) {
      results.push(this._suffixArray[i]!)
    }

    return results.sort((a, b) => a - b)
  }

  private _compareAt(suffixStart: number, pattern: string): number {
    for (let i = 0; i < pattern.length; i++) {
      const idx = suffixStart + i
      if (idx >= this._normalized.length) return -1
      const tc = this._normalized.charCodeAt(idx)
      const pc = pattern.charCodeAt(i)
      if (tc !== pc) return tc - pc
    }
    return 0
  }

  contains(pattern: string): boolean {
    return this.search(pattern).length > 0
  }

  count(pattern: string): number {
    return this.search(pattern).length
  }

  longestCommonPrefix(): number[] {
    const n = this._normalized.length
    if (n === 0) return []

    const lcp = new Array<number>(n).fill(0)
    const invSa = new Array<number>(n)

    for (let i = 0; i < n; i++) {
      invSa[this._suffixArray[i]!] = i
    }

    let k = 0
    for (let i = 0; i < n; i++) {
      const invIdx = invSa[i]!
      if (invIdx === 0) {
        k = 0
        continue
      }
      const j = this._suffixArray[invIdx - 1]!
      while (
        i + k < n &&
        j + k < n &&
        this._normalized[i + k] === this._normalized[j + k]
      ) {
        k++
      }
      lcp[invIdx] = k
      if (k > 0) k--
    }

    return lcp
  }

  longestRepeatedSubstring(): string {
    const lcp = this.longestCommonPrefix()
    let maxLen = 0
    let maxIdx = -1

    for (let i = 1; i < lcp.length; i++) {
      if (lcp[i]! > maxLen) {
        maxLen = lcp[i]!
        maxIdx = this._suffixArray[i]!
      }
    }

    if (maxLen === 0) return ''
    return this._text.slice(maxIdx, maxIdx + maxLen)
  }

  getSuffix(index: number): string {
    if (index < 0 || index >= this._suffixArray.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._suffixArray.length - 1}]`)
    }
    const start = this._suffixArray[index]!
    return this._text.slice(start)
  }

  getArray(): number[] {
    return [...this._suffixArray]
  }

  getText(): string {
    return this._text
  }

  length(): number {
    return this._suffixArray.length
  }

  isEmpty(): boolean {
    return this._suffixArray.length === 0
  }
}

export { DEFAULT_SUFFIX_ARRAY_OPTIONS } from './types.js'
export type { SuffixArrayOptions, MatchResult } from './types.js'
