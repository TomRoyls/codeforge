import type { KMP2DResult } from './types.js'

export class KMP2D {
  private _pattern: string[]
  private _verticalFailure: number[]

  constructor(pattern: string[]) {
    this._pattern = [...pattern]
    this._verticalFailure = []
    this._buildVerticalFailure()
  }

  private _buildVerticalFailure(): void {
    const m = this._pattern.length
    if (m === 0) {
      this._verticalFailure = []
      return
    }
    const pi = new Array<number>(m).fill(0)
    for (let i = 1; i < m; i++) {
      let j = pi[i - 1]!
      while (j > 0 && this._pattern[i] !== this._pattern[j]) {
        j = pi[j - 1]!
      }
      if (this._pattern[i] === this._pattern[j]) {
        j++
      }
      pi[i] = j
    }
    this._verticalFailure = pi
  }

  private _searchCore(text: string[], firstOnly: boolean): KMP2DResult[] {
    const pRows = this._pattern.length
    if (pRows === 0) return []
    const pCols = this._pattern[0]!.length
    if (pCols === 0) return []

    const tRows = text.length
    if (tRows === 0 || tRows < pRows) return []
    const tCols = text[0]!.length
    if (tCols < pCols) return []

    const results: KMP2DResult[] = []

    for (let c = 0; c <= tCols - pCols; c++) {
      let k = 0
      for (let r = 0; r < tRows; r++) {
        const textSlice = text[r]!.substring(c, c + pCols)
        while (k > 0 && textSlice !== this._pattern[k]) {
          k = this._verticalFailure[k - 1]!
        }
        if (textSlice === this._pattern[k]) {
          k++
        }
        if (k === pRows) {
          results.push({ row: r - pRows + 1, col: c })
          if (firstOnly) return results
          k = this._verticalFailure[k - 1]!
        }
      }
    }

    return results
  }

  search(text: string[]): KMP2DResult[] {
    return this._searchCore(text, false)
  }

  searchFirst(text: string[]): KMP2DResult | undefined {
    const results = this._searchCore(text, true)
    return results.length > 0 ? results[0] : undefined
  }

  count(text: string[]): number {
    return this.search(text).length
  }

  contains(text: string[]): boolean {
    return this.searchFirst(text) !== undefined
  }

  getPattern(): string[] {
    return [...this._pattern]
  }

  setPattern(pattern: string[]): void {
    this._pattern = [...pattern]
    this._buildVerticalFailure()
  }

  static search(text: string[], pattern: string[]): KMP2DResult[] {
    const kmp = new KMP2D(pattern)
    return kmp.search(text)
  }

  static searchFirst(text: string[], pattern: string[]): KMP2DResult | undefined {
    const kmp = new KMP2D(pattern)
    return kmp.searchFirst(text)
  }

  static count(text: string[], pattern: string[]): number {
    const kmp = new KMP2D(pattern)
    return kmp.count(text)
  }

  static contains(text: string[], pattern: string[]): boolean {
    const kmp = new KMP2D(pattern)
    return kmp.contains(text)
  }
}

export type { KMP2DResult } from './types.js'
